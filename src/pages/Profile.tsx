import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Crown, Copy, LogOut, Shield, Vote, Send, ChevronRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { VipBadge } from "@/components/VipBadge";
import { VipModal } from "@/components/VipModal";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, isVip, vipDaysLeft, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [vipOpen, setVipOpen] = useState(false);

  const name = profile?.display_name || user?.email?.split("@")[0] || "Foydalanuvchi";
  const email = profile?.email || user?.email || "";
  const initial = name.charAt(0).toUpperCase();

  const rowCls =
    "w-full flex items-center justify-between gap-3 px-4 py-4 rounded-xl glass text-left text-sm text-foreground/85 hover:text-neon hover:border-neon/40 transition-all";

  return (
    <>
      <Helmet>
        <title>Profil — ZEI DUBBING</title>
        <meta name="description" content="ZEI DUBBING profilingiz: VIP holati, ID va sozlamalar." />
      </Helmet>

      <div className="min-h-screen animate-zoom-in">
        <div className="max-w-[720px] mx-auto px-[15px] sm:px-8 pt-6 pb-16">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-neon transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Orqaga
          </button>

          <h1 className="sr-only">Profil</h1>

          {/* Identity card */}
          <div className="glass-strong rounded-2xl p-5 flex items-center gap-4">
            <div
              className={`h-16 w-16 rounded-2xl flex items-center justify-center font-display text-xl border overflow-hidden ${
                isVip
                  ? "border-amber-400/60 text-amber-300"
                  : "border-neon/40 text-neon"
              } bg-white/5`}
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profil rasmi" className="h-full w-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display tracking-wide text-base text-foreground truncate">{name}</span>
                {isVip ? (
                  <VipBadge size="sm" />
                ) : (
                  <span className="text-[10px] font-display tracking-widest px-2 py-0.5 rounded-full border border-white/15 text-foreground/60">
                    FOYDALANUVCHI
                  </span>
                )}
                {isAdmin && (
                  <span className="text-[10px] font-display tracking-widest px-2 py-0.5 rounded-full border border-neon/50 text-neon">
                    ADMIN
                  </span>
                )}
              </div>
              <div className="text-xs text-foreground/55 truncate mt-1">{email}</div>
            </div>
          </div>

          {/* VIP status */}
          <div className="mt-4 glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-display tracking-widest text-foreground/80">
                <Crown className={`h-4 w-4 ${isVip ? "text-amber-400" : "text-foreground/50"}`} />
                VIP HOLATI
              </div>
              <span className={`text-xs ${isVip ? "text-amber-300" : "text-foreground/50"}`}>
                {isVip ? `${vipDaysLeft} kun qoldi` : "Faol emas"}
              </span>
            </div>
            {isVip && profile?.vip_until && (
              <p className="text-[11px] text-foreground/55 mt-2">
                Tugash sanasi:{" "}
                <span className="text-amber-300">{new Date(profile.vip_until).toLocaleDateString()}</span>
              </p>
            )}
            <button
              onClick={() => setVipOpen(true)}
              className="mt-4 w-full h-12 rounded-xl bg-neon text-primary-foreground font-display text-xs tracking-[0.2em] neon-glow-md hover:neon-glow-lg transition-all"
            >
              {isVip ? "VIP MUDDATNI UZAYTIRISH" : "VIP SOTIB OLISH"}
            </button>
          </div>

          {/* Public ID */}
          {profile?.public_id && (
            <div className="mt-4 glass rounded-2xl p-5 flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-display tracking-widest text-foreground/50">SIZNING ID</div>
                <div className="font-mono text-lg tracking-wider text-foreground mt-0.5">
                  {profile.public_id}
                </div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(profile.public_id);
                  toast.success("ID nusxalandi");
                }}
                className="h-10 w-10 rounded-full glass flex items-center justify-center text-foreground/70 hover:text-neon transition-all"
                aria-label="ID nusxalash"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Menu */}
          <div className="mt-4 space-y-2">
            <button onClick={() => navigate("/voting")} className={rowCls}>
              <span className="flex items-center gap-3">
                <Vote className="h-4 w-4" /> Ovoz berish
              </span>
              <ChevronRight className="h-4 w-4 opacity-50" />
            </button>

            <a
              href="https://t.me/ZeiContactBot"
              target="_blank"
              rel="noopener noreferrer"
              className={rowCls}
            >
              <span className="flex items-center gap-3">
                <Send className="h-4 w-4" /> Bog'lanish
              </span>
              <ChevronRight className="h-4 w-4 opacity-50" />
            </a>

            {isAdmin && (
              <button
                onClick={() => navigate("/admin")}
                className="w-full flex items-center justify-between gap-3 px-4 py-4 rounded-xl text-left text-sm font-display tracking-widest text-neon border border-neon/40 bg-neon/10 hover:bg-neon/15 transition-all"
              >
                <span className="flex items-center gap-3">
                  <Shield className="h-4 w-4" /> ADMIN PANEL
                </span>
                <ChevronRight className="h-4 w-4 opacity-60" />
              </button>
            )}

            <button
              onClick={async () => {
                await signOut();
                navigate("/auth", { replace: true });
              }}
              className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-left text-sm text-destructive border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 transition-all"
            >
              <LogOut className="h-4 w-4" /> Chiqish
            </button>
          </div>
        </div>

        <Footer />
      </div>

      <VipModal open={vipOpen} onOpenChange={setVipOpen} />
    </>
  );
};

export default Profile;
