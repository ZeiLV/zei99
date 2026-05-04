import { useMemo } from "react";

interface Props {
  count?: number;
}

const COLORS = [
  "hsl(var(--neon))",
  "hsl(var(--neon-cyan))",
  "hsl(var(--neon-purple))",
  "hsl(var(--neon-pink))",
];

export const Particles = ({ count = 40 }: Props) => {
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map(() => {
        const size = 1 + Math.random() * 3;
        return {
          left: Math.random() * 100,
          top: Math.random() * 100,
          size,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          duration: 8 + Math.random() * 14,
          delay: -Math.random() * 18,
          dx: (Math.random() - 0.5) * 220 + "px",
          dy: -100 - Math.random() * 240 + "px",
          opacity: 0.4 + Math.random() * 0.5,
        };
      }),
    [count]
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Soft cyber smoke */}
      <div
        className="absolute inset-0 animate-smoke"
        style={{
          background:
            "radial-gradient(40% 35% at 22% 70%, hsl(var(--neon-purple) / 0.35), transparent 70%), radial-gradient(45% 40% at 78% 25%, hsl(var(--neon) / 0.30), transparent 70%), radial-gradient(35% 30% at 55% 50%, hsl(var(--neon-pink) / 0.18), transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      {/* Particles */}
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
            opacity: p.opacity,
            animation: `particle-drift ${p.duration}s linear ${p.delay}s infinite`,
            // @ts-expect-error CSS var
            "--dx": p.dx,
            "--dy": p.dy,
          }}
        />
      ))}
    </div>
  );
};
