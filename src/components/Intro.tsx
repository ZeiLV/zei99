import { useEffect, useState } from "react";

interface IntroProps {
  onDone: () => void;
}

export const Intro = ({ onDone }: IntroProps) => {
  const [stage, setStage] = useState<"loading" | "logo" | "welcome" | "dissolve">("loading");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (stage !== "loading") return;
    let p = 0;
    const id = setInterval(() => {
      p += Math.random() * 12 + 6;
      if (p >= 100) {
        p = 100;
        clearInterval(id);
        setProgress(100);
        setTimeout(() => setStage("logo"), 250);
      } else {
        setProgress(p);
      }
    }, 90);
    return () => clearInterval(id);
  }, [stage]);

  useEffect(() => {
    if (stage === "logo") {
      const t = setTimeout(() => setStage("welcome"), 1500);
      return () => clearTimeout(t);
    }
    if (stage === "welcome") {
      const t = setTimeout(() => setStage("dissolve"), 2200);
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
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background cursor-pointer ${
        stage === "dissolve" ? "animate-dissolve" : ""
      }`}
    >
      {stage === "loading" && (
        <div className="w-64 sm:w-96 flex flex-col items-center gap-3">
          <div className="h-px w-full bg-neon/15 overflow-hidden relative">
            <div
              className="h-px bg-neon transition-all duration-150 ease-out"
              style={{
                width: `${progress}%`,
                boxShadow: "0 0 8px hsl(var(--neon)), 0 0 16px hsl(var(--neon) / 0.6)",
              }}
            />
          </div>
          <div className="font-display text-[10px] tracking-[0.4em] text-neon/70">
            {Math.floor(progress)}%
          </div>
        </div>
      )}

      {(stage === "logo" || stage === "welcome" || stage === "dissolve") && (
        <div className="flex flex-col items-center gap-6">
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-black neon-text animate-hologram">
            ZEI DUBBING
          </h1>
          {(stage === "welcome" || stage === "dissolve") && (
            <div className="overflow-hidden whitespace-nowrap border-r-2 border-neon font-display text-[11px] sm:text-sm text-neon/90 tracking-widest"
                 style={{
                   animation: "typewriter 1.4s steps(28) forwards, caret 0.7s step-end infinite",
                 }}>
              Zei Dubbing ga xush kelibsiz
            </div>
          )}
        </div>
      )}
    </div>
  );
};
