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

              {category && (
                <div className="pt-6 px-[15px] sm:px-8 max-w-[1440px] mx-auto">
                  <h2 className="font-display text-2xl sm:text-3xl multineon-text tracking-wider">
                    {categoryMeta?.label.toUpperCase()}
                  </h2>
                </div>
              )}


              {/* Dynamic category tabs + filter button */}
              {availableCategories.length > 0 && (
                <div className="px-[15px] sm:px-8 max-w-[1440px] mx-auto pt-6">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 flex-nowrap">
                      <button
                        onClick={() => navigate("/")}
                        className={`shrink-0 px-4 py-2 rounded-full text-[11px] font-display tracking-widest transition-all duration-300 hover:scale-[1.05] active:scale-95 ${
                          !category
                            ? "bg-neon/15 text-neon border border-neon/50 neon-glow-sm"
                            : "glass text-foreground/70 hover:text-neon hover:border-neon/40 border border-transparent"
                        }`}
                      >
                        ASOSIY
                      </button>
                      {availableCategories.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => navigate(c.path)}
                          className={`shrink-0 px-4 py-2 rounded-full text-[11px] font-display tracking-widest transition-all duration-300 hover:scale-[1.05] active:scale-95 ${
                            category === c.value
                              ? "bg-neon/15 text-neon border border-neon/50 neon-glow-sm"
                              : "glass text-foreground/70 hover:text-neon hover:border-neon/40 border border-transparent"
                          }`}
                        >
                          {c.label.toUpperCase()}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setFilterOpen((v) => !v)}
                      className={`shrink-0 h-9 px-3 rounded-full flex items-center gap-1.5 text-[11px] font-display tracking-widest transition-all duration-300 hover:scale-[1.05] active:scale-95 ${
                        filterOpen || activeGenre || activeYear
                          ? "bg-neon/15 text-neon border border-neon/50 neon-glow-sm"
                          : "glass text-foreground/70 hover:text-neon border border-transparent"
                      }`}
                      aria-label="Filtr"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      <span className="hidden sm:inline">FILTR</span>
                    </button>
                  </div>

                  {filterOpen && (
                    <div className="mt-3 rounded-2xl glass-strong border border-neon/25 p-4 space-y-4 animate-fade-in">
                      {allGenres.length > 0 && (
                        <div>
                          <div className="text-[10px] tracking-widest font-display text-foreground/50 mb-2">JANR</div>
                          <div className="flex flex-wrap gap-2">
                            {allGenres.map((g) => (
                              <button
                                key={g}
                                onClick={() => setActiveGenre(activeGenre === g ? null : g)}
                                className={`px-3 py-1.5 rounded-full text-[11px] font-display tracking-widest transition-all duration-300 hover:scale-105 ${
                                  activeGenre === g
                                    ? "bg-neon/15 text-neon border border-neon/50 neon-glow-sm"
                                    : "glass text-foreground/70 hover:text-neon border border-transparent"
                                }`}
                              >
                                {g}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {allYears.length > 0 && (
                        <div>
                          <div className="text-[10px] tracking-widest font-display text-foreground/50 mb-2">YIL</div>
                          <div className="flex flex-wrap gap-2">
                            {allYears.map((y) => (
                              <button
                                key={y}
                                onClick={() => setActiveYear(activeYear === y ? null : y)}
                                className={`px-3 py-1.5 rounded-full text-[11px] font-display tracking-widest transition-all duration-300 hover:scale-105 ${
                                  activeYear === y
                                    ? "bg-neon/15 text-neon border border-neon/50 neon-glow-sm"
                                    : "glass text-foreground/70 hover:text-neon border border-transparent"
                                }`}
                              >
                                {y}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {(activeGenre || activeYear) && (
                        <button
                          onClick={() => {
                            setActiveGenre(null);
                            setActiveYear(null);
                          }}
                          className="text-[11px] tracking-widest font-display text-neon/80 hover:text-neon transition-colors"
                        >
                          ✕ FILTRLARNI TOZALASH
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}



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
                ) : !category && !search.trim() ? (
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
