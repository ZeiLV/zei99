import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Shuffle, SlidersHorizontal } from "lucide-react";
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
import { useSavedTitles } from "@/hooks/useSavedTitles";
import { TabBar } from "@/components/TabBar";
import { Button } from "@/components/ui/button";

interface Props {
  category?: Category;
  collection?: "newest" | "trending" | "saved";
}

type SortBy = "newest" | "rating" | "views";

const Index = ({ category, collection }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { categories: availableCategories } = useAvailableCategories();
  const { ids: savedIds } = useSavedTitles();
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
  const [sortBy, setSortBy] = useState<SortBy>("newest");
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
    setSortBy("newest");
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

  const hasFilters = activeGenres.length > 0 || activeYears.length > 0 || sortBy !== "newest";

  const filtered = useMemo(() => {
    const list = content.filter((c) => {
    if (collection === "trending" && !c.is_trending) return false;
      if (collection === "saved" && !savedIds.includes(c.id)) return false;
    if (activeGenres.length && !activeGenres.every((g) => c.genre?.includes(g))) return false;
    if (activeYears.length && !(c.year && activeYears.includes(c.year))) return false;
    if (!search.trim()) return true;
    return c.title.toLowerCase().includes(search.trim().toLowerCase());
  });
    if (sortBy === "rating") return [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    if (sortBy === "views") return [...list].sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    return list;
  }, [content, collection, savedIds, activeGenres, activeYears, search, sortBy]);

  const pickRandom = () => {
    const pool = filtered.length > 0 ? filtered : content;
    if (pool.length === 0) return;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    if (picked) setSelected(picked);
  };


  const trending = content.filter((c) => c.is_trending).slice(0, 12);
  const popular = [...content].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 12);
  const newest = content.slice(0, 12);

  const finishIntro = () => {
    sessionStorage.setItem("zei-intro-v2-done", "1");
    setShowIntro(false);
  };

  const categoryMeta = category ? CATEGORIES.find((c) => c.value === category) : null;
  const collectionTitle =
    collection === "newest"
      ? "Yangi qo‘shilgan"
      : collection === "trending"
      ? "Trend"
      : collection === "saved"
      ? "Saqlanganlar"
      : null;
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
                <div className="flex items-center gap-2 shrink-0">
                  {content.length > 0 && (
                    <Button
                      variant="secondary"
                      onClick={pickRandom}
                      className="h-10 rounded-full px-3.5 text-xs font-semibold border border-border/70 hover:bg-secondary/80"
                      aria-label="Tasodifiy tanlash"
                    >
                      <Shuffle className="h-3.5 w-3.5 text-discovery" />
                      <span className="hidden sm:inline">Tasodifiy</span>
                    </Button>
                  )}
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
              </div>

              {/* Dynamic category tabs */}
              {availableCategories.length > 0 && (
                <div className="px-[15px] sm:px-8 max-w-[1440px] mx-auto pt-4">
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 flex-nowrap">
                    <Button variant="ghost" onClick={() => navigate("/newest")} className={`shrink-0 rounded-full text-xs ${collection === "newest" ? "bg-fresh text-background hover:bg-fresh/90 hover:text-background" : "text-muted-foreground"}`}>Yangilar</Button>
                    <Button variant="ghost" onClick={() => navigate("/trending")} className={`shrink-0 rounded-full text-xs ${collection === "trending" ? "bg-discovery text-background hover:bg-discovery/90 hover:text-background" : "text-muted-foreground"}`}>Trend</Button>
                    <Button variant="ghost" onClick={() => navigate("/saved")} className={`shrink-0 rounded-full text-xs ${collection === "saved" ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "text-muted-foreground"}`}>Saqlanganlar{savedIds.length > 0 ? ` (${savedIds.length})` : ""}</Button>
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
                  {(category || collection || hasFilters || search.trim()) && (
                    <div className="mt-3 flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
                      {([["newest", "Yangi"], ["rating", "Reyting"], ["views", "Mashhur"]] as const).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setSortBy(value)}
                          className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                            sortBy === value
                              ? "bg-primary/20 text-primary border border-primary/40"
                              : "bg-secondary/60 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
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
                      {collection === "saved"
                        ? "Saqlanganlar bo‘sh"
                        : content.length === 0
                        ? "Kontent hali yo'q"
                        : "Hech narsa topilmadi"}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {collection === "saved"
                        ? "Kartochkadagi belgi orqali yoqqanlarini shu qurilmada saqlang"
                        : content.length === 0
                        ? "Tez orada qo'shiladi"
                        : "Boshqa so'z bilan urinib ko'ring"}
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
