import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Crown, Download, CheckCircle2, Sparkles } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const PERKS = [
  { icon: Download, text: "Cheksiz yuklab olish" },
  { icon: Sparkles, text: "Eng yangi epizodlar birinchi" },
  { icon: CheckCircle2, text: "Reklamalarsiz ko'rish" },
];

export const VipModal = ({ open, onOpenChange }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-[#0A0F1E]/95 border-white/10 backdrop-blur-xl">
        <div className="flex flex-col items-center text-center pt-2">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/30 flex items-center justify-center mb-4">
            <Crown className="h-7 w-7 text-amber-400" />
          </div>
          <h2 className="font-display text-xl tracking-widest text-white">VIP OBUNA</h2>
          <p className="text-sm text-white/60 mt-2 max-w-xs">
            Yuklab olish faqat VIP foydalanuvchilar uchun. Quyidagi tugma orqali obuna bo'ling.
          </p>

          <div className="w-full mt-5 space-y-2">
            {PERKS.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 border border-white/5"
              >
                <Icon className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-sm text-white/85 text-left">{text}</span>
              </div>
            ))}
          </div>

          <a
            href="https://t.me/m/QoYHq2A0Nzgy"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-[#0A0F1E] font-display text-sm tracking-widest hover:scale-[1.02] active:scale-95 transition-transform shadow-lg shadow-amber-500/20"
          >
            <Crown className="h-4 w-4" />
            VIP BO'LISH
          </a>

          <button
            onClick={() => onOpenChange(false)}
            className="mt-3 text-xs text-white/40 hover:text-white/70 tracking-widest font-display transition-colors"
          >
            KEYINROQ
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
