import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Crown,
  Download,
  Clock,
  MonitorPlay,
  ImagePlus,
  Vote,
  BadgeCheck,
  Send,
} from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const PERKS = [
  { icon: Clock, title: "Erta kirish", desc: "Yangi epizodlarni hammadan oldin ko'ring" },
  { icon: Download, title: "Yuklab olish", desc: "Cheksiz yuklab olish imkoniyati" },
  { icon: MonitorPlay, title: "4K sifat", desc: "Eng yuqori sifatdagi video va 2-server" },
  { icon: ImagePlus, title: "Profil rasmi", desc: "O'z rasmingizni profilga qo'ying" },
  { icon: Vote, title: "Ovoz berish", desc: "Keyingi loyihani siz tanlaysiz" },
  { icon: BadgeCheck, title: "VIP nishon", desc: "Ism yoningizda oltin VIP badge" },
];

export const VipModal = ({ open, onOpenChange }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-sm border-0 p-0 overflow-hidden"
        style={{
          background: "linear-gradient(165deg, hsl(226 50% 9%) 0%, hsl(35 35% 11%) 100%)",
          border: "1px solid hsl(45 95% 55% / 0.35)",
          boxShadow: "0 0 40px -10px hsl(45 95% 55% / 0.45)",
        }}
      >
        <div className="max-h-[80vh] overflow-y-auto scrollbar-hide px-5 pb-5 pt-6">
          <div className="flex flex-col items-center text-center">
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center mb-3 border border-amber-400/40"
              style={{ background: "linear-gradient(135deg, hsl(45 95% 55% / 0.22), hsl(35 100% 50% / 0.12))" }}
            >
              <Crown className="h-7 w-7 text-amber-400 drop-shadow-[0_0_8px_hsl(45_95%_60%/0.7)]" />
            </div>

            <h2
              className="font-display text-xl tracking-[0.2em]"
              style={{
                background: "linear-gradient(135deg, hsl(45 95% 62%), hsl(35 100% 52%))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              VIP OBUNA
            </h2>
            <p className="text-xs text-foreground/55 mt-2 max-w-[16rem] leading-relaxed">
              VIP obuna sizga quyidagi barcha imkoniyatlarni ochib beradi:
            </p>
          </div>

          <div className="mt-5 space-y-2">
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-3 px-3 py-2.5 rounded-xl border border-amber-400/15 bg-amber-400/[0.04]"
              >
                <span className="mt-0.5 h-7 w-7 shrink-0 rounded-lg bg-amber-400/12 border border-amber-400/25 flex items-center justify-center">
                  <Icon className="h-3.5 w-3.5 text-amber-400" />
                </span>
                <div className="text-left min-w-0">
                  <div className="font-display text-[11px] tracking-widest text-amber-300">
                    {title.toUpperCase()}
                  </div>
                  <div className="text-[11px] text-foreground/60 leading-snug mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <a
            href="https://t.me/ZeiContactBot"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 w-full inline-flex items-center justify-center gap-2 h-12 rounded-full text-[#1a0f00] font-display text-xs tracking-[0.18em] hover:scale-[1.02] active:scale-95 transition-transform"
            style={{
              background: "linear-gradient(135deg, hsl(45 95% 58%), hsl(35 100% 50%))",
              boxShadow: "0 0 20px hsl(45 95% 55% / 0.45)",
            }}
          >
            <Send className="h-4 w-4" />
            SOTIB OLISH — @ZeiContactBot
          </a>

          <button
            onClick={() => onOpenChange(false)}
            className="mt-3 w-full text-[10px] text-foreground/35 hover:text-foreground/70 tracking-[0.2em] font-display transition-colors"
          >
            KEYINROQ
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
