import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Film, Tv, Eye, TrendingUp, Plus, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/types";

interface Stats {
  total: number;
  totalEpisodes: number;
  totalViews: number;
  trending: number;
  byCategory: Record<string, number>;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: contents }, { count: epCount }] = await Promise.all([
        supabase.from("content").select("category, views, is_trending"),
        supabase.from("episodes").select("*", { count: "exact", head: true }),
      ]);
      const list = contents ?? [];
      const byCategory: Record<string, number> = {};
      let totalViews = 0;
      let trending = 0;
      list.forEach((c: any) => {
        byCategory[c.category] = (byCategory[c.category] ?? 0) + 1;
        totalViews += c.views ?? 0;
        if (c.is_trending) trending++;
      });
      setStats({
        total: list.length,
        totalEpisodes: epCount ?? 0,
        totalViews,
        trending,
        byCategory,
      });
    })();
  }, []);

  const statCards = [
    { label: "Jami kontent", value: stats?.total ?? 0, icon: Film, accent: "neon" },
    { label: "Epizodlar", value: stats?.totalEpisodes ?? 0, icon: Tv, accent: "neon-cyan" },
    { label: "Ko'rishlar", value: stats?.totalViews ?? 0, icon: Eye, accent: "neon-purple" },
    { label: "Trendda", value: stats?.trending ?? 0, icon: TrendingUp, accent: "neon-pink" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl tracking-widest multineon-text">BOSHQARUV</h1>
          <p className="text-xs text-muted-foreground mt-1">Sayt holati va tezkor harakatlar</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/voting">
            <Button variant="ghost" className="border border-amber-400/30 text-amber-400">
              <Vote className="h-4 w-4 mr-1" /> Ovoz berish
            </Button>
          </Link>
          <Link to="/admin/content/new">
            <Button className="bg-neon text-primary-foreground hover:bg-neon/90 neon-glow-sm">
              <Plus className="h-4 w-4 mr-1" /> Yangi kontent
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="glass rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <s.icon className="h-4 w-4" style={{ color: `hsl(var(--${s.accent}))` }} />
              <span className="text-[10px] font-display tracking-widest text-muted-foreground">
                {s.label.toUpperCase()}
              </span>
            </div>
            <div className="font-display text-2xl sm:text-3xl tabular-nums" style={{ color: `hsl(var(--${s.accent}))` }}>
              {s.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl p-5">
        <h2 className="font-display tracking-widest text-sm text-foreground/80 mb-4">KATEGORIYALAR</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CATEGORIES.map((c) => (
            <div key={c.value} className="glass rounded-lg p-4">
              <div className="text-[10px] font-display tracking-widest text-muted-foreground">
                {c.label.toUpperCase()}
              </div>
              <div className="font-display text-2xl text-neon mt-1">
                {stats?.byCategory[c.value] ?? 0}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
