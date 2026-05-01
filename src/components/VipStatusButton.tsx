import { Crown, Copy } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { VipModal } from "./VipModal";
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

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display tracking-widest border transition-all ${
          isVip
            ? "border-amber-400/40 text-amber-400 bg-amber-400/5 hover:bg-amber-400/10"
            : "border-white/15 text-white/70 bg-white/5 hover:bg-white/10"
        }`}
      >
        <Crown className="h-3.5 w-3.5" />
        {isVip ? "VIP" : "ODDIY"}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm bg-[#0A0F1E]/95 border-white/10 backdrop-blur-xl">
          <div className="flex flex-col items-center text-center pt-2">
            <div
              className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-3 border ${
                isVip
                  ? "bg-amber-400/10 border-amber-400/30"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <Crown className={`h-7 w-7 ${isVip ? "text-amber-400" : "text-white/60"}`} />
            </div>
            <h3 className="font-display text-lg tracking-widest text-white">
              {isVip ? "VIP STATUS" : "ODDIY FOYDALANUVCHI"}
            </h3>

            {isVip && vipDaysLeft !== null && (
              <p className="text-sm text-white/70 mt-2">
                Sizning VIP obunangiz{" "}
                <span className="text-amber-400 font-semibold">{vipDaysLeft}</span> kundan keyin tugaydi.
              </p>
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
