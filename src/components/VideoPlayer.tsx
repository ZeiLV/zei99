import { useEffect, useRef, useState } from "react";
import { gdriveToStream } from "@/lib/gdrive";
import { Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";

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
  const [showControls, setShowControls] = useState(false);
  const hideTimer = useRef<number | null>(null);
  const watchdog = useRef<number | null>(null);

  const isDirect = videoType === "direct" && !!videoUrl;
  const { fileId, preview } = gdriveToStream(gdriveUrl ?? "");
  const driveSrc = preview ?? "";
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

  const hasSource = isDirect ? !!directSrc : !!fileId;

  return (
    <div className="relative w-full">
      {/* Breathing glow halo behind player */}
      <div
        aria-hidden
        className="absolute -inset-3 sm:-inset-4 rounded-2xl pointer-events-none animate-player-glow opacity-70 blur-2xl"
      />

      <div
        ref={containerRef}
        className="relative w-full overflow-hidden bg-transparent player-frame"
      >
        {!isVip && hasSource ? (
          isDirect ? (
            <>
              <video
                ref={videoRef}
                key={`direct-${directSrc}`}
                src={directSrc}
                playsInline
                preload="metadata"
                className="block w-full h-auto max-h-[85vh] object-contain bg-black"
                onClick={() => {
                  armHide();
                  togglePlay();
                }}
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

              {/* Big center play overlay when paused */}
              {!playing && !buffering && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center z-[6] group"
                  aria-label="O'ynatish"
                >
                  <span className="h-16 w-16 sm:h-20 sm:w-20 rounded-full glass-strong flex items-center justify-center text-neon group-hover:scale-110 transition-transform neon-glow-md">
                    <Play className="h-7 w-7 sm:h-9 sm:w-9 ml-1" />
                  </span>
                </button>
              )}

              {/* Native controls — only on hover/move, only direct */}
              <div
                className={`absolute inset-x-0 bottom-0 z-[7] transition-opacity duration-300 ${
                  showControls || !playing ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                onMouseMove={armHide}
              >
                <div className="bg-gradient-to-t from-black/85 via-black/50 to-transparent px-3 py-3 sm:px-4 sm:py-4 flex flex-col gap-2">
                  <div
                    className="h-1 hover:h-1.5 transition-all bg-white/15 rounded-full cursor-pointer relative group"
                    onClick={(e) => {
                      const r = e.currentTarget.getBoundingClientRect();
                      seek((e.clientX - r.left) / r.width);
                    }}
                  >
                    <div
                      className="h-full bg-neon rounded-full relative"
                      style={{ width: `${duration ? (time / duration) * 100 : 0}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-3 w-3 rounded-full bg-neon opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <button onClick={togglePlay} className="text-white hover:text-neon transition-colors">
                      {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </button>

                    <button
                      onClick={() => {
                        const v = videoRef.current;
                        if (v) v.muted = !v.muted;
                      }}
                      className="text-white hover:text-neon transition-colors"
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
                      className="hidden sm:block w-20 accent-neon"
                    />

                    <span className="text-white/80 tabular-nums text-[11px]">
                      {fmt(time)} / {fmt(duration)}
                    </span>

                    <button
                      onClick={goFullscreen}
                      className="ml-auto text-white hover:text-neon transition-colors"
                      aria-label="To'liq ekran"
                    >
                      <Maximize className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Hover catcher (desktop) */}
              <div
                className="absolute inset-0 z-[5]"
                onMouseMove={armHide}
                onMouseLeave={() => {
                  if (playing) setShowControls(false);
                }}
                style={{ pointerEvents: showControls ? "none" : "auto" }}
              />
            </>
          ) : (
            <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
              <iframe
                src={driveSrc}
                className="absolute inset-0 w-full h-full block"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                referrerPolicy="no-referrer"
                onLoad={() => {
                  setBuffering(false);
                  if (watchdog.current) window.clearTimeout(watchdog.current);
                }}
              />
            </div>
          )
        ) : !isVip ? (
          <div className="w-full flex items-center justify-center text-muted-foreground text-sm bg-black" style={{ aspectRatio: "16 / 9" }}>
            Video manbasi noto'g'ri
          </div>
        ) : null}

        {/* Buffering ring */}
        {!isVip && buffering && hasSource && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[6]">
            <div className="h-12 w-12 rounded-full border-2 border-neon/20 border-t-neon animate-spin-neon" />
          </div>
        )}

        {/* VIP overlay */}
        {isVip && (
          <div
            className="w-full flex flex-col items-center justify-center gap-4 z-10 bg-background/60 backdrop-blur-sm"
            style={{ aspectRatio: "16 / 9" }}
          >
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
    </div>
  );
};
