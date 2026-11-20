import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Intro = ({ onDone }: { onDone: () => void }) => {
  const done = useRef(onDone);
  done.current = onDone;
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fade = window.setTimeout(() => setLeaving(true), reduced ? 100 : 1800);
    const finish = window.setTimeout(() => done.current(), reduced ? 200 : 2200);
    return () => { clearTimeout(fade); clearTimeout(finish); };
  }, []);
  return <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-300 ${leaving ? "opacity-0" : "opacity-100"}`}>
    <div className="app-intro-symbol mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] bg-primary text-primary-foreground"><Play className="h-9 w-9 fill-current" /></div>
    <div className="flex overflow-hidden text-7xl font-bold text-foreground">{"ZEI".split("").map((letter, index) => <span key={letter} className={`app-intro-letter app-letter-${index}`}>{letter}</span>)}<span className="text-primary">.</span></div>
    <p className="mt-3 text-xs font-semibold text-muted-foreground">DUBBING <span className="mx-2 text-primary">/</span> V2</p>
    <div className="mt-8 flex gap-1"><span className="app-intro-bar bg-primary" /><span className="app-intro-bar bg-vip" /><span className="app-intro-bar bg-discovery" /></div>
    <Button variant="ghost" onClick={() => done.current()} className="absolute bottom-10 rounded-full text-muted-foreground">O‘tkazib yuborish</Button>
  </div>;
};
