import { useRef } from "react";
import { Content } from "@/lib/types";
import { PosterCard } from "./PosterCard";
import { ChevronLeft, ChevronRight, Flame, Sparkles, Star } from "lucide-react";

const ICONS = { flame: Flame, sparkles: Sparkles, star: Star } as const;
export type RowIcon = keyof typeof ICONS;

interface Props {
  title: string;
  icon?: RowIcon;
  items: Content[];
  onSelect: (c: Content) => void;
}

export const ContentRow = ({ title, icon, items, onSelect }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const Icon = icon ? ICONS[icon] : null;

  if (items.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const w = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === "left" ? -w : w, behavior: "smooth" });
  };

  return (
    <section className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between px-1 pb-2 relative">
        <h2 className="font-display text-base sm:text-base tracking-widest text-foreground/90 flex items-center gap-2">
          {Icon && (
            <span className="group/icon inline-flex text-neon">
              <Icon className="h-4 w-4 transition-transform duration-300 group-hover/icon:scale-125 group-hover/icon:rotate-6" />
            </span>
          )}
          {title}
        </h2>
        <span
          aria-hidden
          className="absolute left-1 right-1 bottom-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, hsl(var(--neon) / 0.5), hsl(var(--neon) / 0.05) 60%, transparent)",
            boxShadow: "0 0 8px hsl(var(--neon) / 0.35)",
          }}
        />
        <div className="hidden sm:flex items-center gap-1">
          <button
            onClick={() => scroll("left")}
            className="h-8 w-8 rounded-full glass flex items-center justify-center text-neon hover:neon-glow-sm transition-all"
            aria-label="Chap"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="h-8 w-8 rounded-full glass flex items-center justify-center text-neon hover:neon-glow-sm transition-all"
            aria-label="O'ng"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
      >
        {items.map((c) => (
          <div
            key={c.id}
            className="shrink-0 snap-start w-[46%] sm:w-[28%] md:w-[22%] lg:w-[17%] xl:w-[14%]"
          >
            <PosterCard content={c} onClick={() => onSelect(c)} />
          </div>
        ))}
      </div>
    </section>
  );
};
