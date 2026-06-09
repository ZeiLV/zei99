import { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import { Maximize, Pause, Play, RotateCcw, RotateCw, Volume2, VolumeX, Gauge, Download, Crown, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { VipModal } from "./VipModal";
import { formatCountdown } from "@/lib/earlyAccess";
import { resolveSource } from "@/lib/videoSource";

interface Props {
  videoType?: "gdrive" | "direct";
  gdriveUrl?: string | null;
  videoUrl: string | null;
  isVip: boolean;
  earlyAccessUntil?: string | null;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const isHls = (url: string) => /\.m3u8(\?|$)/i.test(url);

export const VideoPlayer = ({ videoUrl, gdriveUrl, isVip, earlyAccessUntil }: Props) => {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!isVip || !earlyAccessUntil) return;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [isVip, earlyAccessUntil]);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

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
  const [videoAspect, setVideoAspect] = useState<number | null>(null);
  const hideTimer = useRef<number | null>(null);
  const flashTimer = useRef<number | null>(null);

  // Resolve source: prefer explicit videoUrl, fall back to gdriveUrl (legacy data)
  const rawSrc = (videoUrl?.trim() || gdriveUrl?.trim() || "").trim();
  const resolved = useMemo(() => resolveSource(rawSrc), [rawSrc]);
  const isIframe = resolved.kind === "iframe";
  const src = resolved.kind === "video" ? resolved.src : "";
  const hasSource = resolved.kind !== "empty";

  // Wire up <video> with HLS.js when needed
  useEffect(() => {
    if (isIframe) return;
    const v = videoRef.current;
    if (!v || !src) return;

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    setBuffering(true);
    setTime(0);
    setPlaying(false);
    setSpeed(1);
    setVideoAspect(null);

    if (isHls(src)) {
      if (v.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS (Safari, iOS)
        v.src = src;
      } else if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: false });
        hls.loadSource(src);
        hls.attachMedia(v);
        hlsRef.current = hls;
      } else {
        v.src = src;
      }
    } else {
      v.src = src;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, isIframe]);

  const armHide = () => {
    setShowControls(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setShowControls(false), 2000);
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
    const v: any = videoRef.current;
    // iOS Safari: only the <video> element supports webkitEnterFullscreen
    if (v?.webkitEnterFullscreen) { try { v.webkitEnterFullscreen(); return; } catch {} }
    const target: any = containerRef.current ?? v;
    const req =
      target?.requestFullscreen ||
      target?.webkitRequestFullscreen ||
      target?.mozRequestFullScreen ||
      target?.msRequestFullscreen;
    if (req) { try { req.call(target); } catch {} }
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (isVip || !hasSource) return;
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
  }, [isVip, hasSource]);

  const fmt = (s: number) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  };

  const { isVip: userIsVip } = useAuth();
  const [showVipModal, setShowVipModal] = useState(false);

  const handleDownload = () => {
    if (!userIsVip) { setShowVipModal(true); return; }
    if (!src) return;
    window.open(src, "_blank", "noopener,noreferrer");
  };

  // Aspect ratio strategy:
  //  - iframes: fixed 16/9 (we cannot know the source's native ratio)
  //  - <video>: start at 16/9, swap to the real ratio once metadata loads.
  //  - vertical videos are capped at 85vh so they never overflow the viewport.
  const isVertical = videoAspect != null && videoAspect < 1;
  const frameAspect = isIframe ? 16 / 9 : videoAspect ?? 16 / 9;

  return (
    <div className="relative w-auto -mx-[15px] sm:mx-auto sm:w-full md:max-w-[1200px]">
      {/* Ambient neon-blue theater glow */}
      <div
        aria-hidden
        className="absolute -inset-2 sm:-inset-6 rounded-2xl pointer-events-none animate-player-glow opacity-80 blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, hsl(var(--neon-cyan) / 0.35), hsl(var(--neon) / 0.18) 60%, transparent 80%)",
        }}
      />

      <div
        ref={containerRef}
        className="relative mx-auto w-full overflow-hidden bg-[#0A0F1E] player-frame fullscreen-target sm:rounded-xl border border-neon/30 shadow-[0_0_40px_-10px_hsl(var(--neon)/0.55),0_0_120px_-30px_hsl(var(--neon-cyan)/0.55)]"
        style={{
          aspectRatio: `${frameAspect}`,
          maxHeight: isVertical ? "85vh" : undefined,
          width: isVertical ? "auto" : "100%",
          zIndex: 9999,
        }}
      >
        {!isVip && hasSource && isIframe ? (
          <>
            <iframe
              key={resolved.kind === "iframe" ? resolved.src : "empty"}
              src={resolved.kind === "iframe" ? resolved.src : ""}
              className="absolute inset-0 w-full h-full"
              frameBorder={0}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen; accelerometer; gyroscope"
              allowFullScreen
              referrerPolicy="no-referrer"
            />
            <button
              onClick={goFullscreen}
              className="absolute bottom-2 right-2 z-[3] h-10 w-10 sm:h-9 sm:w-9 rounded-md bg-[#0A0F1E]/70 backdrop-blur-sm border border-neon/30 text-neon hover:bg-neon/15 transition-colors flex items-center justify-center"
              aria-label="To'liq ekran"
              title="To'liq ekran"
            >
              <Maximize className="h-5 w-5 sm:h-4 sm:w-4" />
            </button>
          </>
        ) : !isVip && hasSource ? (
          <>
            <video
              ref={videoRef}
              key={src}
              playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full object-contain bg-[#0A0F1E]"
              onClick={() => { armHide(); togglePlay(); }}
              onLoadedMetadata={(e) => {
                const el = e.currentTarget;
                setDuration(el.duration);
                if (el.videoWidth && el.videoHeight) {
                  setVideoAspect(el.videoWidth / el.videoHeight);
                }
              }}
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

            {/* Center action flash */}
            {flash && (
              <div className="pointer-events-none absolute inset-0 z-[6] flex items-center justify-center">
                <span
                  key={`flash-${flash}-${Date.now()}`}
                  className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-neon/15 backdrop-blur-sm flex items-center justify-center text-neon neon-glow-sm animate-scale-in"
                >
                  {flash === "play" && <Play className="h-9 w-9 sm:h-11 sm:w-11 ml-1" />}
                  {flash === "pause" && <Pause className="h-9 w-9 sm:h-11 sm:w-11" />}
                  {flash === "fwd" && <RotateCw className="h-8 w-8 sm:h-10 sm:w-10" />}
                  {flash === "back" && <RotateCcw className="h-8 w-8 sm:h-10 sm:w-10" />}
                </span>
              </div>
            )}

            {/* Big center play overlay when paused */}
            {!playing && !buffering && !flash && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center z-[6] group"
                aria-label="O'ynatish"
              >
                <span className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-neon/20 backdrop-blur-sm hover:bg-neon/30 flex items-center justify-center text-neon neon-glow-md group-hover:scale-110 transition-all">
                  <Play className="h-7 w-7 sm:h-9 sm:w-9 ml-1" />
                </span>
              </button>
            )}

            {/* Double-tap zones for mobile (skip ±10s) */}
            <div className="absolute inset-y-0 left-0 w-1/3 z-[5]" onDoubleClick={() => skip(-10)} />
            <div className="absolute inset-y-0 right-0 w-1/3 z-[5]" onDoubleClick={() => skip(10)} />

            {/* Controls */}
            <div
              className={`absolute inset-x-0 bottom-0 z-[7] transition-all duration-200 ${
                showControls || !playing ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
              }`}
              onMouseMove={armHide}
            >
              <div className="bg-gradient-to-t from-[#0A0F1E]/95 via-[#0A0F1E]/70 to-transparent px-3 py-3 sm:px-4 sm:py-4 flex flex-col gap-2">
                <div
                  className="h-1 hover:h-1.5 transition-all bg-white/15 rounded-full cursor-pointer relative group"
                  onClick={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    seek((e.clientX - r.left) / r.width);
                  }}
                >
                  <div
                    className="h-full bg-neon rounded-full relative neon-glow-sm"
                    style={{ width: `${duration ? (time / duration) * 100 : 0}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-3 w-3 rounded-full bg-neon opacity-0 group-hover:opacity-100 transition" />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-3 text-xs">
                  <button onClick={togglePlay} className="text-white hover:text-neon hover:bg-neon/10 rounded-md p-2 sm:p-1.5 transition-colors" aria-label={playing ? "Pauza" : "O'ynatish"}>
                    {playing ? <Pause className="h-6 w-6 sm:h-5 sm:w-5" /> : <Play className="h-6 w-6 sm:h-5 sm:w-5" />}
                  </button>

                  <button
                    onClick={() => { const v = videoRef.current; if (v) v.muted = !v.muted; }}
                    className="text-white hover:text-neon hover:bg-neon/10 rounded-md p-2 sm:p-1.5 transition-colors"
                    aria-label="Ovoz"
                  >
                    {muted || volume === 0 ? <VolumeX className="h-5 w-5 sm:h-4 sm:w-4" /> : <Volume2 className="h-5 w-5 sm:h-4 sm:w-4" />}
                  </button>

                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={muted ? 0 : volume}
                    onChange={(e) => {
                      const v = videoRef.current;
                      if (v) { v.volume = parseFloat(e.target.value); v.muted = false; }
                    }}
                    className="hidden sm:block w-20 accent-[hsl(var(--neon))]"
                  />

                  <button
                    onClick={goFullscreen}
                    className="ml-auto text-white hover:text-neon hover:bg-neon/10 rounded-md p-2 sm:p-1.5 transition-colors"
                    aria-label="To'liq ekran"
                  >
                    <Maximize className="h-5 w-5 sm:h-4 sm:w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Hover catcher */}
            <div
              className="absolute inset-0 z-[4]"
              onMouseMove={armHide}
              onMouseLeave={() => { if (playing) setShowControls(false); }}
              style={{ pointerEvents: showControls ? "none" : "auto" }}
            />
          </>
        ) : !isVip ? (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm bg-[#0A0F1E]">
            Video manbasi noto'g'ri
          </div>
        ) : null}

        {/* Buffering ring */}
        {!isVip && buffering && hasSource && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[6]">
            <div className="h-12 w-12 rounded-full border-2 border-neon/20 border-t-neon animate-spin-neon" />
          </div>
        )}

        {/* VIP / Early-access lock overlay */}
        {isVip && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-[#0A0F1E]/80 backdrop-blur-md px-6 text-center"
          >
            <div className="h-12 w-12 rounded-full flex items-center justify-center bg-neon/10 border border-neon/40 neon-glow-sm">
              <Lock className="h-5 w-5 text-neon" />
            </div>
            <div className="font-display text-sm sm:text-base text-foreground/90 max-w-md leading-relaxed">
              Ushbu qism hozircha faqat VIP foydalanuvchilar uchun ochiq.
            </div>
            {earlyAccessUntil && new Date(earlyAccessUntil).getTime() > Date.now() && (
              <div className="font-mono text-2xl sm:text-3xl multineon-text tracking-widest tabular-nums">
                {formatCountdown(earlyAccessUntil)}
              </div>
            )}
            <a
              href="https://t.me/ZeiContactBot"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full bg-neon text-primary-foreground font-display text-xs sm:text-sm tracking-widest neon-glow-lg hover:scale-105 transition-transform inline-flex items-center gap-2"
            >
              <Crown className="h-4 w-4" />
              VIP SOTIB OLISH
            </a>
          </div>
        )}
      </div>

      {/* Download button */}
      {!isVip && hasSource && !isIframe && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={handleDownload}
            className={`inline-flex items-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg transition-all text-xs sm:text-sm font-display tracking-widest hover:scale-[1.03] active:scale-95 ${
              userIsVip
                ? "bg-secondary/80 hover:bg-secondary text-foreground border border-neon/30 hover:border-neon/60 neon-glow-sm"
                : "bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 hover:border-amber-400/60"
            }`}
            aria-label="Yuklab olish"
          >
            {userIsVip ? <Download className="h-4 w-4 text-neon" /> : <Crown className="h-4 w-4" />}
            <span>{userIsVip ? "YUKLAB OLISH" : "VIP YUKLAB OLISH"}</span>
          </button>
        </div>
      )}

      <VipModal open={showVipModal} onOpenChange={setShowVipModal} />
    </div>
  );
};
