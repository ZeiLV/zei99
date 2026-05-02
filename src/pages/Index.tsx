import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useSearchParams } from "react-router-dom";
import { Intro } from "@/components/Intro";
import { Header } from "@/components/Header";
import { PosterCard } from "@/components/PosterCard";
import { ContentDetail } from "@/components/ContentDetail";
import { ContentRow } from "@/components/ContentRow";
import { HeroSlider } from "@/components/HeroSlider";
import { SocialLinks } from "@/components/SocialLinks";
import { supabase } from "@/integrations/supabase/client";
import { Category, Content, CATEGORIES } from "@/lib/types";

interface Props {
  category?: Category;
}

const Index = ({ category }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const deepId = searchParams.get("id");
  const deepEp = searchParams.get("ep");

  const [showIntro, setShowIntro] = useState(() =>
    category ? false : !sessionStorage.getItem("zei-intro-done") && !deepId
  );
  const [content, setContent] = useState<Content[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Content | null>(null);
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelected(null);
    setActiveGenre(null);
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

  const allGenres = Array.from(new Set(content.flatMap((c) => c.genre ?? []))).sort();

  const filtered = content.filter((c) => {
    if (activeGenre && !c.genre?.includes(activeGenre)) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.genre?.some((g) => g.toLowerCase().includes(q))
    );
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
    : "ZEI DUBBING — Premium VIP Anime Portal";
  const pageDesc = categoryMeta
    ? `${categoryMeta.label} kategoriyasidagi eng yaxshi kontent — ZEI DUBBING o'zbek tilida.`
    : "ZEI DUBBING — anime, drama, kino va multfilm uchun premium VIP portal. O'zbek tilida tarjima va yuqori sifatli kontent.";

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={typeof window !== "undefined" ? window.location.href : "/"} />
      </Helmet>

      {showIntro && <Intro onDone={finishIntro} />}

      {!showIntro && (
        <div className="min-h-screen relative">
          <div className="fixed inset-0 -z-10 animate-breathing pointer-events-none opacity-60" />

          <Header search={search} onSearchChange={setSearch} />

          {selected ? (
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
          ) : (
            <>
              <h1 className="sr-only">{pageTitle}</h1>

              {!category && !search.trim() && content.length > 0 && (
                <HeroSlider items={content} onSelect={setSelected} />
              )}

              {category && (
                <div className="pt-24 sm:pt-28 px-[15px] sm:px-8 max-w-[1440px] mx-auto">
                  <h2 className="font-display text-2xl sm:text-3xl multineon-text tracking-wider">
                    {categoryMeta?.label.toUpperCase()}
                  </h2>
                  {allGenres.length > 0 && (
                    <div className="mt-6 flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 flex-nowrap">
                      <button
                        onClick={() => setActiveGenre(null)}
                        className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-display tracking-widest transition-all ${
                          !activeGenre
                            ? "bg-neon/15 text-neon neon-glow-sm"
                            : "glass text-foreground/70 hover:text-neon"
                        }`}
                      >
                        HAMMASI
                      </button>
                      {allGenres.map((g) => (
                        <button
                          key={g}
                          onClick={() => setActiveGenre(g)}
                          className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-display tracking-widest transition-all ${
                            activeGenre === g
                              ? "bg-neon/15 text-neon neon-glow-sm"
                              : "glass text-foreground/70 hover:text-neon"
                          }`}
                        >
                          {g.toUpperCase()}
                        </button>
                      ))}
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
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
                      <ContentRow title="TREND" icon="🔥" items={trending} onSelect={setSelected} />
                    )}
                    {newest.length > 0 && (
                      <ContentRow title="YANGI QO'SHILGAN" icon="✨" items={newest} onSelect={setSelected} />
                    )}
                    {popular.length > 0 && (
                      <ContentRow title="MASHHUR" icon="⭐" items={popular} onSelect={setSelected} />
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 animate-fade-up">
                    {filtered.map((c) => (
                      <PosterCard key={c.id} content={c} onClick={() => setSelected(c)} />
                    ))}
                  </div>
                )}
              </main>

              {/* Footer with persistent social links */}
              <footer className="px-[15px] sm:px-8 max-w-[1440px] mx-auto pb-10 pt-4">
                <div className="glass rounded-2xl px-5 py-5 flex flex-col items-center gap-3">
                  <SocialLinks />
                  <div className="text-[10px] tracking-widest text-foreground/40 font-display">
                    © ZEI DUBBING
                  </div>
                </div>
              </footer>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Index;
