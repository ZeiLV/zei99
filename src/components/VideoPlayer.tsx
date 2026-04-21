import { useEffect, useRef, useState } from "react";
import { gdriveToStream } from "@/lib/gdrive";
import { Maximize, Pause, Play, RefreshCw, Volume2, VolumeX } from "lucide-react";

interface Props {
  videoType: "gdrive" | "direct";
  gdriveUrl: string | null;
  videoUrl: string | null;
  isVip: boolean;
}

export const VideoPlayer = ({ videoType, gdriveUrl, videoUrl, isVip }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [buffering, setBuffering] = useState(true);
  const [skipHint, setSkipHint] = useState<{ side: "left" | "right" } | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const lastTap = useRef<{ time: number; x: number } | null>(null);
  const hideTimer = useRef<number | null>(null);
  const watchdog = useRef<number | null>(null);

  const isDirect = videoType === "direct" && !!videoUrl;
  const { fileId, preview } = gdriveToStream(gdriveUrl ?? "");
  const driveSrc = preview ? `${preview}?t=${reloadKey}` : "";
  const directSrc = videoUrl ?? "";

  useEffect(() => {
    setBuffering(true);
    setTime(0);
    setPlaying(false);
    if (watchdog.current) window.clearTimeout(watchdog.current);
    watchdog.current = window.setTimeout(() => setBuffering(false), 12000);
    return () => {
      if (watchdog.current) window.clearTimeout(watchdog.current);
    };
  }, [directSrc, driveSrc]);

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

  const doSkip = (side: "left" | "right") => {
    setSkipHint({ side });
    setTimeout(() => setSkipHint(null), 600);
    const v = videoRef.current;
    if (v && isDirect) {
      if (side === "left") v.currentTime = Math.max(0, v.currentTime - 5);
      else v.currentTime = Math.min(v.duration || 0, v.currentTime + 5);
    }
  };

  const onTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isVip) return;
    armHide();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const now = Date.now();
    if (lastTap.current && now - lastTap.current.time < 280 && Math.abs(x - lastTap.current.x) < 60) {
      const w = rect.width;
      if (x < w * 0.3) doSkip("left");
      else if (x > w * 0.7) doSkip("right");
      else if (isDirect) togglePlay();
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

  const reload = () => setReloadKey((k) => k + 1);

  const fmt = (s: number) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  };

  const hasSource = isDirect ? !!directSrc : !!fileId;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-xl overflow-hidden neon-border bg-black"
      onMouseMove={armHide}
    >
      {!isVip && hasSource ? (
        isDirect ? (
          <video
            ref={videoRef}
            key={`direct-${directSrc}`}
            src={directSrc}
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-contain bg-black"
            onClick={onTap}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onWaiting={() => setBuffering(true)}
            onPlaying={() => setBuffering(false)}
            onCanPlay={() => setBuffering(false)}
            onVolumeChange={(e) => {
              setVolume(e.currentTarget.volume);
              setMuted(e.currentTarget.muted);
            }}
          />
        ) : (
          <>
            <iframe
              key={`gd-${reloadKey}`}
              src={driveSrc}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              referrerPolicy="no-referrer"
              onLoad={() => {
                setBuffering(false);
                if (watchdog.current) window.clearTimeout(watchdog.current);
              }}
            />
            {/* Skip hint tap zone — covers top half so Drive native controls remain usable below */}
            <div className="absolute inset-x-0 top-0 h-1/2 z-[2]" onClick={onTap} aria-hidden />
            {/* Mask Drive's external link button (top-right) */}
            <div className="absolute top-0 right-0 w-14 h-12 bg-black z-[3]" aria-hidden />
          </>
        )
      ) : !isVip ? (
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
          Video manbasi noto'g'ri
        </div>
      ) : null}

      {/* Buffering ring */}
      {!isVip && buffering && hasSource && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[5]">
          <div className="h-12 w-12 rounded-full border-2 border-neon/20 border-t-neon animate-spin-neon neon-glow-sm" />
        </div>
      )}

      {/* Skip hint */}
      {skipHint && (
        <div
          className={`absolute top-1/3 -translate-y-1/2 ${
            skipHint.side === "left" ? "left-6" : "right-6"
          } font-display neon-text text-xl sm:text-2xl pointer-events-none animate-fade-up z-[6]`}
        >
          {skipHint.side === "left" ? "<< 5s" : ">> 5s"}
        </div>
      )}

      {/* Floating actions: reload (drive only) + fullscreen */}
      {!isVip && hasSource && (
        <div className="absolute top-2 left-2 flex gap-2 z-[8]">
          {!isDirect && (
            <button
              onClick={reload}
              className="h-9 w-9 rounded-full glass-strong flex items-center justify-center text-neon hover:neon-glow-sm transition-all"
              aria-label="Qayta yuklash"
              title="Qayta yuklash"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Native controls — only for direct videos */}
      {!isVip && isDirect && (
        <div
          className={`absolute inset-x-0 bottom-0 z-[7] transition-opacity duration-300 ${
            showControls || !playing ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="glass-strong px-3 py-2 sm:px-4 sm:py-3 m-2 sm:m-3 rounded-lg flex flex-col gap-2">
            <div
              className="h-1.5 bg-neon/15 rounded-full cursor-pointer relative group"
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                seek((e.clientX - r.left) / r.width);
              }}
            >
              <div
                className="h-full bg-neon rounded-full neon-glow-sm relative"
                style={{ width: `${duration ? (time / duration) * 100 : 0}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-3 w-3 rounded-full bg-neon opacity-0 group-hover:opacity-100 transition" />
              </div>
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

              <button onClick={goFullscreen} className="ml-auto text-neon hover:scale-110 transition-transform">
                <Maximize className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen button for iframe variant (drive has its own controls) */}
      {!isVip && !isDirect && hasSource && (
        <button
          onClick={goFullscreen}
          className="absolute top-2 right-16 h-9 w-9 rounded-full glass-strong flex items-center justify-center text-neon hover:neon-glow-sm transition-all z-[8]"
          aria-label="To'liq ekran"
          title="To'liq ekran"
        >
          <Maximize className="h-4 w-4" />
        </button>
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
