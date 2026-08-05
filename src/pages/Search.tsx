import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search as SearchIcon, X } from "lucide-react";
import { Header } from "@/components/Header";
import { PosterCard } from "@/components/PosterCard";
import { ContentDetail } from "@/components/ContentDetail";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Content } from "@/lib/types";

const SearchPage = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [selected, setSelected] = useState<Content | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("content")
        .select("*")
        .order("created_at", { ascending: false });
      setContent((data ?? []) as Content[]);
      setLoading(false);
    })();
  }, []);

  // Sync URL
  useEffect(() => {
    const next = new URLSearchParams();
    if (query.trim()) next.set("q", query.trim());
    setParams(next, { replace: true });
  }, [query, setParams]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return content;
    return content.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.genre?.some((g) => g.toLowerCase().includes(q))
    );
  }, [content, query]);

  if (selected) {
    return (
      <>
        <Header search="" onSearchChange={() => {}} />
        <ContentDetail content={selected} initialEpisodeNumber={null} onBack={() => setSelected(null)} />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Qidiruv — ZEI DUBBING</title>
        <meta name="description" content="ZEI DUBBING katalogidan anime, drama, kino va multfilm qidiring." />
      </Helmet>

      <div className="min-h-screen relative">
        <div className="fixed inset-0 -z-10 animate-breathing pointer-events-none opacity-60" />
        <Header search="" onSearchChange={() => {}} />

        <main className="pt-6 px-[15px] sm:px-8 max-w-[1440px] mx-auto pb-20">
          {/* Search bar */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="h-10 w-10 shrink-0 rounded-full glass flex items-center justify-center text-neon hover:neon-glow-sm transition-all"
              aria-label="Orqaga"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div
              className="flex-1 relative rounded-2xl glass-strong border border-neon/40 px-4 sm:px-5 h-12 sm:h-14 flex items-center gap-3"
              style={{ boxShadow: "0 0 24px hsl(var(--neon) / 0.25), inset 0 0 14px hsl(var(--neon) / 0.08)" }}
            >
              <SearchIcon className="h-4 w-4 sm:h-5 sm:w-5 text-neon" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Anime, drama, kino qidirish..."
                className="flex-1 bg-transparent outline-none text-sm sm:text-base placeholder:text-muted-foreground"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-foreground/60 hover:text-neon"
                  aria-label="Tozalash"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-xl glass animate-pulse" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="font-display text-lg neon-text mb-2">Hech narsa topilmadi</div>
              <div className="text-muted-foreground text-sm">Boshqa so'z bilan urinib ko'ring</div>
            </div>
          ) : (
            <>
              <div className="text-[11px] tracking-widest font-display text-foreground/50 mb-4">
                {results.length} TA NATIJA
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5 animate-fade-up">
                {results.map((c) => (
                  <PosterCard key={c.id} content={c} onClick={() => setSelected(c)} />
                ))}
              </div>
            </>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default SearchPage;
