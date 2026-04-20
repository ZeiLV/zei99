import { Content } from "@/lib/types";

interface Props {
  content: Content;
  onClick: () => void;
}

export const PosterCard = ({ content, onClick }: Props) => {
  return (
    <button
      onClick={onClick}
      className="group relative aspect-[9/16] w-full rounded-xl overflow-hidden glass transition-all duration-500 hover:scale-[1.04] hover:neon-glow-md focus:outline-none focus:neon-glow-md"
    >
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
          <div className="text-[10px] text-neon/80 truncate mt-1">
            {content.genre.slice(0, 2).join(" • ")}
          </div>
        )}
      </div>
      <div className="absolute inset-0 ring-1 ring-inset ring-neon/0 group-hover:ring-neon/50 transition-all duration-500 rounded-xl" />
    </button>
  );
};
