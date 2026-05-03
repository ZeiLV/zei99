import { Send, Instagram } from "lucide-react";

const LINKS = [
  { href: "https://t.me/Zei_Dubbing", label: "Telegram", Icon: Send },
  { href: "https://www.instagram.com/zei_dubbing", label: "Instagram", Icon: Instagram },
];

export const SocialLinks = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center justify-center gap-4 ${className}`}>
    {LINKS.map(({ href, label, Icon }) => (
      <a
        key={label}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="group"
      >
        <span className="h-11 w-11 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:border-neon/60 hover:bg-white/10 flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:shadow-[0_0_18px_hsl(var(--neon)/0.45)]">
          <Icon className="h-5 w-5 text-white/85 group-hover:text-neon transition-colors" />
        </span>
      </a>
    ))}
  </div>
);
