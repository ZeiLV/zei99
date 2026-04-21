import { useEffect, useState } from "react";

interface IntroProps {
  onDone: () => void;
}

export const Intro = ({ onDone }: IntroProps) => {
  const [stage, setStage] = useState<"loading" | "assemble" | "welcome" | "dissolve">("loading");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (stage !== "loading") return;
    let p = 0;
    const id = setInterval(() => {
      p += Math.random() * 9 + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(id);
        setProgress(100);
        setTimeout(() => setStage("assemble"), 250);
      } else {
        setProgress(p);
      }
    }, 90);
    return () => clearInterval(id);
  }, [stage]);

  useEffect(() => {
    if (stage === "assemble") {
      const t = setTimeout(() => setStage("welcome"), 1700);
      return () => clearTimeout(t);
    }
    if (stage === "welcome") {
      const t = setTimeout(() => setStage("dissolve"), 1800);
      return () => clearTimeout(t);
    }
    if (stage === "dissolve") {
      const t = setTimeout(onDone, 850);
      return () => clearTimeout(t);
    }
  }, [stage, onDone]);

  const skip = () => setStage("dissolve");

  return (
    <div
      onClick={skip}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background cursor-pointer overflow-hidden ${
        stage === "dissolve" ? "animate-dissolve" : ""
      }`}
    >
      {/* Ambient breathing backlight */}
      <div className="absolute inset-0 animate-breathing pointer-events-none" />

      {/* Sweeping neon lines (always visible during intro until dissolve) */}
      {stage !== "dissolve" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* horizontal lines */}
          <div
            className="absolute left-0 right-0 h-px animate-line-h"
            style={{ top: "28%", background: "linear-gradient(90deg, transparent, hsl(var(--neon-cyan)), transparent)", boxShadow: "0 0 12px hsl(var(--neon-cyan))" }}
          />
          <div
            className="absolute left-0 right-0 h-px animate-line-h"
            style={{ top: "48%", background: "linear-gradient(90deg, transparent, hsl(var(--neon-purple)), transparent)", boxShadow: "0 0 12px hsl(var(--neon-purple))", animationDelay: "0.4s" }}
          />
          <div
            className="absolute left-0 right-0 h-px animate-line-h"
            style={{ top: "68%", background: "linear-gradient(90deg, transparent, hsl(var(--neon-pink)), transparent)", boxShadow: "0 0 12px hsl(var(--neon-pink))", animationDelay: "0.8s" }}
          />
          {/* vertical lines */}
          <div
            className="absolute top-0 bottom-0 w-px animate-line-v"
            style={{ left: "20%", background: "linear-gradient(180deg, transparent, hsl(var(--neon)), transparent)", boxShadow: "0 0 12px hsl(var(--neon))", animationDelay: "0.2s" }}
          />
          <div
            className="absolute top-0 bottom-0 w-px animate-line-v"
            style={{ left: "80%", background: "linear-gradient(180deg, transparent, hsl(var(--neon-pink)), transparent)", boxShadow: "0 0 12px hsl(var(--neon-pink))", animationDelay: "0.6s" }}
          />
        </div>
      )}

      {stage === "loading" && (
        <div className="relative z-10 w-64 sm:w-96 flex flex-col items-center gap-3">
          <div className="h-[2px] w-full bg-white/5 overflow-hidden relative rounded-full">
            <div
              className="h-full transition-all duration-150 ease-out rounded-full"
              style={{
                width: `${progress}%`,
                background: "var(--gradient-multineon)",
                boxShadow: "0 0 10px hsl(var(--neon)), 0 0 20px hsl(var(--neon-purple) / 0.7)",
              }}
            />
          </div>
          <div className="font-display text-[10px] tracking-[0.4em] text-foreground/70">
            {Math.floor(progress)}%
          </div>
        </div>
      )}

      {(stage === "assemble" || stage === "welcome" || stage === "dissolve") && (
        <div className="relative z-10 flex flex-col items-center gap-6">
          <h1 className="font-display text-3xl sm:text-5xl md:text-7xl font-black multineon-text animate-wordmark-coalesce">
            ZEI DUBBING
          </h1>
          {(stage === "welcome" || stage === "dissolve") && (
            <div
              className="overflow-hidden whitespace-nowrap border-r-2 border-neon font-display text-[11px] sm:text-sm text-foreground/90 tracking-widest"
              style={{
                animation: "typewriter 1.4s steps(28) forwards, caret 0.7s step-end infinite",
              }}
            >
              Zei Dubbing ga xush kelibsiz
            </div>
          )}
        </div>
      )}
    </div>
  );
};
