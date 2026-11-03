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
import { TabBar } from "@/components/TabBar";
import { Button } from "@/components/ui/button";

interface Props {
  category?: Category;
  collection?: "newest" | "trending";
}

const Index = ({ category, collection }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { categories: availableCategories } = useAvailableCategories();
  const deepId = searchParams.get("id");
  const deepEp = searchParams.get("ep");

  const [showIntro, setShowIntro] = useState(() =>
    category || collection ? false : !sessionStorage.getItem("zei-intro-v2-done") && !deepId
  );
  const [content, setContent] = useState<Content[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Content | null>(null);
  const [activeGenres, setActiveGenres] = useState<string[]>([]);
  const [activeYears, setActiveYears] = useState<number[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const toggleGenre = (g: string) =>
    setActiveGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  const toggleYear = (y: number) =>
    setActiveYears((prev) => (prev.includes(y) ? prev.filter((x) => x !== y) : [...prev, y]));

  useEffect(() => {
    setSelected(null);
    setActiveGenres([]);
    setActiveYears([]);
    setFilterOpen(false);
  }, [category, collection]);

  useEffect(() => {
    let active = true;
    const timeout = window.setTimeout(() => {
      if (!active) return;
      setLoadError(true);
      setLoading(false);
    }, 10000);
    (async () => {
      setLoading(true);
      setLoadError(false);
      let query = supabase.from("content").select("*").order("created_at", { ascending: false });
      if (category) query = query.eq("category", category);
      const { data, error } = await query;
      if (!active) return;
      window.clearTimeout(timeout);
      setContent((data ?? []) as Content[]);
      setLoadError(!!error);
      setLoading(false);
    })();
    return () => { active = false; window.clearTimeout(timeout); };
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

  const hasFilters = activeGenres.length > 0 || activeYears.length > 0;

  const filtered = content.filter((c) => {
    if (collection === "trending" && !c.is_trending) return false;
    if (activeGenres.length && !activeGenres.every((g) => c.genre?.includes(g))) return false;
    if (activeYears.length && !(c.year && activeYears.includes(c.year))) return false;
    if (!search.trim()) return true;
    return c.title.toLowerCase().includes(search.trim().toLowerCase());
  });


  const trending = content.filter((c) => c.is_trending).slice(0, 12);
  const popular = [...content].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 12);
  const newest = content.slice(0, 12);

  const finishIntro = () => {
    sessionStorage.setItem("zei-intro-v2-done", "1");
    setShowIntro(false);
  };

  const categoryMeta = category ? CATEGORIES.find((c) => c.value === category) : null;
  const collectionTitle = collection === "newest" ? "Yangi qo‘shilgan" : collection === "trending" ? "Trend" : null;
  const pageTitle = collectionTitle ? `${collectionTitle} — ZEI DUBBING` : categoryMeta
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
              <Header search={search} onSearchChange={setSearch} />
              <h1 className="sr-only">{pageTitle}</h1>

              {!collection && !search.trim() && content.length > 0 && (
                <HeroSlider items={newest} onSelect={setSelected} />
              )}

              {/* Title + filter trigger */}
              <div className="pt-6 px-[15px] sm:px-8 max-w-[1440px] mx-auto flex items-center justify-between gap-3">
                <h2 className="font-display text-2xl sm:text-3xl text-foreground tracking-tight">
                  {collectionTitle ?? categoryMeta?.label ?? "Katalog"}
                </h2>
                <button
                  onClick={() => setFilterOpen(true)}
                  className={`shrink-0 h-10 px-4 rounded-full flex items-center gap-2 text-[12px] font-semibold transition-all duration-200 active:scale-95 ${
                    hasFilters
                      ? "bg-primary text-primary-foreground"
                      : "glass text-foreground/75 hover:text-foreground hover:bg-foreground/10"
                  }`}
                  aria-label="Filterlash"
                >
                  Filterlash
                  <SlidersHorizontal className="h-4 w-4" />
                </button>
              </div>

              {/* Dynamic category tabs */}
              {availableCategories.length > 0 && (
                <div className="px-[15px] sm:px-8 max-w-[1440px] mx-auto pt-4">
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 flex-nowrap">
                    <Button variant="ghost" onClick={() => navigate("/newest")} className={`shrink-0 rounded-full text-xs ${collection === "newest" ? "bg-foreground text-background" : "text-muted-foreground"}`}>Yangilar</Button>
                    <Button variant="ghost" onClick={() => navigate("/trending")} className={`shrink-0 rounded-full text-xs ${collection === "trending" ? "bg-foreground text-background" : "text-muted-foreground"}`}>Trend</Button>
                    <button
                      onClick={() => navigate("/")}
                      className={`shrink-0 px-4 py-2 rounded-full text-[12px] font-semibold transition-all duration-200 active:scale-95 ${
                        !category && !collection
                          ? "bg-foreground text-background"
                          : "glass text-foreground/70 hover:text-foreground hover:bg-foreground/10"
                      }`}
                    >
                      Asosiy
                    </button>
                    {availableCategories.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => navigate(c.path)}
                        className={`shrink-0 px-4 py-2 rounded-full text-[12px] font-semibold transition-all duration-200 active:scale-95 ${
                          category === c.value
                            ? "bg-foreground text-background"
                            : "glass text-foreground/70 hover:text-foreground hover:bg-foreground/10"
                        }`}
                      >
                        {c.label}
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
                activeGenres={activeGenres}
                activeYears={activeYears}
                onToggleGenre={toggleGenre}
                onToggleYear={toggleYear}
                onClear={() => {
                  setActiveGenres([]);
                  setActiveYears([]);
                }}
                resultCount={filtered.length}
              />



              <main
                className={`px-[15px] sm:px-8 max-w-[1440px] mx-auto pb-28 ${
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
                ) : loadError ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
                    <div className="font-display text-lg text-foreground">Katalogni ochib bo'lmadi</div>
                    <div className="max-w-sm text-sm text-muted-foreground">Lovable Cloud faol emas yoki internet aloqasi uzildi. Cloud yoqilgach qayta urinib ko'ring.</div>
                    <button type="button" onClick={() => window.location.reload()} className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-xs font-semibold active:scale-95 transition-transform">Qayta urinish</button>
                  </div>
                ) : !category && !collection && !search.trim() && !hasFilters ? (
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
              <TabBar catalog />
            </>
          )}

        </div>
      )}
    </>
  );
};

export default Index;
