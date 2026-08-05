import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import { Intro } from "@/components/Intro";
import { Header } from "@/components/Header";
import { PosterCard } from "@/components/PosterCard";
import { ContentDetail } from "@/components/ContentDetail";
import { ContentRow } from "@/components/ContentRow";
import { HeroSlider } from "@/components/HeroSlider";
import { FilterSheet } from "@/components/FilterSheet";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Category, Content, CATEGORIES } from "@/lib/types";
import { useAvailableCategories } from "@/hooks/useAvailableCategories";

interface Props {
  category?: Category;
}

const Index = ({ category }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { categories: availableCategories } = useAvailableCategories();
  const deepId = searchParams.get("id");
  const deepEp = searchParams.get("ep");

  const [showIntro, setShowIntro] = useState(() =>
    category ? false : !sessionStorage.getItem("zei-intro-done") && !deepId
  );
  const [content, setContent] = useState<Content[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Content | null>(null);
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelected(null);
    setActiveGenre(null);
    setActiveYear(null);
    setFilterOpen(false);
  }, [category]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let query = supabase.from("content").select("*").order("created_at", { ascending: false });
      if (category) query = query.eq("category", category);
      const { data } = await query;
      setContent((data ?? []) as Content[]);
      setLoading(false);
    })();
  }, [category]);

  // Deep-link: select content from ?id=
  useEffect(() => {
    if (!deepId || content.length === 0) return;
    if (selected?.id === deepId) return;
    const found = content.find((c) => c.id === deepId);
    if (found) setSelected(found);
  }, [deepId, content, selected?.id]);

  const allGenres = useMemo(
    () => Array.from(new Set(content.flatMap((c) => c.genre ?? []))).sort().slice(0, 20),
    [content]
  );
  const allYears = useMemo(
    () =>
      Array.from(new Set(content.map((c) => c.year).filter(Boolean) as number[])).sort(
        (a, b) => b - a
      ),
    [content]
  );

  const hasFilters = !!(activeGenre || activeYear);

  const filtered = content.filter((c) => {
    if (activeGenre && !c.genre?.includes(activeGenre)) return false;
    if (activeYear && c.year !== activeYear) return false;
    if (!search.trim()) return true;
    return c.title.toLowerCase().includes(search.trim().toLowerCase());
  });


  const trending = content.filter((c) => c.is_trending).slice(0, 12);
  const popular = [...content].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 12);
  const newest = content.slice(0, 12);

  const finishIntro = () => {
    sessionStorage.setItem("zei-intro-done", "1");
    setShowIntro(false);
  };

  const categoryMeta = category ? CATEGORIES.find((c) => c.value === category) : null;
  const pageTitle = categoryMeta
    ? `${categoryMeta.label} — ZEI DUBBING`
    : "ZEI DUBBING — Premium Streaming Platforma";
  const pageDesc = categoryMeta
    ? `${categoryMeta.label} kategoriyasidagi eng yaxshi kontent — ZEI DUBBING o'zbek tilida.`
    : "ZEI DUBBING — anime, drama, kino va multfilm uchun premium streaming platforma. O'zbek tilida tarjima va yuqori sifatli kontent.";

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={typeof window !== "undefined" ? window.location.href : "/"} />
      </Helmet>

      {showIntro && <Intro onDone={finishIntro} />}

      {!showIntro && (
        <div className="min-h-screen relative animate-zoom-in">
          <Header search={search} onSearchChange={setSearch} />

          {selected ? (
            <>
              <ContentDetail
                content={selected}
                initialEpisodeNumber={deepEp ? Number(deepEp) : null}
                onBack={() => {
                  setSelected(null);
                  if (deepId || deepEp) {
                    searchParams.delete("id");
                    searchParams.delete("ep");
                    setSearchParams(searchParams, { replace: true });
                  }
                }}
              />
              <Footer />
            </>
          ) : (
            <>
              <h1 className="sr-only">{pageTitle}</h1>

              {!search.trim() && content.length > 0 && (
                <HeroSlider items={newest} onSelect={setSelected} />
              )}

              {/* Title + filter trigger */}
              <div className="pt-6 px-[15px] sm:px-8 max-w-[1440px] mx-auto flex items-center justify-between gap-3">
                <h2 className="font-display text-2xl sm:text-3xl multineon-text tracking-wider">
                  {(categoryMeta?.label ?? "Katalog").toUpperCase()}
                </h2>
                <button
                  onClick={() => setFilterOpen(true)}
                  className={`shrink-0 h-10 px-4 rounded-full flex items-center gap-2 text-[11px] font-display tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 ${
                    hasFilters
                      ? "bg-neon/15 text-neon border border-neon/60 shadow-[0_0_18px_-4px_hsl(var(--neon))]"
                      : "glass text-foreground/70 border border-neon/20 hover:text-neon hover:border-neon/50 hover:shadow-[0_0_18px_-6px_hsl(var(--neon))]"
                  }`}
                  aria-label="Filterlash"
                >
                  FILTERLASH
                  <SlidersHorizontal className="h-4 w-4" />
                </button>
              </div>

              {/* Dynamic category tabs */}
              {availableCategories.length > 0 && (
                <div className="px-[15px] sm:px-8 max-w-[1440px] mx-auto pt-4">
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 flex-nowrap">
                    <button
                      onClick={() => navigate("/")}
                      className={`shrink-0 px-4 py-2 rounded-full text-[11px] font-display tracking-widest transition-all duration-300 hover:scale-[1.06] active:scale-95 ${
                        !category
                          ? "bg-neon/15 text-neon border border-neon/50 neon-glow-sm"
                          : "glass text-foreground/70 border border-transparent hover:text-neon hover:border-neon/40 hover:shadow-[0_0_16px_-6px_hsl(var(--neon))]"
                      }`}
                    >
                      ASOSIY
                    </button>
                    {availableCategories.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => navigate(c.path)}
                        className={`shrink-0 px-4 py-2 rounded-full text-[11px] font-display tracking-widest transition-all duration-300 hover:scale-[1.06] active:scale-95 ${
                          category === c.value
                            ? "bg-neon/15 text-neon border border-neon/50 neon-glow-sm"
                            : "glass text-foreground/70 border border-transparent hover:text-neon hover:border-neon/40 hover:shadow-[0_0_16px_-6px_hsl(var(--neon))]"
                        }`}
                      >
                        {c.label.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <FilterSheet
                open={filterOpen}
                onClose={() => setFilterOpen(false)}
                genres={allGenres}
                years={allYears}
                activeGenre={activeGenre}
                activeYear={activeYear}
                onGenre={setActiveGenre}
                onYear={setActiveYear}
                onClear={() => {
                  setActiveGenre(null);
                  setActiveYear(null);
                }}
                resultCount={filtered.length}
              />



              <main
                className={`px-[15px] sm:px-8 max-w-[1440px] mx-auto pb-16 ${
                  category ? "pt-8" : "pt-8 sm:pt-12"
                }`}
              >
                {loading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        className="aspect-[9/16] rounded-xl glass animate-pulse"
                      />
                    ))}
                  </div>
                ) : !category && !search.trim() && !hasFilters ? (
                  // Netflix-style rows on home
                  <div className="space-y-12 sm:space-y-16">
                    {trending.length > 0 && (
                      <ContentRow title="TREND" icon="flame" items={trending} onSelect={setSelected} />
                    )}
                    {newest.length > 0 && (
                      <ContentRow title="YANGI QO'SHILGAN" icon="sparkles" items={newest} onSelect={setSelected} />
                    )}
                    {popular.length > 0 && (
                      <ContentRow title="MASHHUR" icon="star" items={popular} onSelect={setSelected} />
                    )}
                    {CATEGORIES.map((cat) => {
                      const items = content.filter((c) => c.category === cat.value).slice(0, 12);
                      if (items.length === 0) return null;
                      return (
                        <ContentRow
                          key={cat.value}
                          title={cat.label.toUpperCase()}
                          items={items}
                          onSelect={setSelected}
                        />
                      );
                    })}
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="font-display text-lg neon-text mb-2">
                      {content.length === 0 ? "Kontent hali yo'q" : "Hech narsa topilmadi"}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {content.length === 0 ? "Tez orada qo'shiladi" : "Boshqa so'z bilan urinib ko'ring"}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5 animate-fade-up">
                    {filtered.map((c) => (
                      <PosterCard key={c.id} content={c} onClick={() => setSelected(c)} />
                    ))}
                  </div>
                )}
              </main>

              <Footer />
            </>
          )}

        </div>
      )}
    </>
  );
};

export default Index;
