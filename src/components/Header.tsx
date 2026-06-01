import { LogOut, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { VipStatusButton } from "./VipStatusButton";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  search: string;
  onSearchChange: (v: string) => void;
}

export const Header = ({ search, onSearchChange }: HeaderProps) => {
  const [expanded, setExpanded] = useState(false);
  const pressTimer = useRef<number | null>(null);
  const longPressed = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (expanded) inputRef.current?.focus();
  }, [expanded]);

  const startPress = () => {
    longPressed.current = false;
    pressTimer.current = window.setTimeout(() => {
      longPressed.current = true;
      navigate("/admin");
    }, 3000);
  };
  const endPress = () => {
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
  };
  const handleClick = () => {
    if (!longPressed.current) navigate("/");
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 glass border-b border-neon/15">
        <div className="max-w-[1440px] mx-auto px-[15px] sm:px-8">
          <div className="flex items-center justify-between gap-3 sm:gap-6 h-14 sm:h-16">
            <button
              onClick={handleClick}
              onMouseDown={startPress}
              onMouseUp={endPress}
              onMouseLeave={endPress}
              onTouchStart={startPress}
              onTouchEnd={endPress}
              onTouchCancel={endPress}
              onContextMenu={(e) => e.preventDefault()}
              className="logo-cyber text-base sm:text-2xl select-none transition-all duration-300 hover:scale-[1.04] shrink-0"
              style={{ WebkitUserSelect: "none", userSelect: "none", WebkitTouchCallout: "none" }}
            >
              ZEI DUBBING
            </button>

            <div className="flex items-center gap-2 sm:gap-2.5 relative">
              <div
                className={`flex items-center transition-all duration-300 ease-out ${
                  expanded ? "w-40 sm:w-72" : "w-10"
                }`}
              >
                {expanded ? (
                  <div className="glass-strong rounded-full flex items-center w-full pl-4 pr-1 h-10">
                    <input
                      ref={inputRef}
                      value={search}
                      onChange={(e) => onSearchChange(e.target.value)}
                      placeholder="Qidirish..."
                      className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                    />
                    <button
                      onClick={() => {
                        onSearchChange("");
                        setExpanded(false);
                      }}
                      className="p-1.5 text-neon/80 hover:text-neon"
                      aria-label="Yopish"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setExpanded(true)}
                    className="h-10 w-10 rounded-full glass flex items-center justify-center text-neon hover:neon-glow-sm transition-all"
                    aria-label="Qidirish"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                )}
              </div>

              {user && (
                <>
                  <VipStatusButton />
                  <button
                    onClick={async () => {
                      await signOut();
                      navigate("/auth", { replace: true });
                    }}
                    className="h-10 w-10 rounded-full glass flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
                    aria-label="Chiqish"
                    title="Chiqish"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <AdminLoginModal open={adminOpen} onOpenChange={setAdminOpen} />
    </>
  );
};
