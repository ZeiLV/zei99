import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Film, LogOut, Home, Menu, X, Crown, Vote, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/admin", end: true, label: "Boshqaruv", icon: LayoutDashboard },
  { to: "/admin/content", end: false, label: "Kontent", icon: Film },
  { to: "/admin/vip", end: false, label: "VIP", icon: Crown },
  { to: "/admin/voting", end: false, label: "Ovoz berish", icon: Vote },
];

const ADMIN_CODE = "ZEI99";
const STORAGE_KEY = "zei-admin-unlocked";

const PasscodeGate = ({ onUnlock }: { onUnlock: () => void }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().toUpperCase() === ADMIN_CODE) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      onUnlock();
    } else {
      setError(true);
      setCode("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-background">
      <div className="fixed inset-0 -z-10 animate-breathing pointer-events-none opacity-50" />
      <form
        onSubmit={submit}
        className="glass-strong rounded-2xl p-8 w-full max-w-sm space-y-6 border border-neon/30 neon-glow-md"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full flex items-center justify-center bg-neon/10 border border-neon/40 neon-glow-sm">
            <Lock className="h-5 w-5 text-neon" />
          </div>
          <div className="font-display tracking-widest neon-text text-lg">ADMIN ACCESS</div>
          <div className="text-[11px] text-foreground/60 text-center">
            Davom etish uchun maxfiy kodni kiriting
          </div>
        </div>

        <input
          autoFocus
          type="password"
          inputMode="text"
          autoComplete="off"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (error) setError(false);
          }}
          placeholder="Kodni kiriting"
          className={`w-full h-12 rounded-lg bg-transparent border text-center tracking-[0.4em] font-display text-lg outline-none transition-all ${
            error
              ? "border-destructive text-destructive placeholder:text-destructive/40"
              : "border-neon/40 text-foreground focus:border-neon focus:neon-glow-sm placeholder:text-foreground/30"
          }`}
        />

        {error && (
          <div
            className="text-center text-sm font-display tracking-widest animate-fade-up"
            style={{
              color: "hsl(0 90% 65%)",
              textShadow: "0 0 8px hsl(0 90% 60% / 0.8), 0 0 18px hsl(0 90% 55% / 0.5)",
            }}
          >
            KOD NOTO'G'RI!
          </div>
        )}

        <button
          type="submit"
          disabled={!code}
          className="w-full h-11 rounded-lg bg-neon text-primary-foreground font-display text-sm tracking-widest neon-glow-md disabled:opacity-40 transition-all hover:neon-glow-lg breathing-btn"
        >
          KIRISH
        </button>
      </form>
    </div>
  );
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState<boolean>(
    () => sessionStorage.getItem(STORAGE_KEY) === "1"
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (unlocked) localStorage.setItem(STORAGE_KEY, "1");
  }, [unlocked]);

  // Persist across tabs/refresh via localStorage too
  useEffect(() => {
    if (!unlocked && localStorage.getItem(STORAGE_KEY) === "1") {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
    }
  }, [unlocked]);

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
    setUnlocked(false);
  };

  if (!unlocked) {
    return <PasscodeGate onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-60 border-r border-neon/15 glass-strong sticky top-0 h-screen">
        <div className="p-5 border-b border-neon/15">
          <div className="font-display tracking-widest neon-text text-base">ZEI · ADMIN</div>
          <div className="text-[10px] text-muted-foreground mt-1">Boshqaruv paneli</div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-display tracking-wide transition-all ${
                  isActive
                    ? "bg-neon/15 text-neon neon-glow-sm"
                    : "text-foreground/70 hover:text-neon hover:bg-neon/5"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-neon/15 space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="w-full justify-start gap-2"
          >
            <Home className="h-4 w-4" />
            Saytga qaytish
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start gap-2 text-destructive hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Chiqish
          </Button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <aside
            className="absolute left-0 top-0 bottom-0 w-64 glass-strong border-r border-neon/15 p-4 space-y-3 animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="font-display tracking-widest neon-text">ZEI · ADMIN</div>
              <button onClick={() => setMobileOpen(false)} className="text-muted-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1 pt-2">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-display tracking-wide transition-all ${
                      isActive
                        ? "bg-neon/15 text-neon neon-glow-sm"
                        : "text-foreground/70 hover:text-neon"
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="pt-3 border-t border-neon/15 space-y-1">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="w-full justify-start gap-2">
                <Home className="h-4 w-4" /> Saytga qaytish
              </Button>
              <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start gap-2 text-destructive">
                <LogOut className="h-4 w-4" /> Chiqish
              </Button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-40 glass-strong border-b border-neon/15 px-4 h-14 flex items-center justify-between">
          <button onClick={() => setMobileOpen(true)} className="text-neon">
            <Menu className="h-5 w-5" />
          </button>
          <div className="font-display tracking-widest neon-text text-sm">ZEI · ADMIN</div>
          <div className="w-5" />
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
