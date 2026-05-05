import { Crown, Copy, Sparkles } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { VipModal } from "./VipModal";
import { VipBadge } from "./VipBadge";
import { toast } from "sonner";

export const VipStatusButton = () => {
  const { profile, isVip, vipDaysLeft } = useAuth();
  const [open, setOpen] = useState(false);
  const [vipModal, setVipModal] = useState(false);

  if (!profile) return null;

  const copyId = () => {
    navigator.clipboard.writeText(profile.public_id);
    toast.success("ID nusxalandi");
  };

  // Progress bar: how many days left out of 30 (visual cap)
  const totalDays = 30;
  const pct = vipDaysLeft != null ? Math.max(4, Math.min(100, (vipDaysLeft / totalDays) * 100)) : 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display tracking-widest border transition-all ${
          isVip
            ? "vip-badge border-amber-400/60 text-[#1a0f00]"
            : "border-white/15 text-white/70 bg-white/5 hover:bg-white/10"
        }`}
        style={
          isVip
            ? { background: "linear-gradient(135deg, hsl(45 95% 55%), hsl(35 100% 50%))" }
            : undefined
        }
      >
        <Crown className="h-3.5 w-3.5" />
        {isVip ? "VIP" : "ODDIY"}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-sm border-white/10 backdrop-blur-xl"
          style={{
            background: isVip
              ? "linear-gradient(160deg, hsl(226 50% 9%) 0%, hsl(35 30% 12%) 100%)"
              : "hsl(226 50% 9% / 0.96)",
            border: isVip ? "1px solid hsl(45 95% 55% / 0.35)" : undefined,
          }}
        >
          <div className="flex flex-col items-center text-center pt-2">
            <div
              className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-3 border ${
                isVip
                  ? "border-amber-400/40"
                  : "bg-white/5 border-white/10"
              }`}
              style={
                isVip
                  ? { background: "linear-gradient(135deg, hsl(45 95% 55% / 0.2), hsl(35 100% 50% / 0.15))" }
                  : undefined
              }
            >
              <Crown className={`h-8 w-8 ${isVip ? "text-amber-400 drop-shadow-[0_0_8px_hsl(45_95%_60%/0.7)]" : "text-white/60"}`} />
            </div>

            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg tracking-widest text-white">
                {isVip ? "VIP STATUS" : "ODDIY FOYDALANUVCHI"}
              </h3>
              {isVip && <VipBadge size="md" />}
            </div>

            {isVip && vipDaysLeft !== null && profile.vip_until && (
              <div className="w-full mt-5">
                <div className="flex items-center justify-between text-[10px] font-display tracking-widest text-white/60 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-amber-400" /> VIP OBUNA
                  </span>
                  <span className="text-amber-400">{vipDaysLeft} kun qoldi</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden border border-amber-400/20">
                  <div
                    className="h-full vip-progress rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[11px] text-white/55 mt-2">
                  Tugash sanasi:{" "}
                  <span className="text-amber-300">
                    {new Date(profile.vip_until).toLocaleDateString()}
                  </span>
                </p>
              </div>
            )}

            {!isVip && (
              <p className="text-sm text-white/60 mt-2 max-w-xs">
                Sizda VIP yo'q. Yuklab olish va qo'shimcha imkoniyatlar uchun obuna bo'ling.
              </p>
            )}

            <div className="w-full mt-5 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[10px] font-display tracking-widest text-white/50">
                SIZNING ID
              </div>
              <div className="flex items-center justify-between gap-2 mt-1">
                <div className="font-mono text-lg tracking-wider text-white">
                  {profile.public_id}
                </div>
                <button
                  onClick={copyId}
                  className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="ID nusxalash"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <div className="text-[10px] text-white/40 mt-1">
                Bu ID ni adminga yuboring — VIP berishi uchun
              </div>
            </div>

            {!isVip && (
              <button
                onClick={() => {
                  setOpen(false);
                  setVipModal(true);
                }}
                className="mt-4 w-full h-10 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-[#0A0F1E] font-display text-xs tracking-widest hover:scale-[1.02] active:scale-95 transition-transform"
              >
                VIP BO'LISH
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <VipModal open={vipModal} onOpenChange={setVipModal} />
    </>
  );
};
