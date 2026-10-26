import { NavLink, useNavigate } from "react-router-dom";
import { X, Home, Vote, User, Send, Crown, Shield } from "lucide-react";
import { useAvailableCategories } from "@/hooks/useAvailableCategories";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
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
  useBodyScrollLock(open);

  const itemCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-colors duration-200 ${
      isActive ? "bg-foreground/10 text-foreground" : "text-foreground/75 hover:bg-foreground/[0.06]"
    }`;

  const section = "pt-2.5 pb-1 px-3 text-[10px] tracking-[0.18em] text-foreground/40";

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] overscroll-none transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        onTouchMove={(e) => { if (e.target === e.currentTarget) e.preventDefault(); }}
      >
        <div className="absolute inset-0 bg-background/40 backdrop-blur-sm" />
        <aside
          onClick={(e) => e.stopPropagation()}
          className={`absolute left-2 top-[max(0.5rem,env(safe-area-inset-top))] w-[240px] max-h-[calc(100dvh-1rem)] rounded-[24px] ios-glass flex flex-col transition-all duration-300 ease-out origin-top-left ${
            open ? "translate-x-0 scale-100 opacity-100" : "-translate-x-4 scale-95 opacity-0"
          }`}
        >
          <div className="flex items-center justify-between pl-4 pr-2 py-2.5 border-b border-foreground/10">
            <span className="font-display text-[13px] tracking-[0.2em] text-foreground">ZEI DUBBING</span>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full flex items-center justify-center text-foreground/60 hover:bg-foreground/10 transition-colors"
              aria-label="Yopish"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto overscroll-contain p-2 space-y-0.5">
            <NavLink to="/" end className={itemCls} onClick={onClose}>
              <Home className="h-4 w-4" /> Asosiy
            </NavLink>

            {categories.length > 0 && <div className={section}>KATEGORIYALAR</div>}
            {categories.map((c) => (
              <NavLink key={c.value} to={c.path} className={itemCls} onClick={onClose}>
                <span className="h-4 w-4 rounded-md bg-foreground/10 flex items-center justify-center text-[9px]">
                  {c.label[0]}
                </span>
                {c.label}
              </NavLink>
            ))}

            <div className={section}>BOSHQA</div>
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
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-foreground/75 hover:bg-foreground/[0.06] transition-colors"
            >
              <Send className="h-4 w-4" /> Bog'lanish
            </a>

            {isAdmin && (
              <button
                onClick={() => { onClose(); navigate("/admin"); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-foreground bg-foreground/[0.06] hover:bg-foreground/10 transition-colors"
              >
                <Shield className="h-4 w-4" /> Admin panel
              </button>
            )}
          </nav>

          <div className="p-2.5 border-t border-foreground/10">
            <button
              onClick={() => setVipOpen(true)}
              className="w-full h-10 rounded-full font-display text-[11px] tracking-[0.16em] text-[#1a0f00] flex items-center justify-center gap-2 active:scale-95 transition-transform"
              style={{ background: "linear-gradient(135deg, hsl(45 95% 60%), hsl(36 100% 52%))" }}
            >
              <Crown className="h-3.5 w-3.5" /> VIP TARIFLAR
            </button>
          </div>
        </aside>
      </div>

      <VipModal open={vipOpen} onOpenChange={setVipOpen} />
    </>
  );
};
