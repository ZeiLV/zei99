import { SocialLinks } from "./SocialLinks";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export const Footer = () => {
  const { settings } = useSiteSettings();
  if (!settings.footer_enabled) return null;

  return (
    <footer className="px-[15px] sm:px-8 max-w-[1440px] mx-auto pb-8 pt-2">
      <div className="glass rounded-2xl px-4 py-5 sm:px-6 sm:py-6 flex flex-col items-center gap-4 border border-neon/15 shadow-[0_0_40px_-24px_hsl(var(--neon)/0.7)]">

        <SocialLinks />

        {settings.footer_links.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {settings.footer_links.map((l, i) => (
              <a
                key={i}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-full text-[11px] font-display tracking-widest border border-neon/30 text-neon/85 transition-all duration-300 hover:bg-neon/10 hover:text-neon hover:-translate-y-0.5 hover:border-neon/60 hover:shadow-[0_0_18px_-5px_hsl(var(--neon))] active:scale-95"
              >
                {l.label}
              </a>
            ))}
          </div>
        )}

        <div className="text-center text-[11px] sm:text-xs leading-snug text-foreground/55 font-light max-w-[340px] sm:max-w-md text-balance space-y-1">
          <p>{settings.footer_text}</p>
          <p>
            Ushbu streaming platforma{" "}
            <a
              href="https://t.me/ZeiContactBot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon hover:text-neon-soft transition-colors font-medium whitespace-nowrap"
            >
              @ZeiContactBot
            </a>{" "}
            tomonidan yaratildi.
          </p>
        </div>

      </div>
    </footer>
  );
};
