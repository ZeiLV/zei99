import { Home, Search, User, Compass } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const MobileBottomNav = ({
  onSearch,
}: {
  onSearch?: () => void;
}) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { signOut } = useAuth();

  const items = [
    { icon: Home, label: "Bosh", onClick: () => navigate("/"), active: pathname === "/" },
    { icon: Compass, label: "Anime", onClick: () => navigate("/anime"), active: pathname === "/anime" },
    { icon: Search, label: "Qidiruv", onClick: () => onSearch?.(), active: false },
    {
      icon: User,
      label: "Chiqish",
      onClick: async () => {
        await signOut();
        navigate("/auth", { replace: true });
      },
      active: false,
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-3 left-3 right-3 z-40 rounded-2xl px-2 py-2 flex items-center justify-around"
      style={{
        background: "hsl(220 50% 8% / 0.7)",
        backdropFilter: "blur(18px) saturate(160%)",
        WebkitBackdropFilter: "blur(18px) saturate(160%)",
        border: "1px solid hsl(var(--neon) / 0.22)",
        boxShadow: "0 10px 32px hsl(220 60% 4% / 0.55), 0 0 0 1px hsl(var(--neon) / 0.06)",
      }}
    >
      {items.map(({ icon: Icon, label, onClick, active }) => (
        <button
          key={label}
          onClick={onClick}
          className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl min-w-[56px] transition-all ${
            active ? "text-neon" : "text-white/65 hover:text-white"
          }`}
          style={active ? { background: "hsl(var(--neon) / 0.10)" } : {}}
        >
          <Icon className="h-5 w-5" />
          <span className="text-[10px] font-display tracking-widest">{label.toUpperCase()}</span>
        </button>
      ))}
    </nav>
  );
};
