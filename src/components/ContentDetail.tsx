import { useEffect, useRef, useState } from "react";
import { Content, Episode } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Star, Eye, Calendar, Clock, Clock3 } from "lucide-react";
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
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selected, setSelected] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const viewLogged = useRef(false);
  const playerRef = useRef<HTMLDivElement>(null);

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

  // Increment view once per content open (when a non-vip episode actually plays)
  useEffect(() => {
    if (!selected || selected.is_vip || viewLogged.current) return;
    viewLogged.current = true;
    supabase.rpc("increment_views", { _content_id: content.id });
  }, [selected, content.id]);

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
        {selected && (
          <div ref={playerRef} className="mt-10 sm:mt-12 scroll-mt-24" style={{ marginBottom: "2.5rem" }}>
            <VideoPlayer
              videoType={selected.video_type}
              gdriveUrl={selected.gdrive_url}
              videoUrl={selected.video_url}
              isVip={selected.is_vip}
            />
            <div className="mt-6 font-display text-sm tracking-widest text-foreground/90">
              EP {selected.episode_number}: {selected.title}
            </div>
          </div>
        )}

        {/* Episodes */}
        <h2 className="font-display text-lg tracking-widest mb-6 text-foreground/90" style={{ marginTop: "2.5rem" }}>
          EPIZODLAR
        </h2>
        {loading ? (
          <div className="text-muted-foreground text-sm">Yuklanmoqda...</div>
        ) : episodes.length === 0 ? (
          <div className="text-muted-foreground text-sm">Epizodlar hali yo'q</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pb-16 animate-fade-up w-full">
            {episodes.map((ep) => {
              const active = selected?.id === ep.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => setSelected(ep)}
                  className={`group text-left glass rounded-xl p-4 flex items-center gap-4 transition-all duration-300 hover:scale-[1.015] hover:neon-glow-sm w-full min-h-[64px] ${
                    active ? "neon-border" : ""
                  }`}
                >
                  <div className={`font-display text-2xl w-12 text-center ${active ? "text-neon" : "text-foreground/70 group-hover:text-neon"} transition-colors`}>
                    {ep.episode_number.toString().padStart(2, "0")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{ep.title}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {ep.is_vip ? "Premium epizod" : "Bepul tomosha"}
                    </div>
                  </div>
                  {ep.is_vip ? (
                    <a
                      href="https://t.me/m/QoYHq2A0Nzgy"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 px-3 py-1.5 rounded-full font-display text-[10px] tracking-widest transition-all hover:scale-105"
                      style={{
                        background: "hsl(var(--neon-pink) / 0.18)",
                        color: "hsl(var(--neon-pink))",
                        border: "1px solid hsl(var(--neon-pink) / 0.55)",
                        boxShadow: "0 0 10px hsl(var(--neon-pink) / 0.45)",
                      }}
                    >
                      OBUNA
                    </a>
                  ) : (
                    <span className="shrink-0 px-3 py-1.5 rounded-full font-display text-[10px] tracking-widest text-neon border border-neon/40 bg-neon/10">
                      KO'RISH
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <Reviews contentId={content.id} />
      </div>
    </div>
  );
};
