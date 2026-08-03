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

const QUALITIES = ["4K", "HD", "FHD"] as const;

const SearchPage = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [genre, setGenre] = useState<string | null>(params.get("genre"));
  const [year, setYear] = useState<string | null>(params.get("year"));
  const [quality, setQuality] = useState<string | null>(params.get("q4k"));
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
    if (genre) next.set("genre", genre);
    if (year) next.set("year", year);
    if (quality) next.set("q4k", quality);
    setParams(next, { replace: true });
  }, [query, genre, year, quality, setParams]);

  const genres = useMemo(
    () => Array.from(new Set(content.flatMap((c) => c.genre ?? []))).sort().slice(0, 16),
    [content]
  );
  const years = useMemo(
    () =>
      Array.from(new Set(content.map((c) => c.year).filter(Boolean) as number[]))
        .sort((a, b) => b - a)
        .slice(0, 8),
    [content]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return content.filter((c) => {
      if (genre && !c.genre?.includes(genre)) return false;
      if (year && String(c.year) !== year) return false;
      if (quality) {
        const d = (c.duration ?? "").toUpperCase();
        if (!d.includes(quality)) return false;
      }
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.genre?.some((g) => g.toLowerCase().includes(q))
      );
    });
  }, [content, query, genre, year, quality]);

  const hasFilters = !!(genre || year || quality);

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
          <div className="flex items-center gap-3 mb-6">
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

          {/* Filters */}
          <div className="space-y-3 mb-8">
            <FilterRow label="JANR">
              {genres.map((g) => (
                <Chip key={g} active={genre === g} onClick={() => setGenre(genre === g ? null : g)}>
                  {g}
                </Chip>
              ))}
            </FilterRow>
            <FilterRow label="YIL">
              {years.map((y) => (
                <Chip
                  key={y}
                  active={year === String(y)}
                  onClick={() => setYear(year === String(y) ? null : String(y))}
                >
                  {y}
                </Chip>
              ))}
            </FilterRow>
            <FilterRow label="SIFAT">
              {QUALITIES.map((q) => (
                <Chip key={q} active={quality === q} onClick={() => setQuality(quality === q ? null : q)}>
                  {q}
                </Chip>
              ))}
            </FilterRow>
            {hasFilters && (
              <button
                onClick={() => {
                  setGenre(null);
                  setYear(null);
                  setQuality(null);
                }}
                className="text-[11px] tracking-widest font-display text-neon/80 hover:text-neon"
              >
                ✕ FILTRLARNI TOZALASH
              </button>
            )}
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
              <div className="text-muted-foreground text-sm">
                Boshqa so'z yoki filtr bilan urinib ko'ring
              </div>
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

const FilterRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-start gap-3">
    <div className="text-[10px] tracking-widest font-display text-foreground/50 shrink-0 w-10 pt-1.5">
      {label}
    </div>
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-nowrap pb-1">
      {children}
    </div>
  </div>
);

const Chip = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-display tracking-widest transition-all ${
      active
        ? "bg-neon/15 text-neon neon-glow-sm border border-neon/50"
        : "glass text-foreground/70 hover:text-neon border border-transparent"
    }`}
  >
    {children}
  </button>
);

export default SearchPage;
