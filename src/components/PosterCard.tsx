import { Bookmark, Star } from "lucide-react";
import { Content } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useSavedTitles } from "@/hooks/useSavedTitles";

interface Props { content: Content; onClick: () => void; }

export const PosterCard = ({ content, onClick }: Props) => {
  const { ids, toggle } = useSavedTitles();
  const saved = ids.includes(content.id);
  return (
    <article className="group relative min-w-0">
      <Button variant="ghost" onClick={onClick} aria-label={content.title} className="block h-auto w-full whitespace-normal p-0 text-left hover:bg-transparent hover:text-foreground">
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-secondary border border-border/60 transition-transform duration-300 group-hover:-translate-y-1">
          {content.poster_url ? <img src={content.poster_url} alt={content.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center p-3 text-muted-foreground">{content.title}</div>}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/80 to-transparent" />
          {!!content.rating && <span className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-background/90 px-2 py-1 text-xs font-semibold text-vip"><Star className="!h-3 !w-3 fill-current" />{content.rating.toFixed(1)}</span>}
          <span className="absolute bottom-2 left-2 rounded bg-background/80 px-2 py-1 text-[10px] font-medium text-foreground">{content.category === "anime" ? "ANIME" : content.category.toUpperCase()}</span>
        </div>
        <div className="mt-2.5 text-[13px] sm:text-sm font-semibold text-foreground line-clamp-2 min-h-[2.6em] leading-snug break-words">{content.title}</div>
        <div className="mt-1 text-[11px] text-muted-foreground">{[content.year, content.genre?.[0]].filter(Boolean).join(" · ")}</div>
      </Button>
      <Button variant="ghost" size="icon" aria-label={`${content.title}: ${saved ? "saqlanganlardan olib tashlash" : "saqlash"}`} aria-pressed={saved} onClick={() => toggle(content.id)} className={`absolute right-2 top-2 h-8 w-8 rounded-md bg-background/85 hover:bg-background ${saved ? "text-primary" : "text-foreground"}`}><Bookmark className={saved ? "fill-current" : ""} /></Button>
    </article>
  );
};
