import { NavLink, useNavigate } from "react-router-dom";
import { X, Home, Vote, User, Send, Crown, Shield } from "lucide-react";
import { useAvailableCategories } from "@/hooks/useAvailableCategories";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useState } from "react";
import { VipModal } from "./VipModal";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const SideMenu = ({ open, onClose }: Props) => {
  const { categories } = useAvailableCategories();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const [vipOpen, setVipOpen] = useState(false);

  const itemCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm tracking-wide transition-all duration-300 ${
      isActive
        ? "bg-neon/15 text-neon border border-neon/40 shadow-[0_0_18px_-8px_hsl(var(--neon))]"
        : "text-foreground/80 border border-transparent hover:text-neon hover:bg-neon/10 hover:border-neon/25"
    }`;

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-background/85 backdrop-blur-md" />
        <aside
          onClick={(e) => e.stopPropagation()}
          className={`absolute left-0 top-0 bottom-0 w-[80%] max-w-[310px] border-r border-neon/25 flex flex-col transition-transform duration-300 shadow-[8px_0_40px_-20px_hsl(var(--neon))] ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{
            background:
              "linear-gradient(180deg, hsl(222 60% 9%) 0%, hsl(224 62% 6%) 55%, hsl(226 65% 4%) 100%)",
          }}
        >
          <div className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-4 border-b border-white/5">
            <span className="logo-cyber text-base">ZEI DUBBING</span>
            <button
              onClick={onClose}
              className="h-9 w-9 rounded-full flex items-center justify-center text-foreground/60 hover:text-neon hover:bg-neon/10 transition-all"
              aria-label="Yopish"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            <NavLink to="/" end className={itemCls} onClick={onClose}>
              <Home className="h-4 w-4" /> Asosiy
            </NavLink>

            {categories.length > 0 && (
              <div className="pt-3 pb-1 px-4 text-[10px] font-display tracking-[0.22em] text-foreground/40">
                KATEGORIYALAR
              </div>
            )}
            {categories.map((c) => (
              <NavLink key={c.value} to={c.path} className={itemCls} onClick={onClose}>
                <span className="h-5 w-5 rounded-md bg-neon/10 border border-neon/25 flex items-center justify-center text-[10px] font-display text-neon">
                  {c.label[0]}
                </span>
                {c.label}
              </NavLink>
            ))}

            <div className="pt-3 pb-1 px-4 text-[10px] font-display tracking-[0.22em] text-foreground/40">
              BOSHQA
            </div>
            <NavLink to="/voting" className={itemCls} onClick={onClose}>
              <Vote className="h-4 w-4" /> Ovoz berish
            </NavLink>
            <NavLink to="/profile" className={itemCls} onClick={onClose}>
              <User className="h-4 w-4" /> Profil
            </NavLink>
            <a
              href="https://t.me/ZeiContactBot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm tracking-wide text-foreground/80 border border-transparent hover:text-neon hover:bg-neon/10 hover:border-neon/25 transition-all duration-300"
            >
              <Send className="h-4 w-4" /> Bog'lanish
            </a>

            {isAdmin && (
              <button
                onClick={() => {
                  onClose();
                  navigate("/admin");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm tracking-wide text-neon border border-neon/25 bg-neon/5 hover:bg-neon/15 transition-all duration-300"
              >
                <Shield className="h-4 w-4" /> Admin panel
              </button>
            )}
          </nav>

          <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-white/5">
            <button
              onClick={() => setVipOpen(true)}
              className="w-full h-12 rounded-full font-display text-[11px] tracking-[0.18em] text-[#1a0f00] flex items-center justify-center gap-2 transition-transform hover:scale-[1.03] active:scale-95 shadow-[0_0_18px_hsl(45_95%_55%/0.45)]"
              style={{ background: "linear-gradient(135deg, hsl(45 95% 58%), hsl(35 100% 50%))" }}
            >
              <Crown className="h-4 w-4" /> VIP TARIFLAR
            </button>
          </div>
        </aside>
      </div>

      <VipModal open={vipOpen} onOpenChange={setVipOpen} />
    </>
  );
};
