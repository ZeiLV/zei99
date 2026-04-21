import { useEffect, useRef, useState } from "react";
import { gdriveToStream } from "@/lib/gdrive";
import { Maximize, RefreshCw } from "lucide-react";

interface Props {
  gdriveUrl: string;
  isVip: boolean;
}

export const VideoPlayer = ({ gdriveUrl, isVip }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [buffering, setBuffering] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [skipHint, setSkipHint] = useState<{ side: "left" | "right" } | null>(null);
  const lastTap = useRef<{ time: number; x: number } | null>(null);
  const watchdog = useRef<number | null>(null);

  const { fileId, preview } = gdriveToStream(gdriveUrl);
  // Drive preview URL — most reliable cross-browser playback for shared Drive videos.
  const src = preview ? `${preview}?t=${reloadKey}` : "";

  // Watchdog: if iframe doesn't fire onLoad within 12s, surface a Reload button.
  useEffect(() => {
    setBuffering(true);
    if (watchdog.current) window.clearTimeout(watchdog.current);
    watchdog.current = window.setTimeout(() => setBuffering(false), 12000);
    return () => {
      if (watchdog.current) window.clearTimeout(watchdog.current);
    };
  }, [src]);

  const reload = () => setReloadKey((k) => k + 1);

  const goFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  };

  // Visual-only ±5s hint (Drive iframe controls own playback; we can't seek through it).
  const onTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isVip) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const now = Date.now();
    if (lastTap.current && now - lastTap.current.time < 280 && Math.abs(x - lastTap.current.x) < 60) {
      const w = rect.width;
      if (x < w * 0.3) {
        setSkipHint({ side: "left" });
        setTimeout(() => setSkipHint(null), 600);
      } else if (x > w * 0.7) {
        setSkipHint({ side: "right" });
        setTimeout(() => setSkipHint(null), 600);
      }
      lastTap.current = null;
    } else {
      lastTap.current = { time: now, x };
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-xl overflow-hidden neon-border animate-neon-pulse bg-black"
    >
      {!isVip && fileId ? (
        <>
          <iframe
            ref={iframeRef}
            key={reloadKey}
            src={src}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            referrerPolicy="no-referrer"
            onLoad={() => {
              setBuffering(false);
              if (watchdog.current) window.clearTimeout(watchdog.current);
            }}
          />

          {/* Tap layer for ±5s visual hint (above iframe but transparent to interactions on the video itself).
              We sit on the bottom strip only so Drive's native controls remain usable. */}
          <div
            className="absolute inset-x-0 top-0 h-1/2"
            onClick={onTap}
            aria-hidden
          />

          {/* Mask Drive's external "open in new tab" button (top-right) */}
          <div
            className="absolute top-0 right-0 w-14 h-12 bg-black pointer-events-auto z-[5]"
            aria-hidden
          />
        </>
      ) : !isVip ? (
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
          Video manbasi noto'g'ri
        </div>
      ) : null}

      {/* Buffering ring */}
      {!isVip && buffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[6]">
          <div className="h-12 w-12 rounded-full border-2 border-neon/20 border-t-neon animate-spin-neon neon-glow-sm" />
        </div>
      )}

      {/* Skip hint */}
      {skipHint && (
        <div
          className={`absolute top-1/4 -translate-y-1/2 ${
            skipHint.side === "left" ? "left-6" : "right-6"
          } font-display neon-text text-xl sm:text-2xl pointer-events-none animate-fade-up z-[7]`}
        >
          {skipHint.side === "left" ? "<< 5s" : ">> 5s"}
        </div>
      )}

      {/* Floating action buttons: reload + fullscreen */}
      {!isVip && fileId && (
        <div className="absolute top-2 left-2 flex gap-2 z-[8]">
          <button
            onClick={reload}
            className="h-9 w-9 rounded-full glass-strong flex items-center justify-center text-neon hover:neon-glow-sm transition-all"
            aria-label="Qayta yuklash"
            title="Qayta yuklash"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={goFullscreen}
            className="h-9 w-9 rounded-full glass-strong flex items-center justify-center text-neon hover:neon-glow-sm transition-all"
            aria-label="To'liq ekran"
            title="To'liq ekran"
          >
            <Maximize className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* VIP overlay */}
      {isVip && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-background/40">
          <div className="font-display text-lg sm:text-2xl multineon-text tracking-widest text-center px-6">
            VIP Obuna Bo'ling
          </div>
          <a
            href="https://t.me/m/QoYHq2A0Nzgy"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-full bg-neon text-primary-foreground font-display text-sm tracking-widest neon-glow-lg hover:scale-105 transition-transform"
          >
            OBUNA BO'LISH
          </a>
        </div>
      )}
    </div>
  );
};
