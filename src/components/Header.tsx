import { Menu, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SideMenu } from "./SideMenu";

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
      <header className="fixed top-0 inset-x-0 z-50 glass border-b border-neon/15">
        <div className="max-w-[1440px] mx-auto px-[15px] sm:px-8">
          <div className="flex items-center justify-between gap-3 h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setMenuOpen(true)}
                className="h-10 w-10 rounded-full glass flex items-center justify-center text-foreground/80 hover:text-neon transition-all"
                aria-label="Menyu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate("/")}
                className="logo-cyber text-sm sm:text-2xl select-none transition-all duration-300 hover:scale-[1.04] shrink-0"
              >
                ZEI DUBBING
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5">
              <button
                onClick={() => navigate("/search")}
                className="h-10 w-10 rounded-full glass flex items-center justify-center text-neon hover:neon-glow-sm transition-all"
                aria-label="Qidirish"
              >
                <Search className="h-4 w-4" />
              </button>

              {user && (
                <button
                  onClick={() => navigate("/profile")}
                  aria-label="Profil"
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-display text-sm border transition-all overflow-hidden ${
                    isVip
                      ? "border-amber-400/70 text-amber-300 shadow-[0_0_12px_hsl(45_95%_55%/0.45)]"
                      : "border-neon/50 text-neon hover:neon-glow-sm"
                  } bg-white/5`}
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
