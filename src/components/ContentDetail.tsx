import { useEffect, useMemo, useRef, useState } from "react";
import { Content, Episode } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Star, Eye, Calendar, Clock, Clock3, Lock, Play } from "lucide-react";
import { VideoPlayer } from "./VideoPlayer";
import { Reviews } from "./Reviews";
import { isEpisodeLocked, isInEarlyAccess, formatCountdown } from "@/lib/earlyAccess";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  content: Content;
  onBack: () => void;
  initialEpisodeNumber?: number | null;
}

const formatViews = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
};

export const ContentDetail = ({ content, onBack, initialEpisodeNumber }: Props) => {
  const { isVip: userIsVip } = useAuth();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selected, setSelected] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);
  const [server, setServer] = useState<1 | 2>(1);
  const [quality, setQuality] = useState<"hd" | "4k">("hd");
  const viewLogged = useRef(false);
  const playerRef = useRef<HTMLDivElement>(null);

  // Re-render every second so countdowns update
  useEffect(() => {
    const hasCountdown = episodes.some((e) => isInEarlyAccess(e));
    if (!hasCountdown) return;
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [episodes]);

  // Force desktop viewport on the watch page (mobile responsiveness preserved elsewhere)
  useEffect(() => {
    const meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
    if (!meta) return;
    const original = meta.getAttribute("content") ?? "width=device-width, initial-scale=1, viewport-fit=cover";
    meta.setAttribute("content", "width=1280, viewport-fit=cover");
    return () => {
      meta.setAttribute("content", original);
    };
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("episodes")
        .select("*")
        .eq("content_id", content.id)
        .order("episode_number", { ascending: true });
      const eps = (data ?? []) as Episode[];
      setEpisodes(eps);

      // Pick deep-linked episode if present, otherwise first
      const target =
        (initialEpisodeNumber != null
          ? eps.find((e) => e.episode_number === initialEpisodeNumber)
          : null) ?? eps[0] ?? null;
      setSelected(target);
      setLoading(false);

      // Smooth scroll to player when arriving via deep link
      if (initialEpisodeNumber != null && target) {
        setTimeout(() => {
          playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 250);
      }
    })();
  }, [content.id, initialEpisodeNumber]);

  // Increment view once per content open (when an unlocked episode actually plays)
  useEffect(() => {
    if (!selected || isEpisodeLocked(selected, userIsVip) || viewLogged.current) return;
    viewLogged.current = true;
    supabase.rpc("increment_views", { _content_id: content.id });
  }, [selected, content.id, userIsVip]);

  return (
    <div className="min-h-screen pt-20 sm:pt-24 animate-fade-up">
      {/* Banner */}
      <div className="relative h-48 sm:h-72 md:h-96 w-full overflow-hidden">
        {content.banner_url ? (
          <img src={content.banner_url} alt={content.title} className="w-full h-full object-cover" />
        ) : content.poster_url ? (
          <img
            src={content.poster_url}
            alt={content.title}
            className="w-full h-full object-cover blur-md scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-secondary to-background" />
        )}
        <div
          className="absolute inset-0"
          style={{ background: "var(--gradient-banner)" }}
        />
        <button
          onClick={onBack}
          className="absolute top-4 left-4 h-10 w-10 rounded-full glass flex items-center justify-center text-neon hover:neon-glow-sm transition-all"
          aria-label="Orqaga"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="max-w-[1440px] mx-auto px-[15px] sm:px-8 -mt-20 sm:-mt-28 relative z-10">
        <h1 className="font-display text-2xl sm:text-4xl font-black neon-text">{content.title}</h1>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-foreground/70">
          {content.rating != null && content.rating > 0 && (
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-neon text-neon" />
              <span className="text-foreground">{content.rating.toFixed(1)}</span>
            </span>
          )}
          {content.year && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {content.year}
            </span>
          )}
          {content.duration && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {content.duration}
            </span>
          )}
          {content.views > 0 && (
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {formatViews(content.views)}
            </span>
          )}
        </div>

        {content.genre?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {content.genre.map((g) => (
              <span
                key={g}
                className="px-2.5 py-1 rounded-full glass text-[11px] font-display tracking-widest text-neon"
              >
                {g}
              </span>
            ))}
          </div>
        )}
        {content.description && (
          <p className="mt-4 text-sm sm:text-base text-foreground/80 leading-relaxed max-w-3xl">
            {content.description}
          </p>
        )}

        {/* Player */}
        {selected && (() => {
          const has4K = !!selected.quality_4k_url;
          const hasServer2 = !!selected.server2_url;
          return (
            <div ref={playerRef} className="mt-10 sm:mt-12 scroll-mt-24" style={{ marginBottom: "2.5rem" }}>
              {/* Server / Quality controls */}
              {(hasServer2 || has4K) && (
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {hasServer2 && (
                    <div className="flex items-center gap-1 glass rounded-full p-1">
                      <span className="text-[10px] font-display tracking-widest text-foreground/60 px-2">SERVER</span>
                      {[1, 2].map((s) => (
                        <button
                          key={s}
                          onClick={() => setServer(s as 1 | 2)}
                          className={`px-3 py-1 rounded-full text-[10px] font-display tracking-widest transition-all ${
                            server === s ? "bg-neon/20 text-neon neon-glow-sm" : "text-foreground/60 hover:text-neon"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                  {has4K && (
                    <div className="flex items-center gap-1 glass rounded-full p-1">
                      <span className="text-[10px] font-display tracking-widest text-foreground/60 px-2">SIFAT</span>
                      {(["hd", "4k"] as const).map((q) => (
                        <button
                          key={q}
                          onClick={() => {
                            if (q === "4k" && !userIsVip) return;
                            setQuality(q);
                          }}
                          className={`px-3 py-1 rounded-full text-[10px] font-display tracking-widest transition-all ${
                            quality === q
                              ? "bg-neon/20 text-neon neon-glow-sm"
                              : q === "4k" && !userIsVip
                              ? "text-amber-400/70"
                              : "text-foreground/60 hover:text-neon"
                          }`}
                          title={q === "4k" && !userIsVip ? "Faqat VIP" : undefined}
                        >
                          {q === "4k" ? "4K 👑" : "HD"}
                        </button>
                      ))}
                    </div>
                  )}
                  {userIsVip && (
                    <span className="text-[10px] font-display tracking-widest text-neon-pink ml-auto">
                      ⚡ VIP PRIORITY
                    </span>
                  )}
                </div>
              )}
              <VideoPlayer
                videoType={selected.video_type}
                gdriveUrl={
                  quality === "4k" && selected.quality_4k_url
                    ? selected.quality_4k_url
                    : server === 2 && selected.server2_url
                    ? selected.server2_url
                    : selected.gdrive_url
                }
                videoUrl={
                  quality === "4k" && selected.quality_4k_url
                    ? selected.quality_4k_url
                    : server === 2 && selected.server2_url
                    ? selected.server2_url
                    : selected.video_url
                }
                isVip={isEpisodeLocked(selected, userIsVip)}
                earlyAccessUntil={selected.early_access_until}
              />
              <div className="mt-6 font-display text-sm tracking-widest text-foreground/90 flex items-center gap-2 flex-wrap">
                <span>EP {selected.episode_number}: {selected.title}</span>
                {isInEarlyAccess(selected) && !userIsVip && !selected.is_vip && (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-display tracking-widest"
                    style={{
                      background: "hsl(45 95% 55% / 0.15)",
                      color: "hsl(45 95% 60%)",
                      border: "1px solid hsl(45 95% 55% / 0.5)",
                    }}
                  >
                    <Clock3 className="h-3 w-3" />
                    VIP ERTA — {formatCountdown(selected.early_access_until!)}
                  </span>
                )}
              </div>
            </div>
          );
        })()}

        {/* Episodes */}
        <EpisodesGrid
          episodes={episodes}
          loading={loading}
          selectedId={selected?.id ?? null}
          userIsVip={userIsVip}
          onPick={(ep) => {
            setSelected(ep);
            setTimeout(() => playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
          }}
        />



        <Reviews contentId={content.id} />
      </div>
    </div>
  );
};

const PAGE_SIZE = 25;

interface GridProps {
  episodes: Episode[];
  loading: boolean;
  selectedId: string | null;
  userIsVip: boolean;
  onPick: (ep: Episode) => void;
}

const EpisodesGrid = ({ episodes, loading, selectedId, userIsVip, onPick }: GridProps) => {
  const [page, setPage] = useState(0);

  const pages = useMemo(() => {
    if (episodes.length === 0) return [] as { label: string; items: Episode[] }[];
    const chunks: { label: string; items: Episode[] }[] = [];
    for (let i = 0; i < episodes.length; i += PAGE_SIZE) {
      const slice = episodes.slice(i, i + PAGE_SIZE);
      const from = slice[0].episode_number;
      const to = slice[slice.length - 1].episode_number;
      chunks.push({ label: `${from}–${to}`, items: slice });
    }
    return chunks;
  }, [episodes]);

  useEffect(() => {
    if (selectedId) {
      const idx = episodes.findIndex((e) => e.id === selectedId);
      if (idx >= 0) setPage(Math.floor(idx / PAGE_SIZE));
    }
  }, [selectedId, episodes]);

  const current = pages[page]?.items ?? [];

  return (
    <section className="mt-10 pb-16 animate-fade-up">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <h2 className="font-display text-lg tracking-widest text-foreground/90">
          EPIZODLAR
          {episodes.length > 0 && (
            <span className="ml-2 text-[11px] text-neon/80 tabular-nums">· {episodes.length}</span>
          )}
        </h2>
        {pages.length > 1 && (
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide max-w-full">
            {pages.map((p, i) => (
              <button
                key={p.label}
                onClick={() => setPage(i)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-display tracking-widest transition-all tabular-nums ${
                  i === page
                    ? "bg-neon/20 text-neon neon-glow-sm border border-neon/50"
                    : "glass text-foreground/60 hover:text-neon"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-muted-foreground text-sm">Yuklanmoqda...</div>
      ) : episodes.length === 0 ? (
        <div className="text-muted-foreground text-sm">Epizodlar hali yo'q</div>
      ) : (
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
          {current.map((ep) => {
            const active = selectedId === ep.id;
            const earlyLocked = isInEarlyAccess(ep) && !userIsVip && !ep.is_vip;
            const locked = ep.is_vip || earlyLocked;
            return (
              <button
                key={ep.id}
                onClick={() => onPick(ep)}
                title={`${ep.episode_number}. ${ep.title}${ep.is_vip ? " · VIP" : earlyLocked ? " · VIP erta" : ""}`}
                className={`group relative aspect-square rounded-md font-display text-sm tabular-nums tracking-wider transition-all duration-200
                  ${active
                    ? "bg-neon/20 text-neon neon-border neon-glow-sm scale-105"
                    : locked
                    ? ep.is_vip
                      ? "bg-[#0A0F1E] text-neon-pink/90 border border-neon-pink/40 hover:border-neon-pink hover:bg-neon-pink/10"
                      : "bg-[#0A0F1E] text-amber-300/90 border border-amber-400/40 hover:border-amber-300"
                    : "bg-[#0A0F1E] text-foreground/70 border border-neon/20 hover:text-neon hover:border-neon/60 hover:bg-neon/5"}
                `}
              >
                {ep.episode_number}
                {ep.is_vip && (
                  <Lock className="absolute top-0.5 right-0.5 h-2.5 w-2.5 text-neon-pink" />
                )}
                {!ep.is_vip && earlyLocked && (
                  <Clock3 className="absolute top-0.5 right-0.5 h-2.5 w-2.5 text-amber-400" />
                )}
                {active && (
                  <Play className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 text-neon fill-neon" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Legend */}
      {episodes.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-[10px] font-display tracking-widest text-foreground/60">
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-neon/30 border border-neon/60" /> JORIY</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-[#0A0F1E] border border-neon/30" /> BEPUL</span>
          <span className="flex items-center gap-1"><Clock3 className="h-3 w-3 text-amber-400" /> VIP ERTA</span>
          <span className="flex items-center gap-1"><Lock className="h-3 w-3 text-neon-pink" /> VIP</span>
        </div>
      )}
    </section>
  );
};
