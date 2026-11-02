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
      className="md:hidden fixed bottom-3 left-3 right-3 z-40 rounded-3xl px-2 py-2 flex items-center justify-around"
      style={{
        background: "hsl(222 24% 14% / 0.72)",
        backdropFilter: "blur(20px) saturate(150%)",
        WebkitBackdropFilter: "blur(20px) saturate(150%)",
        border: "1px solid hsl(0 0% 100% / 0.10)",
        boxShadow: "0 12px 32px hsl(222 40% 4% / 0.5)",
      }}
    >
      {items.map(({ icon: Icon, label, onClick, active }) => (
        <button
          key={label}
          onClick={onClick}
          className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-2xl min-w-[56px] transition-all ${
            active ? "text-foreground" : "text-foreground/55 hover:text-foreground/85"
          }`}
          style={active ? { background: "hsl(0 0% 100% / 0.08)" } : {}}
        >
          <Icon className="h-5 w-5" />
          <span className="text-[10px] font-medium">{label}</span>
        </button>
      ))}
    </nav>
  );
};
