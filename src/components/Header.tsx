import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AdminLoginModal } from "./AdminLoginModal";
import { CATEGORIES } from "@/lib/types";

interface HeaderProps {
  search: string;
  onSearchChange: (v: string) => void;
}

export const Header = ({ search, onSearchChange }: HeaderProps) => {
  const [expanded, setExpanded] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const pressTimer = useRef<number | null>(null);
  const longPressed = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (expanded) inputRef.current?.focus();
  }, [expanded]);

  const startPress = () => {
    longPressed.current = false;
    pressTimer.current = window.setTimeout(() => {
      longPressed.current = true;
      setAdminOpen(true);
    }, 1200);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <button
              onClick={handleClick}
              onMouseDown={startPress}
              onMouseUp={endPress}
              onMouseLeave={endPress}
              onTouchStart={startPress}
              onTouchEnd={endPress}
              onTouchCancel={endPress}
              onContextMenu={(e) => e.preventDefault()}
              className="font-display text-base sm:text-xl font-black multineon-text select-none transition-all duration-300 hover:scale-105"
              style={{ WebkitUserSelect: "none", userSelect: "none", WebkitTouchCallout: "none" }}
            >
              ZEI DUBBING
            </button>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-full text-xs font-display tracking-widest transition-all ${
                    isActive ? "bg-neon/15 text-neon neon-glow-sm" : "text-foreground/70 hover:text-neon"
                  }`
                }
              >
                BOSH
              </NavLink>
              {CATEGORIES.map((c) => (
                <NavLink
                  key={c.value}
                  to={c.path}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-full text-xs font-display tracking-widest transition-all ${
                      isActive ? "bg-neon/15 text-neon neon-glow-sm" : "text-foreground/70 hover:text-neon"
                    }`
                  }
                >
                  {c.label.toUpperCase()}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center">
              <div
                className={`flex items-center transition-all duration-300 ease-out ${
                  expanded ? "w-44 sm:w-72" : "w-10"
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
            </div>
          </div>

          {/* Mobile nav — horizontal scroll */}
          <nav className="md:hidden flex items-center gap-1 pb-2 overflow-x-auto scrollbar-hide">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `shrink-0 px-3 py-1 rounded-full text-[11px] font-display tracking-widest transition-all ${
                  isActive ? "bg-neon/15 text-neon neon-glow-sm" : "text-foreground/70"
                }`
              }
            >
              BOSH
            </NavLink>
            {CATEGORIES.map((c) => (
              <NavLink
                key={c.value}
                to={c.path}
                className={({ isActive }) =>
                  `shrink-0 px-3 py-1 rounded-full text-[11px] font-display tracking-widest transition-all ${
                    isActive ? "bg-neon/15 text-neon neon-glow-sm" : "text-foreground/70"
                  }`
                }
              >
                {c.label.toUpperCase()}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <AdminLoginModal open={adminOpen} onOpenChange={setAdminOpen} />
    </>
  );
};
