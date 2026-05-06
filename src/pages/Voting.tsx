import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { VotingProject } from "@/lib/types";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Crown, Vote, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface ProjectWithVotes extends VotingProject {
  vote_count: number;
  user_voted: boolean;
}

const Voting = () => {
  const navigate = useNavigate();
  const { user, isVip } = useAuth();
  const [projects, setProjects] = useState<ProjectWithVotes[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const { data: pr } = await supabase
      .from("voting_projects")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    const list = (pr ?? []) as VotingProject[];
    const { data: votes } = await supabase.from("voting_votes").select("project_id, user_id");
    const counts: Record<string, number> = {};
    const mine: Record<string, boolean> = {};
    (votes ?? []).forEach((v: any) => {
      counts[v.project_id] = (counts[v.project_id] ?? 0) + 1;
      if (user && v.user_id === user.id) mine[v.project_id] = true;
    });
    setProjects(list.map((p) => ({ ...p, vote_count: counts[p.id] ?? 0, user_voted: !!mine[p.id] })));
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.id]);

  const vote = async (projectId: string, alreadyVoted: boolean) => {
    if (!user) return toast.error("Avval tizimga kiring");
    if (!isVip) return toast.error("Faqat VIP foydalanuvchilar ovoz bera oladi");
    if (alreadyVoted) {
      const { error } = await supabase
        .from("voting_votes")
        .delete()
        .eq("project_id", projectId)
        .eq("user_id", user.id);
      if (error) return toast.error(error.message);
      toast.success("Ovoz olib tashlandi");
    } else {
      const { error } = await supabase
        .from("voting_votes")
        .insert({ project_id: projectId, user_id: user.id });
      if (error) return toast.error(error.message);
      toast.success("Ovozingiz qabul qilindi!");
    }
    load();
  };

  const totalVotes = projects.reduce((s, p) => s + p.vote_count, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header search={search} onSearchChange={setSearch} />
      <main className="flex-1 pt-24 sm:pt-28 pb-16 max-w-[1200px] mx-auto w-full px-[15px] sm:px-8 animate-fade-up">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-xs font-display tracking-widest text-foreground/60 hover:text-neon transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> ORQAGA
        </button>

        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-3">
            <Crown className="h-4 w-4 text-amber-400" />
            <span className="text-[11px] font-display tracking-widest text-amber-400">VIP OVOZ BERISH</span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl multineon-text tracking-widest">
            KEYINGI LOYIHA
          </h1>
          <p className="text-sm text-foreground/70 mt-2 max-w-xl">
            Faqat VIP foydalanuvchilar keyin dublyaj qilinadigan loyihani tanlashda ishtirok etishlari mumkin.
          </p>
        </div>

        {!isVip && (
          <div className="glass rounded-xl p-5 mb-6 border border-amber-400/30 text-center">
            <Crown className="h-6 w-6 text-amber-400 mx-auto mb-2" />
            <p className="text-sm text-foreground/80">
              Ovoz berish uchun <a href="https://t.me/m/QoYHq2A0Nzgy" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline">VIP obuna</a> bo'ling
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 rounded-full border-2 border-neon/20 border-t-neon animate-spin-neon" />
          </div>
        ) : projects.length === 0 ? (
          <div className="glass rounded-xl p-10 text-center text-muted-foreground text-sm">
            Hozircha faol ovoz berish loyihalari yo'q
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => {
              const pct = totalVotes > 0 ? Math.round((p.vote_count / totalVotes) * 100) : 0;
              return (
                <div key={p.id} className="glass rounded-xl overflow-hidden flex flex-col">
                  {p.poster_url && (
                    <div className="aspect-[2/3] overflow-hidden bg-secondary">
                      <img src={p.poster_url} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4 flex flex-col gap-3 flex-1">
                    <div>
                      <h3 className="font-display tracking-widest text-base text-foreground">{p.title}</h3>
                      {p.description && (
                        <p className="text-xs text-foreground/60 mt-1 line-clamp-3">{p.description}</p>
                      )}
                    </div>

                    <div className="space-y-1 mt-auto">
                      <div className="flex justify-between text-[10px] font-display tracking-widest text-foreground/60">
                        <span>{p.vote_count} OVOZ</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-neon to-neon-pink transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => vote(p.id, p.user_voted)}
                      disabled={!isVip}
                      className={`w-full py-2.5 rounded-lg font-display text-[11px] tracking-widest transition-all ${
                        p.user_voted
                          ? "bg-neon/20 text-neon border border-neon/50 neon-glow-sm"
                          : isVip
                          ? "bg-neon text-primary-foreground hover:scale-[1.02] neon-glow-sm"
                          : "bg-foreground/5 text-foreground/40 cursor-not-allowed"
                      }`}
                    >
                      <Vote className="h-3.5 w-3.5 inline mr-1.5" />
                      {p.user_voted ? "OVOZ BERILDI" : "OVOZ BERISH"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Voting;
