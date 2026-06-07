import { Content } from "@/lib/types";

interface Props {
  content: Content;
  onClick: () => void;
}

export const PosterCard = ({ content, onClick }: Props) => {
  const rating = content.rating ?? 0;

  // Neon-themed rating tier
  const ratingStyle =
    rating >= 8
      ? "text-[hsl(var(--neon))] border-[hsl(var(--neon))]/60 shadow-[0_0_10px_hsl(var(--neon)/0.6)]"
      : rating >= 6.5
      ? "text-emerald-300 border-emerald-400/50 shadow-[0_0_8px_rgb(52_211_153_/_0.5)]"
      : rating >= 5
      ? "text-amber-300 border-amber-400/50 shadow-[0_0_8px_rgb(251_191_36_/_0.45)]"
      : rating > 0
      ? "text-zinc-300 border-zinc-400/40"
      : "";

  return (
    <button
      onClick={onClick}
      className="group flex flex-col text-left w-full focus:outline-none"
    >
      <div
        className="relative w-full overflow-hidden rounded-xl bg-secondary ring-1 ring-white/5 transition-all duration-500 ease-out group-hover:scale-[1.04] group-hover:shadow-[0_0_22px_hsl(var(--neon)/0.55),0_0_55px_hsl(var(--neon-purple)/0.35)] group-hover:ring-neon/60"
        style={{ aspectRatio: "2 / 3" }}
      >
        {content.poster_url ? (
          <img
            src={content.poster_url}
            alt={content.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary to-background">
            <span className="font-display text-xs text-foreground/70 px-3 text-center">
              {content.title}
            </span>
          </div>
        )}

        {/* Bottom gradient for legibility */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/80 to-transparent" />

        {/* Neon rating badge */}
        {rating > 0 && (
          <div
            className={`absolute top-2 left-2 ${ratingStyle} bg-background/70 backdrop-blur-md border text-[11px] font-bold px-1.5 py-0.5 rounded-md tabular-nums`}
          >
            {rating.toFixed(1)}
          </div>
        )}
      </div>

      {/* Title below poster */}
      <div className="mt-2 px-0.5">
        <div className="text-[13px] sm:text-sm font-semibold text-foreground line-clamp-2 leading-snug min-h-[2.6em] break-words">
          {content.title}
        </div>
        {content.year && (
          <div className="text-[11px] text-foreground/50 mt-0.5">
            {content.year}
          </div>
        )}
      </div>
    </button>
  );
};
