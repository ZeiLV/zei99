import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VotingProject } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, X, Vote } from "lucide-react";
import { toast } from "sonner";

interface Form {
  id?: string;
  title: string;
  description: string;
  poster_url: string;
  is_active: boolean;
}

const empty: Form = { title: "", description: "", poster_url: "", is_active: true };

const AdminVoting = () => {
  const [projects, setProjects] = useState<(VotingProject & { vote_count: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Form | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: pr } = await supabase
      .from("voting_projects")
      .select("*")
      .order("created_at", { ascending: false });
    const { data: votes } = await supabase.from("voting_votes").select("project_id");
    const counts: Record<string, number> = {};
    (votes ?? []).forEach((v: any) => {
      counts[v.project_id] = (counts[v.project_id] ?? 0) + 1;
    });
    setProjects(((pr ?? []) as VotingProject[]).map((p) => ({ ...p, vote_count: counts[p.id] ?? 0 })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim()) return toast.error("Sarlavha kerak");
    const payload = {
      title: editing.title.trim(),
      description: editing.description.trim() || null,
      poster_url: editing.poster_url.trim() || null,
      is_active: editing.is_active,
    };
    const { error } = editing.id
      ? await supabase.from("voting_projects").update(payload).eq("id", editing.id)
      : await supabase.from("voting_projects").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saqlandi");
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("O'chirilsinmi? Barcha ovozlar yo'qoladi.")) return;
    const { error } = await supabase.from("voting_projects").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const toggleActive = async (p: VotingProject) => {
    const { error } = await supabase
      .from("voting_projects")
      .update({ is_active: !p.is_active })
      .eq("id", p.id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-xl sm:text-2xl tracking-widest multineon-text">VIP OVOZ BERISH</h1>
          <p className="text-xs text-muted-foreground mt-1">VIP foydalanuvchilar tanlovi uchun loyihalar</p>
        </div>
        <Button onClick={() => setEditing({ ...empty })} className="bg-neon text-primary-foreground hover:bg-neon/90 neon-glow-sm">
          <Plus className="h-4 w-4 mr-1" /> Yangi loyiha
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 rounded-full border-2 border-neon/20 border-t-neon animate-spin-neon" />
        </div>
      ) : projects.length === 0 ? (
        <div className="glass rounded-lg p-10 text-center text-muted-foreground text-sm">
          Hali loyiha qo'shilmagan
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map((p) => (
            <div key={p.id} className="glass rounded-lg p-3 flex items-center gap-3">
              {p.poster_url ? (
                <img src={p.poster_url} alt={p.title} className="h-14 w-10 object-cover rounded shrink-0" />
              ) : (
                <div className="h-14 w-10 rounded bg-secondary shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{p.title}</div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-2 mt-0.5">
                  <span className="inline-flex items-center gap-1 text-neon">
                    <Vote className="h-3 w-3" /> {p.vote_count} ovoz
                  </span>
                  {!p.is_active && <span className="text-amber-400">noaktiv</span>}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Switch checked={p.is_active} onCheckedChange={() => toggleActive(p)} />
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setEditing({
                    id: p.id,
                    title: p.title,
                    description: p.description ?? "",
                    poster_url: p.poster_url ?? "",
                    is_active: p.is_active,
                  })
                }
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove(p.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-strong rounded-xl w-full max-w-md p-5 space-y-3 my-8">
            <div className="flex items-center justify-between">
              <h3 className="font-display tracking-widest neon-text">
                {editing.id ? "Tahrirlash" : "Yangi loyiha"}
              </h3>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-neon">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-display tracking-widest text-foreground/70">Sarlavha</Label>
              <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-display tracking-widest text-foreground/70">Tavsif</Label>
              <Input value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-display tracking-widest text-foreground/70">Poster URL</Label>
              <Input value={editing.poster_url} onChange={(e) => setEditing({ ...editing, poster_url: e.target.value })} placeholder="https://..." />
            </div>

            <div className="flex items-center justify-between p-3 glass rounded-lg">
              <div>
                <div className="font-display text-sm tracking-widest">FAOL</div>
                <div className="text-[11px] text-muted-foreground">Saytda ko'rinadi</div>
              </div>
              <Switch checked={editing.is_active} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>Bekor</Button>
              <Button onClick={save} className="bg-neon text-primary-foreground hover:bg-neon/90">Saqlash</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVoting;
