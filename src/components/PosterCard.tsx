import { Content } from "@/lib/types";

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

export const PosterCard = ({ content, onClick }: Props) => {
  // Stable per-card accent using id hash
  const seed = content.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const accent = ACCENTS[seed % ACCENTS.length];

  return (
    <button
      onClick={onClick}
      className="group relative aspect-[9/16] w-full rounded-xl overflow-hidden glass transition-all duration-500 hover:scale-[1.04] focus:outline-none"
      style={{
        // Soft breathing backlight per card
        boxShadow: `0 0 0px ${accent}`,
      }}
    >
      {/* Backlight halo */}
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
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-90" />
      <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3 text-left">
        <div className="font-display text-xs sm:text-sm font-bold text-foreground line-clamp-2 leading-tight">
          {content.title}
        </div>
        {content.genre?.length > 0 && (
          <div
            className="text-[10px] truncate mt-1"
            style={{ color: accent, textShadow: `0 0 6px ${accent}` }}
          >
            {content.genre.slice(0, 2).join(" • ")}
          </div>
        )}
      </div>
      <div
        className="absolute inset-0 ring-1 ring-inset rounded-xl transition-all duration-500"
        style={{
          // Hover ring uses card's accent
          boxShadow: `inset 0 0 0 1px ${accent.replace(")", " / 0.0)")}`,
        }}
      />
    </button>
  );
};
