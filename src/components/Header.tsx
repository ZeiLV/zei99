import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AdminLoginModal } from "./AdminLoginModal";

interface HeaderProps {
  search: string;
  onSearchChange: (v: string) => void;
  onLogoTap?: () => void;
}

export const Header = ({ search, onSearchChange, onLogoTap }: HeaderProps) => {
  const [expanded, setExpanded] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const pressTimer = useRef<number | null>(null);
  const longPressed = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (!longPressed.current) onLogoTap?.();
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 glass border-b border-neon/15">
        <div className="flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16 max-w-7xl mx-auto">
          <button
            onClick={handleClick}
            onMouseDown={startPress}
            onMouseUp={endPress}
            onMouseLeave={endPress}
            onTouchStart={startPress}
            onTouchEnd={endPress}
            onTouchCancel={endPress}
            onContextMenu={(e) => e.preventDefault()}
            className="font-display text-base sm:text-xl font-black neon-text select-none transition-all duration-300 hover:scale-105"
            style={{ WebkitUserSelect: "none", userSelect: "none", WebkitTouchCallout: "none" }}
          >
            ZEI DUBBING
          </button>

          <div className="flex items-center">
            <div
              className={`flex items-center transition-all duration-300 ease-out ${
                expanded ? "w-48 sm:w-72" : "w-10"
              }`}
            >
              {expanded && (
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
              )}
              {!expanded && (
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
      </header>

      <AdminLoginModal open={adminOpen} onOpenChange={setAdminOpen} />
    </>
  );
};
