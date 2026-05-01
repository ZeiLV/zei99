import { Content } from "@/lib/types";

interface Props {
  content: Content;
  onClick: () => void;
}

export const PosterCard = ({ content, onClick }: Props) => {
  const rating = content.rating ?? 0;
  // Green if rating >= 7, gray otherwise (Kinopoisk style)
  const ratingBg =
    rating >= 7
      ? "bg-emerald-500"
      : rating >= 5
      ? "bg-amber-500"
      : rating > 0
      ? "bg-zinc-500"
      : "";

  return (
    <button
      onClick={onClick}
      className="group flex flex-col text-left w-full focus:outline-none"
    >
      <div className="relative w-full overflow-hidden rounded-xl bg-secondary" style={{ aspectRatio: "9 / 16" }}>
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

        {/* Rating tag — top-left, Kinopoisk-style */}
        {rating > 0 && (
          <div
            className={`absolute top-2 left-2 ${ratingBg} text-white text-[11px] font-bold px-1.5 py-0.5 rounded-md tabular-nums shadow-md`}
          >
            {rating.toFixed(1)}
          </div>
        )}
      </div>

      {/* Title below poster */}
      <div className="mt-2 px-0.5">
        <div className="text-[13px] sm:text-sm font-semibold text-foreground line-clamp-2 leading-snug">
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
