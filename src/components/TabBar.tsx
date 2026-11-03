import { Home, Compass, Search, Vote, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const tabs = [
  { to: "/", label: "Asosiy", icon: Home },
  { to: "/newest", label: "Yangilar", icon: Compass },
  { to: "/search", label: "Qidiruv", icon: Search },
  { to: "/voting", label: "Ovozlar", icon: Vote },
  { to: "/profile", label: "Profil", icon: User },
];

export const TabBar = ({ catalog = false }: { catalog?: boolean }) => {
  const { pathname } = useLocation();
  const catalogPaths = ["/", "/index", "/anime", "/drama", "/kino", "/multfilm", "/newest", "/trending"];
  if (!catalog && (catalogPaths.includes(pathname) || pathname === "/auth" || pathname.startsWith("/admin"))) return null;
  return (
    <nav aria-label="Asosiy navigatsiya" className="v2-tabbar fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid max-w-lg grid-cols-5 px-2 py-2">
        {tabs.map(({ to, label, icon: Icon }) => (
          <Button key={to} asChild variant="ghost" className="h-14 rounded-xl p-0 hover:bg-secondary hover:text-foreground">
            <NavLink to={to} end className={({ isActive }) => `flex flex-col gap-1 ${isActive ? "bg-secondary text-foreground" : "text-muted-foreground"}`}>
              <Icon className="!h-5 !w-5" strokeWidth={1.7} />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          </Button>
        ))}
      </div>
    </nav>
  );
};