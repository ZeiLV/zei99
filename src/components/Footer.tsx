import { SocialLinks } from "./SocialLinks";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export const Footer = () => {
  const { settings } = useSiteSettings();
  if (!settings.footer_enabled) return null;

  return (
    <footer className="px-[15px] sm:px-8 max-w-[1440px] mx-auto pb-10 pt-4">
      <div className="glass rounded-2xl px-5 py-6 flex flex-col items-center gap-5">
        <SocialLinks />

        {settings.footer_links.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {settings.footer_links.map((l, i) => (
              <a
                key={i}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-full text-[11px] font-display tracking-widest border border-neon/30 text-neon/85 hover:bg-neon/10 hover:text-neon transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>
        )}

        <div className="text-center text-[11px] sm:text-xs leading-relaxed text-foreground/60 font-light max-w-md">
          <p>{settings.footer_text}</p>
          <p className="mt-1">Xavfsizlik Zei Dubbing tomonidan kafolatlangan.</p>
          <p className="mt-1">
            Ushbu streaming platforma{" "}
            <a
              href="https://t.me/ZeiContactBot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon hover:text-neon-soft transition-colors font-medium"
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
