import { forwardRef } from "react";
import { Send, Instagram, Youtube, Music2, Globe } from "lucide-react";
import { useSiteSettings, type SocialPlatform } from "@/hooks/useSiteSettings";

const ICONS: Record<SocialPlatform, typeof Send> = {
  telegram: Send,
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Music2,
  website: Globe,
};

export const SocialLinks = ({ className = "" }: { className?: string }) => {
  const { settings } = useSiteSettings();
  const links = settings.social_links.filter((l) => l.url?.trim());
  if (links.length === 0) return null;

  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      {links.map((l, i) => {
        const Icon = ICONS[l.platform] ?? Globe;
        return (
          <a
            key={`${l.platform}-${i}`}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={l.label || l.platform}
            className="group"
          >
            <span className="h-11 w-11 rounded-full bg-foreground/5 backdrop-blur-md border border-border hover:border-neon/60 hover:bg-neon/10 flex items-center justify-center transition-all duration-200 group-hover:scale-110">
              <Icon className="h-5 w-5 text-foreground/70 group-hover:text-neon transition-colors" />
            </span>
          </a>
        );
      })}
    </div>
  );
};
