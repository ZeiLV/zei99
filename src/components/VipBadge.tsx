import { Crown } from "lucide-react";

interface Props {
  size?: "sm" | "md";
  variant?: "gold" | "elite";
  className?: string;
}

/**
 * Glowing VIP badge for usernames, profiles, comments.
 * Pure presentational — caller decides when to render.
 */
export const VipBadge = ({ size = "sm", variant = "gold", className = "" }: Props) => {
  const isElite = variant === "elite";
  const px = size === "sm" ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]";
  const icon = size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3";

  return (
    <span
      className={`vip-badge inline-flex items-center gap-0.5 rounded-full font-display tracking-widest leading-none ${px} ${className}`}
      style={{
        background: isElite
          ? "linear-gradient(135deg, hsl(280 80% 55%), hsl(220 90% 60%))"
          : "linear-gradient(135deg, hsl(45 95% 55%), hsl(35 100% 50%))",
        color: isElite ? "#fff" : "#1a0f00",
        border: `1px solid ${isElite ? "hsl(280 80% 65% / 0.6)" : "hsl(45 95% 65% / 0.7)"}`,
      }}
    >
      <Crown className={icon} />
      {isElite ? "ELITE" : "VIP GOLD"}
    </span>
  );
};
