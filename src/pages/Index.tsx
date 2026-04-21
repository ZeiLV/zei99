import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Intro } from "@/components/Intro";
import { Header } from "@/components/Header";
import { PosterCard } from "@/components/PosterCard";
import { ContentDetail } from "@/components/ContentDetail";
import { HeroSlider } from "@/components/HeroSlider";
import { supabase } from "@/integrations/supabase/client";
import { Content } from "@/lib/types";

const Index = () => {
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem("zei-intro-done"));
  const [content, setContent] = useState<Content[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("content")
        .select("*")
        .order("created_at", { ascending: false });
      setContent((data ?? []) as Content[]);
      setLoading(false);
    })();
  }, []);

  const filtered = content.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.genre?.some((g) => g.toLowerCase().includes(q))
    );
  });

  const finishIntro = () => {
    sessionStorage.setItem("zei-intro-done", "1");
    setShowIntro(false);
  };

  return (
    <>
      <Helmet>
        <title>ZEI DUBBING — Premium VIP Anime Portal</title>
        <meta
          name="description"
          content="ZEI DUBBING — anime va media uchun premium VIP portal. O'zbek tilida tarjima va yuqori sifatli kontent."
        />
        <link rel="canonical" href={typeof window !== "undefined" ? window.location.origin + "/" : "/"} />
      </Helmet>

      {showIntro && <Intro onDone={finishIntro} />}

      {!showIntro && (
        <div className="min-h-screen relative">
          {/* Global ambient backlight */}
          <div className="fixed inset-0 -z-10 animate-breathing pointer-events-none opacity-60" />

          <Header
            search={search}
            onSearchChange={setSearch}
            onLogoTap={() => setSelected(null)}
          />

          {selected ? (
            <ContentDetail content={selected} onBack={() => setSelected(null)} />
          ) : (
            <>
              <h1 className="sr-only">ZEI DUBBING — Premium anime portali</h1>

              {!search.trim() && content.length > 0 && (
                <HeroSlider items={content} onSelect={setSelected} />
              )}

              <main className="pt-6 sm:pt-10 px-4 sm:px-6 max-w-7xl mx-auto pb-16">
                {loading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        className="aspect-[9/16] rounded-xl glass animate-pulse"
                      />
                    ))}
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
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Index;
