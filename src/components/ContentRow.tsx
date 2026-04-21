import { useRef } from "react";
import { Content } from "@/lib/types";
import { PosterCard } from "./PosterCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  title: string;
  icon?: string;
  items: Content[];
  onSelect: (c: Content) => void;
}

export const ContentRow = ({ title, icon, items, onSelect }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const w = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === "left" ? -w : w, behavior: "smooth" });
  };

  return (
    <section className="space-y-2 sm:space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-display text-sm sm:text-base tracking-widest text-foreground/90 flex items-center gap-2">
          {icon && <span className="text-base">{icon}</span>}
          {title}
        </h2>
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
            className="shrink-0 snap-start w-[42%] sm:w-[28%] md:w-[22%] lg:w-[17%] xl:w-[14%]"
          >
            <PosterCard content={c} onClick={() => onSelect(c)} />
          </div>
        ))}
      </div>
    </section>
  );
};
