import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Film, LogOut, Home, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/admin", end: true, label: "Boshqaruv", icon: LayoutDashboard },
  { to: "/admin/content", end: false, label: "Kontent", icon: Film },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/", { replace: true });
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (cancelled) return;
      if (!roles) {
        await supabase.auth.signOut();
        navigate("/", { replace: true });
        return;
      }
      setAuthChecked(true);
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-neon/20 border-t-neon animate-spin-neon" />
      </div>
    );
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
