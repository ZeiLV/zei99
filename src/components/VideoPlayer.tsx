import { useEffect, useRef, useState } from "react";
import { gdriveToStream } from "@/lib/gdrive";
import { Maximize, Pause, Play, RotateCcw, RotateCw, Volume2, VolumeX, Gauge, Download } from "lucide-react";

interface Props {
  videoType: "gdrive" | "direct";
  gdriveUrl: string | null;
  videoUrl: string | null;
  isVip: boolean;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export const VideoPlayer = ({ videoType, gdriveUrl, videoUrl, isVip }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [buffering, setBuffering] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [flash, setFlash] = useState<null | "back" | "fwd" | "play" | "pause">(null);
  const hideTimer = useRef<number | null>(null);
  const watchdog = useRef<number | null>(null);
  const flashTimer = useRef<number | null>(null);

  const isDirect = videoType === "direct" && !!videoUrl;
  const { fileId, preview } = gdriveToStream(gdriveUrl ?? "");
  const driveSrc = preview ?? "";
  const directSrc = videoUrl ?? "";

  useEffect(() => {
    setBuffering(true);
    setTime(0);
    setPlaying(false);
    setSpeed(1);
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

  const triggerFlash = (kind: "back" | "fwd" | "play" | "pause") => {
    setFlash(kind);
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(null), 500);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); triggerFlash("play"); }
    else { v.pause(); triggerFlash("pause"); }
  };

  const skip = (delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + delta));
    triggerFlash(delta > 0 ? "fwd" : "back");
    armHide();
  };

  const changeSpeed = (s: number) => {
    const v = videoRef.current;
    if (v) v.playbackRate = s;
    setSpeed(s);
    setSpeedOpen(false);
    armHide();
  };

  const seek = (pct: number) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    v.currentTime = pct * v.duration;
  };

  const goFullscreen = () => {
    const doc: any = document;
    const isFs = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement;
    if (isFs) {
      (doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen)?.call(doc);
      return;
    }
    // Target the actual media element so no surrounding chrome is visible
    const target: any = isDirect ? videoRef.current : iframeRef.current;
    if (!target) return;
    const req =
      target.requestFullscreen ||
      target.webkitRequestFullscreen ||
      target.webkitEnterFullscreen ||
      target.mozRequestFullScreen ||
      target.msRequestFullscreen;
    if (req) {
      try { req.call(target); } catch { /* noop */ }
    } else if (containerRef.current) {
      // Last resort
      (containerRef.current as any).requestFullscreen?.();
    }
  };

  // Keyboard shortcuts (direct only)
  useEffect(() => {
    if (!isDirect) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === " " || e.key === "k") { e.preventDefault(); togglePlay(); armHide(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); skip(10); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); skip(-10); }
      else if (e.key === "f") { e.preventDefault(); goFullscreen(); }
      else if (e.key === "m") { const v = videoRef.current; if (v) v.muted = !v.muted; armHide(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirect]);

  const fmt = (s: number) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  };

  const hasSource = isDirect ? !!directSrc : !!fileId;

  const downloadUrl = isDirect
    ? directSrc
    : fileId
    ? `https://drive.google.com/uc?export=download&id=${fileId}`
    : "";

  const handleDownload = () => {
    if (!downloadUrl) return;
    // Open in new tab — browser handles direct download or Drive virus-scan page
    window.open(downloadUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="relative w-full">
      {/* Breathing glow halo behind player */}
      <div
        aria-hidden
        className="absolute -inset-3 sm:-inset-4 rounded-2xl pointer-events-none animate-player-glow opacity-70 blur-2xl"
      />

      <div
        ref={containerRef}
        className="relative w-full overflow-hidden bg-transparent player-frame fullscreen-target"
        style={{ zIndex: 9999 }}
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

              {/* Center action flash (play/pause/skip) */}
              {flash && (
                <div className="pointer-events-none absolute inset-0 z-[6] flex items-center justify-center">
                  <span
                    key={`flash-${flash}-${Date.now()}`}
                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white animate-scale-in"
                  >
                    {flash === "play" && <Play className="h-9 w-9 sm:h-11 sm:w-11 ml-1" />}
                    {flash === "pause" && <Pause className="h-9 w-9 sm:h-11 sm:w-11" />}
                    {flash === "fwd" && <RotateCw className="h-8 w-8 sm:h-10 sm:w-10" />}
                    {flash === "back" && <RotateCcw className="h-8 w-8 sm:h-10 sm:w-10" />}
                  </span>
                </div>
              )}

              {/* Big center play overlay when paused (and no flash to avoid double) */}
              {!playing && !buffering && !flash && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center z-[6] group"
                  aria-label="O'ynatish"
                >
                  <span className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-all">
                    <Play className="h-7 w-7 sm:h-9 sm:w-9 ml-1" />
                  </span>
                </button>
              )}

              {/* Double-tap zones for mobile (skip ±10s) */}
              <div className="absolute inset-y-0 left-0 w-1/3 z-[5]" onDoubleClick={() => skip(-10)} />
              <div className="absolute inset-y-0 right-0 w-1/3 z-[5]" onDoubleClick={() => skip(10)} />

              {/* Native controls — only on hover/move, only direct */}
              <div
                className={`absolute inset-x-0 bottom-0 z-[7] transition-all duration-200 ${
                  showControls || !playing ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
                }`}
                onMouseMove={armHide}
              >
                <div className="bg-gradient-to-t from-black/90 via-black/55 to-transparent px-3 py-3 sm:px-4 sm:py-4 flex flex-col gap-2">
                  <div
                    className="h-1 hover:h-1.5 transition-all bg-white/15 rounded-full cursor-pointer relative group"
                    onClick={(e) => {
                      const r = e.currentTarget.getBoundingClientRect();
                      seek((e.clientX - r.left) / r.width);
                    }}
                  >
                    <div
                      className="h-full bg-white rounded-full relative"
                      style={{ width: `${duration ? (time / duration) * 100 : 0}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-3 w-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 text-xs">
                    <button onClick={togglePlay} className="text-white hover:bg-white/10 rounded-md p-1.5 transition-colors" aria-label={playing ? "Pauza" : "O'ynatish"}>
                      {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </button>

                    <button
                      onClick={() => skip(-10)}
                      className="text-white hover:bg-white/10 rounded-md p-1.5 transition-colors flex items-center gap-0.5"
                      aria-label="10 soniya orqaga"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span className="text-[10px] font-display tracking-wider">10</span>
                    </button>

                    <button
                      onClick={() => skip(10)}
                      className="text-white hover:bg-white/10 rounded-md p-1.5 transition-colors flex items-center gap-0.5"
                      aria-label="10 soniya oldinga"
                    >
                      <RotateCw className="h-4 w-4" />
                      <span className="text-[10px] font-display tracking-wider">10</span>
                    </button>

                    <button
                      onClick={() => {
                        const v = videoRef.current;
                        if (v) v.muted = !v.muted;
                      }}
                      className="text-white hover:bg-white/10 rounded-md p-1.5 transition-colors"
                      aria-label="Ovoz"
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
                      className="hidden sm:block w-20 accent-white"
                    />

                    <span className="text-white/80 tabular-nums text-[11px]">
                      {fmt(time)} / {fmt(duration)}
                    </span>

                    {/* Speed selector */}
                    <div className="ml-auto relative">
                      <button
                        onClick={() => setSpeedOpen((o) => !o)}
                        className="text-white hover:bg-white/10 transition-colors flex items-center gap-1 px-2 py-1 rounded-md"
                        aria-label="Tezlik"
                      >
                        <Gauge className="h-4 w-4" />
                        <span className="text-[11px] font-display tracking-wider tabular-nums">{speed}x</span>
                      </button>
                      {speedOpen && (
                        <div className="absolute bottom-full right-0 mb-2 bg-black/80 backdrop-blur-sm rounded-lg p-1 flex flex-col min-w-[80px] animate-scale-in z-[8] border border-white/10">
                          {SPEEDS.map((s) => (
                            <button
                              key={s}
                              onClick={() => changeSpeed(s)}
                              className={`px-3 py-1.5 text-[11px] font-display tracking-wider rounded-md text-left transition-colors ${
                                s === speed ? "text-white bg-white/15" : "text-white/85 hover:text-white hover:bg-white/10"
                              }`}
                            >
                              {s}x
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={goFullscreen}
                      className="text-white hover:bg-white/10 rounded-md p-1.5 transition-colors"
                      aria-label="To'liq ekran"
                    >
                      <Maximize className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Hover catcher (desktop) */}
              <div
                className="absolute inset-0 z-[4]"
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
                ref={iframeRef}
                src={driveSrc}
                className="absolute inset-0 w-full h-full block"
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                allowFullScreen
                {...({ webkitallowfullscreen: "true", mozallowfullscreen: "true" } as any)}
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
