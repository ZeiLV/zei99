import { SocialLinks } from "./SocialLinks";

export const Footer = () => (
  <footer className="px-[15px] sm:px-8 max-w-[1440px] mx-auto pb-10 pt-4">
    <div className="glass rounded-2xl px-5 py-6 flex flex-col items-center gap-5">
      <SocialLinks />
      <div className="text-center text-[11px] sm:text-xs leading-relaxed text-foreground/60 font-light max-w-md">
        <p>© 2025 Zei Projection. Barcha huquqlar himoyalangan.</p>
        <p className="mt-1">Xavfsizlik Zei Projection tomonidan kafolatlangan.</p>
        <p className="mt-1">
          Ushbu streaming platforma{" "}
          <a
            href="https://t.me/ZeiContactBot"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neon hover:text-neon-soft transition-colors font-medium neon-text"
          >
            @ZeiContactBot
          </a>{" "}
          tomonidan yaratildi.
        </p>
      </div>
    </div>
  </footer>
);
