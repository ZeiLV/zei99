import { Send, Instagram, User } from "lucide-react";

const LINKS = [
  { href: "https://t.me/Zei_Dubbing", label: "Kanal", Icon: Send },
  { href: "https://www.instagram.com/zei_dubbing", label: "Insta", Icon: Instagram },
  { href: "https://t.me/ZeiContactBot", label: "Asoschi", Icon: User },
];

export const SocialLinks = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center justify-center gap-3 ${className}`}>
    {LINKS.map(({ href, label, Icon }) => (
      <a
        key={label}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="group flex flex-col items-center gap-1.5"
      >
        <span className="h-11 w-11 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/30 hover:bg-white/10 flex items-center justify-center transition-all duration-200 group-hover:scale-110">
          <Icon className="h-5 w-5 text-white/85 group-hover:text-white transition-colors" />
        </span>
        <span className="text-[10px] font-display tracking-widest text-white/50 group-hover:text-white/85 transition-colors">
          {label.toUpperCase()}
        </span>
      </a>
    ))}
  </div>
);
