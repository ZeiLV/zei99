import { Button } from "@/components/ui/button";
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
      {/* Rounded floating header — sticks to the top and follows the user */}
      <header className="relative z-50">

        <div className="max-w-[1200px] mx-auto px-3 sm:px-6 pt-3 sm:pt-4">
          <div className="bg-card border border-border rounded-full h-14 sm:h-16 px-2.5 sm:px-4 flex items-center justify-between gap-2">

            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Button variant="ghost"
                onClick={() => setMenuOpen(true)}
                className="h-10 w-10 rounded-full flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-foreground/10 transition-all shrink-0"
                aria-label="Menyu"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Button variant="ghost"
                onClick={() => navigate("/")}
                className="logo-cyber text-sm sm:text-lg select-none transition-all duration-300 shrink-0 truncate"
              >
                ZEI DUBBING <span className="ml-1 text-[9px] text-muted-foreground">V2</span>
              </Button>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

              <Button variant="ghost"
                onClick={() => navigate("/search")}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full glass flex items-center justify-center text-foreground/85 transition-all hover:bg-foreground/10 active:scale-95"
                aria-label="Qidirish"
              >
                <Search className="h-4 w-4" />
              </Button>

              {user && (
                <Button variant="ghost"
                  onClick={() => navigate("/profile")}
                  aria-label="Profil"
                  className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center font-semibold text-sm border transition-all overflow-hidden ${
                    isVip
                      ? "border-vip/60 text-vip"
                      : "border-foreground/15 text-foreground/85"
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
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
};
