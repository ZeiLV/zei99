import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Content, CATEGORIES, Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Tv, Search, Star, Eye, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const AdminContentList = () => {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<Category | "all">("all");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("content")
      .select("*")
      .order("created_at", { ascending: false });
    setContents((data ?? []) as Content[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return contents.filter((c) => {
      if (filterCat !== "all" && c.category !== filterCat) return false;
      if (!search.trim()) return true;
      return c.title.toLowerCase().includes(search.toLowerCase());
    });
  }, [contents, filterCat, search]);

  const remove = async (id: string) => {
    if (!confirm("Kontentni o'chirilsinmi? Barcha epizodlar ham o'chiriladi.")) return;
    await supabase.from("episodes").delete().eq("content_id", id);
    const { error } = await supabase.from("content").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("O'chirildi");
    load();
  };

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl tracking-widest multineon-text">KONTENT</h1>
          <p className="text-xs text-muted-foreground mt-1">{contents.length} ta yozuv</p>
        </div>
        <Link to="/admin/content/new">
          <Button className="bg-neon text-primary-foreground hover:bg-neon/90 neon-glow-sm">
            <Plus className="h-4 w-4 mr-1" /> Yangi
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setFilterCat("all")}
            className={`shrink-0 px-3 py-2 rounded-lg text-[11px] font-display tracking-widest transition-all ${
              filterCat === "all" ? "bg-neon/15 text-neon neon-glow-sm" : "glass text-foreground/70"
            }`}
          >
            HAMMASI
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setFilterCat(c.value)}
              className={`shrink-0 px-3 py-2 rounded-lg text-[11px] font-display tracking-widest transition-all ${
                filterCat === c.value ? "bg-neon/15 text-neon neon-glow-sm" : "glass text-foreground/70"
              }`}
            >
              {c.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 glass rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-lg p-10 text-center text-muted-foreground text-sm">
          {contents.length === 0 ? "Hali kontent qo'shilmagan" : "Hech narsa topilmadi"}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <div key={c.id} className="glass rounded-xl overflow-hidden flex gap-3 p-3 items-start">
              {c.poster_url ? (
                <img src={c.poster_url} alt="" className="w-12 h-16 sm:w-14 sm:h-20 rounded object-cover shrink-0" />
              ) : (
                <div className="w-12 h-16 sm:w-14 sm:h-20 rounded bg-secondary shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-sm sm:text-base truncate">{c.title}</div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] text-muted-foreground">
                      <span className="text-neon">{CATEGORIES.find((x) => x.value === c.category)?.label ?? c.category}</span>
                      {c.year && <span>• {c.year}</span>}
                      {c.rating != null && c.rating > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Star className="h-2.5 w-2.5 fill-neon text-neon" /> {c.rating.toFixed(1)}
                        </span>
                      )}
                      <span className="flex items-center gap-0.5">
                        <Eye className="h-2.5 w-2.5" /> {c.views ?? 0}
                      </span>
                      {c.is_trending && (
                        <span className="flex items-center gap-0.5 text-neon-pink">
                          <TrendingUp className="h-2.5 w-2.5" /> TREND
                        </span>
                      )}
                    </div>
                    {c.genre?.length > 0 && (
                      <div className="text-[10px] text-foreground/60 truncate mt-1">
                        {c.genre.join(" • ")}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-1 shrink-0">
                <Link to={`/admin/content/${c.id}/episodes`}>
                  <Button size="sm" variant="ghost" title="Epizodlar">
                    <Tv className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to={`/admin/content/${c.id}`}>
                  <Button size="sm" variant="ghost" title="Tahrirlash">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                <Button size="sm" variant="ghost" onClick={() => remove(c.id)} title="O'chirish">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminContentList;
