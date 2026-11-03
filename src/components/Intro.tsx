import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export const Intro = ({ onDone }: { onDone: () => void }) => {
  const done = useRef(onDone);
  done.current = onDone;
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fade = window.setTimeout(() => setLeaving(true), reduced ? 100 : 1100);
    const finish = window.setTimeout(() => done.current(), reduced ? 200 : 1450);
    return () => { clearTimeout(fade); clearTimeout(finish); };
  }, []);
  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-300 ${leaving ? "opacity-0" : "opacity-100"}`}>
      <div className="v2-intro-mark text-7xl font-semibold text-foreground">ZEI<span className="text-primary">.</span></div>
      <p className="mt-4 text-xs font-medium text-muted-foreground">DUBBING / V2</p>
      <div className="mt-8 h-0.5 w-24 overflow-hidden rounded-full bg-secondary"><div className="v2-intro-progress h-full bg-foreground" /></div>
      <Button variant="ghost" onClick={() => done.current()} className="absolute bottom-10 rounded-full text-muted-foreground">O‘tkazib yuborish</Button>
    </div>
  );
};
