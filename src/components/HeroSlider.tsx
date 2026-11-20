import { useEffect, useState } from "react";
import { Bookmark, Check, ChevronLeft, ChevronRight, Play, Star } from "lucide-react";
import { Content } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useSavedTitles } from "@/hooks/useSavedTitles";

export const HeroSlider = ({ items, onSelect }: { items: Content[]; onSelect: (content: Content) => void }) => {
  const slides = items.slice(0, 8);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchX, setTouchX] = useState<number | null>(null);
  const { ids, toggle } = useSavedTitles();
  useEffect(() => {
    if (paused || slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex(i => (i + 1) % slides.length), 6500);
    return () => clearInterval(timer);
  }, [slides.length, paused]);
  const slide = slides[index % slides.length];
  if (!slide) return null;
  const next = (direction: number) => setIndex(i => (i + direction + slides.length) % slides.length);
  const saved = ids.includes(slide.id);
  return (
    <section aria-label="Tavsiya etilganlar" className="app-feature relative mt-4 overflow-hidden bg-secondary" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)} onTouchStart={e => setTouchX(e.touches[0]?.clientX ?? null)} onTouchEnd={e => { const end = e.changedTouches[0]?.clientX; if (touchX !== null && end !== undefined && Math.abs(end - touchX) > 50) next(end < touchX ? 1 : -1); setTouchX(null); }}>
      {(slide.banner_url || slide.poster_url) && <img key={slide.id} src={slide.banner_url || slide.poster_url || ""} alt={slide.title} className="app-feature-image absolute inset-0 h-full w-full object-cover" fetchPriority="high" />}
      <div className="app-feature-shade absolute inset-0" />
      <div className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-end px-5 pb-12 pt-20 sm:px-8 sm:pb-16">
        <div key={slide.id} className="animate-fade-up max-w-xl">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold"><span className="rounded bg-primary px-2.5 py-1 text-primary-foreground">ZEI TANLOVI</span><span className="text-foreground/80">O‘zbek tilida</span></div>
          <h2 className="text-3xl sm:text-5xl font-bold leading-tight text-foreground break-words line-clamp-2">{slide.title}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-foreground/80">{!!slide.rating && <span className="flex items-center gap-1 text-vip"><Star className="h-3.5 w-3.5 fill-current" />{slide.rating.toFixed(1)}</span>}<span>{slide.year}</span><span>{slide.genre?.slice(0, 2).join(" / ")}</span></div>
          {slide.description && <p className="mt-3 hidden max-w-md text-sm leading-relaxed text-foreground/75 line-clamp-2 sm:block">{slide.description}</p>}
          <div className="mt-5 flex gap-2"><Button onClick={() => onSelect(slide)} className="h-11 rounded-full px-6 font-semibold"><Play className="fill-current" />Tomosha qilish</Button><Button variant="secondary" onClick={() => toggle(slide.id)} aria-pressed={saved} className="h-11 rounded-full border border-foreground/15 bg-background/60 px-4 hover:bg-secondary">{saved ? <Check /> : <Bookmark />}{saved ? "Saqlandi" : "Saqlash"}</Button></div>
        </div>
        <div className="absolute bottom-5 left-5 sm:left-8 flex gap-1.5">{slides.map((item, i) => <Button key={item.id} variant="ghost" onClick={() => setIndex(i)} aria-label={`${i + 1}-tavsiya`} aria-pressed={index % slides.length === i} className="h-5 w-7 p-0 hover:bg-transparent"><span className={`h-1 w-full rounded-full transition-colors ${index % slides.length === i ? "bg-primary" : "bg-foreground/25"}`} /></Button>)}</div>
        <div className="absolute bottom-4 right-5 flex gap-2"><Button variant="ghost" size="icon" onClick={() => next(-1)} aria-label="Oldingi tavsiya" className="h-8 w-8 rounded-full bg-background/50 hover:bg-secondary"><ChevronLeft /></Button><Button variant="ghost" size="icon" onClick={() => next(1)} aria-label="Keyingi tavsiya" className="h-8 w-8 rounded-full bg-background/50 hover:bg-secondary"><ChevronRight /></Button></div>
      </div>
    </section>
  );
};
