import { Content } from "@/lib/types";
import { Star, Eye, Calendar } from "lucide-react";

interface Props {
  content: Content;
  onClick: () => void;
}

const ACCENTS = [
  "hsl(var(--neon))",
  "hsl(var(--neon-purple))",
  "hsl(var(--neon-pink))",
  "hsl(var(--neon-cyan))",
];

const formatViews = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
};

export const PosterCard = ({ content, onClick }: Props) => {
  const seed = content.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const accent = ACCENTS[seed % ACCENTS.length];

  return (
    <button
      onClick={onClick}
      className="group relative aspect-[9/16] w-full rounded-xl overflow-hidden glass transition-all duration-500 hover:scale-[1.04] focus:outline-none"
    >
      <div
        aria-hidden
        className="absolute -inset-2 -z-10 opacity-40 group-hover:opacity-90 transition-opacity duration-500 rounded-2xl pointer-events-none animate-breathing"
        style={{
          background: `radial-gradient(60% 60% at 50% 50%, ${accent.replace(")", " / 0.55)")}, transparent 70%)`,
          filter: "blur(20px)",
        }}
      />

      {content.poster_url ? (
        <img
          src={content.poster_url}
          alt={content.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-secondary to-background flex items-center justify-center">
          <span className="font-display text-xs neon-text px-3 text-center">{content.title}</span>
        </div>
      )}

      {/* Top-right rating badge */}
      {content.rating != null && content.rating > 0 && (
        <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-background/70 backdrop-blur-sm text-[10px] font-display">
          <Star className="h-2.5 w-2.5 fill-neon text-neon" />
          <span className="text-foreground">{content.rating.toFixed(1)}</span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-95" />

      <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3 text-left">
        <div className="font-display text-xs sm:text-sm font-bold text-foreground line-clamp-2 leading-tight">
          {content.title}
        </div>
        <div className="flex items-center gap-2 mt-1 text-[9px] text-foreground/60">
          {content.year && (
            <span className="flex items-center gap-0.5">
              <Calendar className="h-2.5 w-2.5" />
              {content.year}
            </span>
          )}
          {content.views > 0 && (
            <span className="flex items-center gap-0.5">
              <Eye className="h-2.5 w-2.5" />
              {formatViews(content.views)}
            </span>
          )}
        </div>
        {content.genre?.length > 0 && (
          <div
            className="text-[9px] truncate mt-0.5"
            style={{ color: accent, textShadow: `0 0 6px ${accent}` }}
          >
            {content.genre.slice(0, 2).join(" • ")}
          </div>
        )}
      </div>
    </button>
  );
};
