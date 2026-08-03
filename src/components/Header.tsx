import { Menu, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SideMenu } from "./SideMenu";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  search?: string;
  onSearchChange?: (v: string) => void;
}

export const Header = (_props: HeaderProps) => {
  const navigate = useNavigate();
  const { user, profile, isVip } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const initial =
    (profile?.display_name || profile?.email || user?.email || "Z").trim().charAt(0).toUpperCase();

  return (
    <>
      {/* Rounded floating header — scrolls together with the page */}
      <header className="relative z-50">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-6 pt-3 sm:pt-4">
          <div className="glass rounded-full border border-neon/20 shadow-[0_6px_24px_-8px_hsl(var(--neon)/0.35)] h-14 sm:h-16 px-2.5 sm:px-4 flex items-center justify-between gap-2">

            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={() => setMenuOpen(true)}
                className="h-10 w-10 rounded-full flex items-center justify-center text-foreground/80 hover:text-neon hover:bg-neon/10 transition-all shrink-0"
                aria-label="Menyu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate("/")}
                className="logo-cyber text-sm sm:text-xl select-none transition-all duration-300 hover:scale-[1.04] shrink-0 truncate"
              >
                ZEI DUBBING
              </button>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <ThemeToggle />

              <button
                onClick={() => navigate("/search")}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full glass flex items-center justify-center text-neon transition-all hover:scale-105 active:scale-95"
                aria-label="Qidirish"
              >
                <Search className="h-4 w-4" />
              </button>

              {user && (
                <button
                  onClick={() => navigate("/profile")}
                  aria-label="Profil"
                  className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center font-display text-sm border transition-all overflow-hidden ${
                    isVip
                      ? "border-amber-400/70 text-amber-400 shadow-[0_0_12px_hsl(45_95%_55%/0.45)]"
                      : "border-neon/50 text-neon"
                  } bg-foreground/5`}
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profil rasmi"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initial
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
};
