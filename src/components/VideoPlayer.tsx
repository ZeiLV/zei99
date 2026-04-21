import { useEffect, useRef, useState } from "react";
import { gdriveToStream } from "@/lib/gdrive";
import { Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";

interface Props {
  gdriveUrl: string;
  isVip: boolean;
}

const QUALITIES = ["720p", "1080p", "4K"] as const;

export const VideoPlayer = ({ gdriveUrl, isVip }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [buffering, setBuffering] = useState(true);
  const [quality, setQuality] = useState<typeof QUALITIES[number]>("1080p");
  const [skipHint, setSkipHint] = useState<{ side: "left" | "right" } | null>(null);
  const lastTap = useRef<{ time: number; x: number } | null>(null);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef<number | null>(null);
  const [useIframeFallback, setUseIframeFallback] = useState(false);

  const { fileId, preview, direct } = gdriveToStream(gdriveUrl);

  useEffect(() => {
    setUseIframeFallback(false);
    setBuffering(true);
    setTime(0);
    setPlaying(false);
  }, [gdriveUrl]);

  const armHide = () => {
    setShowControls(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setShowControls(false), 2800);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  const doSkip = (side: "left" | "right", el: HTMLElement) => {
    const v = videoRef.current;
    if (v) {
      if (side === "left") v.currentTime = Math.max(0, v.currentTime - 5);
      else v.currentTime = Math.min(v.duration || 0, v.currentTime + 5);
    } else if (useIframeFallback) {
      // Iframe fallback: visual hint only (Drive iframe controls own playback)
    }
    setSkipHint({ side });
    setTimeout(() => setSkipHint(null), 600);
  };

  const onTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isVip) return;
    armHide();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const now = Date.now();
    if (lastTap.current && now - lastTap.current.time < 280 && Math.abs(x - lastTap.current.x) < 60) {
      const w = rect.width;
      if (x < w * 0.3) doSkip("left", e.currentTarget);
      else if (x > w * 0.7) doSkip("right", e.currentTarget);
      else togglePlay();
      lastTap.current = null;
    } else {
      lastTap.current = { time: now, x };
    }
  };

  const seek = (pct: number) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    v.currentTime = pct * v.duration;
  };

  const goFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  };

  const fmt = (s: number) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  };

  // Iframe variant of preview URL that hides Drive's "open in new tab" / external action button.
  const cleanPreview = preview ? `${preview}?usp=embed&rm=minimal` : "";

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-xl overflow-hidden neon-border animate-neon-pulse bg-black"
      onMouseMove={armHide}
    >
      <div
        className={`absolute inset-0 ${isVip ? "blur-2xl scale-110 pointer-events-none" : ""}`}
        onClick={onTap}
      >
        {!useIframeFallback && fileId ? (
          <video
            ref={videoRef}
            src={direct}
            crossOrigin="anonymous"
            playsInline
            preload="metadata"
            className="w-full h-full object-contain bg-black"
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onWaiting={() => setBuffering(true)}
            onPlaying={() => setBuffering(false)}
            onCanPlay={() => setBuffering(false)}
            onError={() => setUseIframeFallback(true)}
            onVolumeChange={(e) => {
              setVolume(e.currentTarget.volume);
              setMuted(e.currentTarget.muted);
            }}
          />
        ) : fileId ? (
          <div className="relative w-full h-full">
            <iframe
              src={cleanPreview}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
              onLoad={() => setBuffering(false)}
            />
            {/* Mask to hide Drive's external/open-in-new-tab button (top-right corner) */}
            <div
              className="absolute top-0 right-0 w-16 h-12 bg-black pointer-events-auto"
              aria-hidden
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Video manbasi noto'g'ri
          </div>
        )}
      </div>

      {/* Buffering ring */}
      {!isVip && buffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-12 w-12 rounded-full border-2 border-neon/20 border-t-neon animate-spin-neon neon-glow-sm" />
        </div>
      )}

      {/* Skip hint */}
      {skipHint && (
        <div
          className={`absolute top-1/2 -translate-y-1/2 ${
            skipHint.side === "left" ? "left-6" : "right-6"
          } font-display neon-text text-xl sm:text-2xl pointer-events-none animate-fade-up`}
        >
          {skipHint.side === "left" ? "<< 5s" : ">> 5s"}
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

      {/* Controls (only for native video element) */}
      {!isVip && !useIframeFallback && fileId && (
        <div
          className={`absolute inset-x-0 bottom-0 transition-opacity duration-300 ${
            showControls || !playing ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="glass-strong px-3 py-2 sm:px-4 sm:py-3 m-2 sm:m-3 rounded-lg flex flex-col gap-2">
            {/* Scrubber */}
            <div
              className="h-1 bg-neon/15 rounded-full cursor-pointer relative"
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                seek((e.clientX - r.left) / r.width);
              }}
            >
              <div
                className="h-full bg-neon rounded-full neon-glow-sm"
                style={{ width: `${duration ? (time / duration) * 100 : 0}%` }}
              />
            </div>

            <div className="flex items-center gap-2 sm:gap-3 text-xs">
              <button onClick={togglePlay} className="text-neon hover:scale-110 transition-transform">
                {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>

              <button
                onClick={() => {
                  const v = videoRef.current;
                  if (v) v.muted = !v.muted;
                }}
                className="text-neon hover:scale-110 transition-transform"
              >
                {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  const v = videoRef.current;
                  if (v) {
                    v.volume = parseFloat(e.target.value);
                    v.muted = false;
                  }
                }}
                className="w-16 sm:w-24 accent-neon"
              />

              <span className="text-foreground/80 tabular-nums text-[11px]">
                {fmt(time)} / {fmt(duration)}
              </span>

              <div className="ml-auto flex items-center gap-1">
                {QUALITIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuality(q)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-display tracking-widest transition-all ${
                      quality === q ? "bg-neon/20 text-neon neon-glow-sm" : "text-muted-foreground hover:text-neon"
                    }`}
                  >
                    {q}
                  </button>
                ))}
                <button onClick={goFullscreen} className="text-neon hover:scale-110 transition-transform ml-1">
                  <Maximize className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Iframe fallback: minimal overlay with seek hints area only — external button covered */}
      {!isVip && useIframeFallback && fileId && (
        <div className="absolute bottom-3 right-3 text-[10px] font-display tracking-widest text-foreground/50 pointer-events-none">
          ZEI · PLAYER
        </div>
      )}
    </div>
  );
};
