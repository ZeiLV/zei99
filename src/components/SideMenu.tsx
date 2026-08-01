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
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm tracking-wide transition-all ${
      isActive
        ? "bg-neon/15 text-neon border border-neon/40"
        : "text-foreground/75 border border-transparent hover:text-neon hover:bg-white/5"
    }`;

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        <aside
          onClick={(e) => e.stopPropagation()}
          className={`absolute left-0 top-0 bottom-0 w-[78%] max-w-[300px] glass-strong border-r border-neon/25 p-4 flex flex-col gap-2 transition-transform duration-300 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-1 pb-3">
            <span className="logo-cyber text-base">ZEI DUBBING</span>
            <button
              onClick={onClose}
              className="h-9 w-9 rounded-full flex items-center justify-center text-foreground/60 hover:text-neon hover:bg-white/5"
              aria-label="Yopish"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto">
            <NavLink to="/" end className={itemCls} onClick={onClose}>
              <Home className="h-4 w-4" /> Asosiy
            </NavLink>

            {categories.map((c) => (
              <NavLink key={c.value} to={c.path} className={itemCls} onClick={onClose}>
                <span className="h-4 w-4 flex items-center justify-center text-[10px] font-display">
                  {c.label[0]}
                </span>
                {c.label}
              </NavLink>
            ))}

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
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm tracking-wide text-foreground/75 hover:text-neon hover:bg-white/5 transition-all"
            >
              <Send className="h-4 w-4" /> Bog'lanish
            </a>

            {isAdmin && (
              <button
                onClick={() => {
                  onClose();
                  navigate("/admin");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm tracking-wide text-neon hover:bg-neon/10 transition-all"
              >
                <Shield className="h-4 w-4" /> Admin panel
              </button>
            )}
          </nav>

          <button
            onClick={() => setVipOpen(true)}
            className="w-full h-12 rounded-xl bg-neon text-primary-foreground font-display text-xs tracking-[0.2em] neon-glow-md hover:neon-glow-lg transition-all flex items-center justify-center gap-2"
          >
            <Crown className="h-4 w-4" /> VIP TARIFLAR
          </button>
        </aside>
      </div>

      <VipModal open={vipOpen} onOpenChange={setVipOpen} />
    </>
  );
};
