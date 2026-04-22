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

export const HeroSlider = ({ items, onSelect }: Props) => {
  const slides = items.slice(0, 10);
  const [idx, setIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const auto = useRef<number | null>(null);

  useEffect(() => {
    if (slides.length <= 1) return;
    auto.current = window.setInterval(() => {
      setIdx((i) => (i + 1) % slides.length);
    }, 5000);
    return () => {
      if (auto.current) window.clearInterval(auto.current);
    };
  }, [slides.length]);

  if (slides.length === 0) return null;

  const accent = ACCENTS[idx % ACCENTS.length];

  return (
    <section className="relative w-full max-w-[1200px] mx-auto px-[15px] sm:px-6 pt-24 sm:pt-28">
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
        className="relative w-full overflow-hidden rounded-2xl glass-strong"
        style={{
          boxShadow: `0 0 30px ${accent.replace(")", " / 0.35)")}, 0 0 80px ${accent.replace(")", " / 0.25)")}`,
          transition: "box-shadow 1s ease",
        }}
      >
        <div
          ref={trackRef}
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${idx * 100}%)` }}
        >
          {slides.map((s) => {
            const img = s.banner_url || s.poster_url;
            return (
              <button
                key={s.id}
                onClick={() => onSelect(s)}
                className="relative shrink-0 w-full aspect-video bg-secondary overflow-hidden group"
                aria-label={s.title}
              >
                {img ? (
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-secondary to-background" />
                )}
                {/* subtle vignette only — no text */}
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
