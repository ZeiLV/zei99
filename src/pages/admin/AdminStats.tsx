import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CalendarRange, Eye, Film, Tv, Users, Trophy, MessageSquare } from "lucide-react";

type PeriodKey = "today" | "7d" | "1m" | "3m" | "6m" | "1y";

const PERIODS: { key: PeriodKey; label: string; days: number }[] = [
  { key: "today", label: "Bugun", days: 1 },
  { key: "7d", label: "1 hafta", days: 7 },
  { key: "1m", label: "1 oy", days: 30 },
  { key: "3m", label: "3 oy", days: 90 },
  { key: "6m", label: "6 oy", days: 180 },
  { key: "1y", label: "1 yil", days: 365 },
];

interface TopItem {
  id: string;
  title: string;
  views: number;
}
interface ActiveUser {
  name: string;
  count: number;
}

const AdminStats = () => {
  const [period, setPeriod] = useState<PeriodKey>("7d");
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState(0);
  const [newEpisodes, setNewEpisodes] = useState(0);
  const [newUsers, setNewUsers] = useState(0);
  const [newReviews, setNewReviews] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [top, setTop] = useState<TopItem[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);

  useEffect(() => {
    const days = PERIODS.find((p) => p.key === period)!.days;
    const since = new Date();
    if (days === 1) since.setHours(0, 0, 0, 0);
    else since.setDate(since.getDate() - days);
    const iso = since.toISOString();

    (async () => {
      setLoading(true);
      const [c, e, p, r, topRes, revAll] = await Promise.all([
        supabase.from("content").select("*", { count: "exact", head: true }).gte("created_at", iso),
        supabase.from("episodes").select("*", { count: "exact", head: true }).gte("created_at", iso),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", iso),
        supabase.from("reviews").select("*", { count: "exact", head: true }).gte("created_at", iso),
        supabase.from("content").select("id, title, views").order("views", { ascending: false }).limit(10),
        supabase.from("reviews").select("user_id").gte("created_at", iso),
      ]);

      setNewContent(c.count ?? 0);
      setNewEpisodes(e.count ?? 0);
      setNewUsers(p.count ?? 0);
      setNewReviews(r.count ?? 0);

      const topList = (topRes.data ?? []) as TopItem[];
      setTop(topList);
      setTotalViews(topList.reduce((a, b) => a + (b.views ?? 0), 0));

      // Most active users = most reviews in the period
      const counts = new Map<string, number>();
      (revAll.data ?? []).forEach((row: { user_id: string }) => {
        counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1);
      });
      const ids = [...counts.keys()].slice(0, 50);
      let names = new Map<string, string>();
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, display_name, public_id")
          .in("user_id", ids);
        (profs ?? []).forEach((pr: { user_id: string; display_name: string | null; public_id: string }) => {
          names.set(pr.user_id, pr.display_name || pr.public_id);
        });
      }
      setActiveUsers(
        [...counts.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([uid, count]) => ({ name: names.get(uid) ?? "Noma'lum", count }))
      );

      setLoading(false);
    })();
  }, [period]);

  const cards = [
    { label: "Yangi kontent", value: newContent, icon: Film },
    { label: "Yangi epizod", value: newEpisodes, icon: Tv },
    { label: "Yangi foydalanuvchi", value: newUsers, icon: Users },
    { label: "Yangi fikr", value: newReviews, icon: MessageSquare },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl tracking-widest text-neon">STATISTIKA</h1>
        <p className="text-xs text-muted-foreground mt-1">Muddatni tanlab ko'rsatkichlarni ko'ring</p>
      </div>

      {/* Period picker */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        <CalendarRange className="h-4 w-4 text-neon shrink-0" />
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`shrink-0 px-3.5 py-2 rounded-full text-[11px] font-display tracking-widest transition-all ${
              period === p.key
                ? "bg-neon/15 text-neon border border-neon/50"
                : "glass text-foreground/60 hover:text-neon"
            }`}
          >
            {p.label.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((s) => (
          <div key={s.label} className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <s.icon className="h-4 w-4 text-neon" />
              <span className="text-[9px] font-display tracking-widest text-muted-foreground text-right">
                {s.label.toUpperCase()}
              </span>
            </div>
            <div className="font-display text-2xl tabular-nums text-neon">
              {loading ? "—" : s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Most viewed */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="h-4 w-4 text-neon" />
            <h2 className="font-display text-xs tracking-widest text-foreground/80">
              ENG KO'P KO'RILGAN
            </h2>
            <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">
              jami {totalViews}
            </span>
          </div>
          <div className="space-y-1.5">
            {top.length === 0 && (
              <p className="text-xs text-muted-foreground">Ma'lumot yo'q</p>
            )}
            {top.map((t, i) => (
              <div
                key={t.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-foreground/[0.03]"
              >
                <span className="font-display text-[10px] w-5 text-neon/70 tabular-nums">
                  {i + 1}
                </span>
                <span className="text-sm text-foreground/85 truncate flex-1">{t.title}</span>
                <span className="text-xs tabular-nums text-neon">{t.views ?? 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Most active */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-4 w-4 text-amber-400" />
            <h2 className="font-display text-xs tracking-widest text-foreground/80">
              ENG FAOL FOYDALANUVCHILAR
            </h2>
          </div>
          <div className="space-y-1.5">
            {activeUsers.length === 0 && (
              <p className="text-xs text-muted-foreground">Bu muddatda faollik yo'q</p>
            )}
            {activeUsers.map((u, i) => (
              <div
                key={u.name + i}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-foreground/[0.03]"
              >
                <span className="font-display text-[10px] w-5 text-amber-400/70 tabular-nums">
                  {i + 1}
                </span>
                <span className="text-sm text-foreground/85 truncate flex-1">{u.name}</span>
                <span className="text-xs tabular-nums text-amber-400">{u.count} fikr</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
