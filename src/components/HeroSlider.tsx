import { useEffect, useRef, useState } from "react";
import { Content } from "@/lib/types";

interface Props {
  items: Content[];
  onSelect: (c: Content) => void;
}

const ACCENTS = [
  "hsl(var(--neon-cyan))",
  "hsl(var(--neon))",
  "hsl(var(--neon-purple))",
  "hsl(var(--neon-pink))",
];

const SWIPE_THRESHOLD = 50; // px

export const HeroSlider = ({ items, onSelect }: Props) => {
  const slides = items.slice(0, 10);
  const [idx, setIdx] = useState(0);
  const [dragPx, setDragPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const auto = useRef<number | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const pointerId = useRef<number | null>(null);
  const movedRef = useRef(false);
  const axisLocked = useRef<"x" | "y" | null>(null);

  const stopAuto = () => {
    if (auto.current) {
      window.clearInterval(auto.current);
      auto.current = null;
    }
  };

  const startAuto = () => {
    stopAuto();
    if (slides.length <= 1) return;
    auto.current = window.setInterval(() => {
      setIdx((i) => (i + 1) % slides.length);
    }, 5000);
  };

  useEffect(() => {
    startAuto();
    return stopAuto;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length]);

  if (slides.length === 0) return null;

  const accent = ACCENTS[idx % ACCENTS.length];

  const onPointerDown = (e: React.PointerEvent) => {
    if (slides.length <= 1) return;
    pointerId.current = e.pointerId;
    startX.current = e.clientX;
    startY.current = e.clientY;
    movedRef.current = false;
    axisLocked.current = null;
    setIsDragging(true);
    setDragPx(0);
    stopAuto();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (pointerId.current !== e.pointerId || !isDragging) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    if (!axisLocked.current) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      axisLocked.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (axisLocked.current === "y") return;

    movedRef.current = true;
    // capture so we keep receiving move/up
    try { (e.currentTarget as Element).setPointerCapture(e.pointerId); } catch {}
    if (e.cancelable) e.preventDefault();
    setDragPx(dx);
  };

  const finishDrag = (cancel = false) => {
    setIsDragging(false);
    pointerId.current = null;
    const width = containerRef.current?.clientWidth ?? 1;
    const dx = dragPx;
    setDragPx(0);
    if (!cancel && Math.abs(dx) > Math.min(SWIPE_THRESHOLD, width * 0.15)) {
      if (dx < 0) setIdx((i) => (i + 1) % slides.length);
      else setIdx((i) => (i - 1 + slides.length) % slides.length);
    }
    startAuto();
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (pointerId.current !== e.pointerId) return;
    finishDrag(false);
  };

  const onPointerCancel = () => finishDrag(true);

  const trackTranslatePct = -idx * 100;
  const dragOffsetPct = containerRef.current
    ? (dragPx / containerRef.current.clientWidth) * 100
    : 0;

  return (
    <section className="relative w-full max-w-[1440px] mx-auto px-[15px] sm:px-8 pt-24 sm:pt-28">
      {/* Ambient backlight matching active slide accent */}
      <div
        aria-hidden
        className="absolute inset-x-0 -top-4 h-[120%] -z-10 pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(60% 50% at 50% 30%, ${accent.replace(")", " / 0.45)")}, transparent 70%)`,
          filter: "blur(60px)",
        }}
      />

      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl glass-strong select-none"
        style={{
          boxShadow: `0 0 30px ${accent.replace(")", " / 0.35)")}, 0 0 80px ${accent.replace(")", " / 0.25)")}`,
          transition: "box-shadow 1s ease",
          touchAction: "pan-y",
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <div
          ref={trackRef}
          className="flex"
          style={{
            transform: `translateX(${trackTranslatePct + dragOffsetPct}%)`,
            transition: isDragging ? "none" : "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {slides.map((s) => {
            const img = s.banner_url || s.poster_url;
            return (
              <button
                key={s.id}
                onClick={(e) => {
                  if (movedRef.current) {
                    e.preventDefault();
                    e.stopPropagation();
                    movedRef.current = false;
                    return;
                  }
                  onSelect(s);
                }}
                className="relative shrink-0 w-full aspect-[16/10] sm:aspect-video bg-secondary overflow-hidden group"
                aria-label={s.title}
                draggable={false}
              >
                {img ? (
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 pointer-events-none"
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-secondary to-background" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-background/20 pointer-events-none" />
              </button>
            );
          })}
        </div>

        {/* Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setIdx(i);
                }}
                aria-label={`Slide ${i + 1}`}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === idx ? 24 : 6,
                  background: i === idx ? accent : "hsl(0 0% 100% / 0.35)",
                  boxShadow: i === idx ? `0 0 8px ${accent}` : "none",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
