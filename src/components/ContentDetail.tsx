import { useEffect, useRef, useState } from "react";
import { Content, Episode } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Lock, Star, Eye, Calendar, Clock } from "lucide-react";
import { VideoPlayer } from "./VideoPlayer";

interface Props {
  content: Content;
  onBack: () => void;
}

const formatViews = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
};

export const ContentDetail = ({ content, onBack }: Props) => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selected, setSelected] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const viewLogged = useRef(false);

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
      setSelected(eps[0] ?? null);
      setLoading(false);
    })();
  }, [content.id]);

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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-20 sm:-mt-28 relative z-10">
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
          <div className="mt-6 sm:mt-8">
            <VideoPlayer
              videoType={selected.video_type}
              gdriveUrl={selected.gdrive_url}
              videoUrl={selected.video_url}
              isVip={selected.is_vip}
            />
            <div className="mt-3 font-display text-sm tracking-widest text-foreground/90">
              EP {selected.episode_number}: {selected.title}
            </div>
          </div>
        )}

        {/* Episodes */}
        <h2 className="font-display text-lg tracking-widest mt-8 mb-3 text-foreground/90">
          EPIZODLAR
        </h2>
        {loading ? (
          <div className="text-muted-foreground text-sm">Yuklanmoqda...</div>
        ) : episodes.length === 0 ? (
          <div className="text-muted-foreground text-sm">Epizodlar hali yo'q</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-16">
            {episodes.map((ep) => (
              <button
                key={ep.id}
                onClick={() => setSelected(ep)}
                className={`text-left glass rounded-lg p-4 flex items-center gap-3 transition-all hover:neon-glow-sm ${
                  selected?.id === ep.id ? "neon-border" : ""
                }`}
              >
                <div className="font-display text-2xl text-neon w-10 text-center">
                  {ep.episode_number}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{ep.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {ep.is_vip ? "VIP" : "Bepul"}
                  </div>
                </div>
                {ep.is_vip && <Lock className="h-4 w-4 text-neon/80" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
