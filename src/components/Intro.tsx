import { useEffect, useState } from "react";

interface IntroProps {
  onDone: () => void;
}

export const Intro = ({ onDone }: IntroProps) => {
  const [stage, setStage] = useState<"loading" | "welcome" | "dissolve">("loading");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (stage !== "loading") return;
    let p = 0;
    const id = setInterval(() => {
      p += Math.random() * 12 + 8;
      if (p >= 100) {
        p = 100;
        clearInterval(id);
        setProgress(100);
        setTimeout(() => setStage("welcome"), 250);
      } else {
        setProgress(p);
      }
    }, 90);
    return () => clearInterval(id);
  }, [stage]);

  useEffect(() => {
    if (stage === "welcome") {
      const t = setTimeout(() => setStage("dissolve"), 1400);
      return () => clearTimeout(t);
    }
    if (stage === "dissolve") {
      const t = setTimeout(onDone, 600);
      return () => clearTimeout(t);
    }
  }, [stage, onDone]);

  const skip = () => setStage("dissolve");

  return (
    <div
      onClick={skip}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background cursor-pointer overflow-hidden transition-opacity duration-500 ${
        stage === "dissolve" ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Soft ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 40%, hsl(var(--neon) / 0.10), transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 animate-fade-up">
        <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
          ZEI DUBBING
        </h1>

        {stage === "loading" ? (
          <div className="w-48 sm:w-64 flex flex-col items-center gap-3">
            <div className="h-1 w-full bg-foreground/10 overflow-hidden rounded-full">
              <div
                className="h-full transition-all duration-150 ease-out rounded-full bg-foreground/70"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-[11px] text-foreground/50 font-medium">
              {Math.floor(progress)}%
            </div>
          </div>
        ) : (
          <p className="text-[13px] sm:text-sm text-foreground/60 animate-fade-up">
            Zei Dubbing ga xush kelibsiz
          </p>
        )}
      </div>
    </div>
  );
};
