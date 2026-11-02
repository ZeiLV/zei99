import { Content } from "@/lib/types";

interface Props {
  content: Content;
  onClick: () => void;
}

export const PosterCard = ({ content, onClick }: Props) => {
  const rating = content.rating ?? 0;

  // Soft rating tier — no glow
  const ratingStyle =
    rating >= 8
      ? "text-[hsl(var(--neon))] border-[hsl(var(--neon))]/40"
      : rating >= 6.5
      ? "text-emerald-300 border-emerald-400/40"
      : rating >= 5
      ? "text-amber-300 border-amber-400/40"
      : rating > 0
      ? "text-zinc-300 border-zinc-400/30"
      : "";

  return (
    <button
      onClick={onClick}
      className="group flex flex-col text-left w-full focus:outline-none"
    >
      <div
        className="relative w-full overflow-hidden rounded-2xl bg-secondary ring-1 ring-white/5 transition-all duration-300 ease-out group-hover:scale-[1.02] group-hover:shadow-[0_10px_28px_-10px_hsl(0_0%_0%/0.6)] group-hover:ring-white/15"
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

        {/* Soft rating badge */}
        {rating > 0 && (
          <div
            className={`absolute top-2 left-2 ${ratingStyle} bg-background/60 backdrop-blur-md border text-[11px] font-semibold px-1.5 py-0.5 rounded-lg tabular-nums`}
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
