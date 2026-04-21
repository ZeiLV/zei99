import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Content, Episode, VideoType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Pencil, Trash2, X, Lock, Lock as LockIcon } from "lucide-react";
import { toast } from "sonner";

interface EpForm {
  id?: string;
  episode_number: number;
  title: string;
  video_type: VideoType;
  gdrive_url: string;
  video_url: string;
  is_vip: boolean;
}

const emptyEp = (next: number, vip: boolean): EpForm => ({
  episode_number: next,
  title: "",
  video_type: "gdrive",
  gdrive_url: "",
  video_url: "",
  is_vip: vip,
});

const AdminEpisodes = () => {
  const { id } = useParams();
  const [content, setContent] = useState<Content | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [editing, setEditing] = useState<EpForm | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const [{ data: c }, { data: eps }] = await Promise.all([
      supabase.from("content").select("*").eq("id", id).maybeSingle(),
      supabase.from("episodes").select("*").eq("content_id", id).order("episode_number", { ascending: true }),
    ]);
    setContent(c as Content | null);
    setEpisodes((eps ?? []) as Episode[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const save = async () => {
    if (!editing || !id) return;
    if (!editing.title.trim()) return toast.error("Sarlavha kerak");
    if (editing.video_type === "gdrive" && !editing.gdrive_url.trim())
      return toast.error("Google Drive havolasi kerak");
    if (editing.video_type === "direct" && !editing.video_url.trim())
      return toast.error("Video URL kerak");

    const payload = {
      content_id: id,
      episode_number: Number(editing.episode_number),
      title: editing.title.trim(),
      video_type: editing.video_type,
      gdrive_url: editing.video_type === "gdrive" ? editing.gdrive_url.trim() : "",
      video_url: editing.video_type === "direct" ? editing.video_url.trim() : null,
      is_vip: editing.is_vip,
    };

    const { error } = editing.id
      ? await supabase.from("episodes").update(payload).eq("id", editing.id)
      : await supabase.from("episodes").insert(payload);

    if (error) return toast.error(error.message);
    toast.success("Saqlandi");
    setEditing(null);
    load();
  };

  const remove = async (epId: string) => {
    if (!confirm("Epizod o'chirilsinmi?")) return;
    const { error } = await supabase.from("episodes").delete().eq("id", epId);
    if (error) return toast.error(error.message);
    load();
  };

  const toggleVip = async (ep: Episode) => {
    const { error } = await supabase.from("episodes").update({ is_vip: !ep.is_vip }).eq("id", ep.id);
    if (error) return toast.error(error.message);
    load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 rounded-full border-2 border-neon/20 border-t-neon animate-spin-neon" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/admin/content">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div className="min-w-0">
            <h1 className="font-display text-xl sm:text-2xl tracking-widest multineon-text truncate">
              EPIZODLAR
            </h1>
            <p className="text-xs text-muted-foreground mt-1 truncate">{content?.title}</p>
          </div>
        </div>
        <Button
          onClick={() => setEditing(emptyEp(episodes.length + 1, episodes.length > 0))}
          className="bg-neon text-primary-foreground hover:bg-neon/90 neon-glow-sm"
        >
          <Plus className="h-4 w-4 mr-1" /> Yangi epizod
        </Button>
      </div>

      {episodes.length === 0 ? (
        <div className="glass rounded-lg p-10 text-center text-muted-foreground text-sm">
          Hali epizod qo'shilmagan
        </div>
      ) : (
        <div className="space-y-2">
          {episodes.map((ep) => (
            <div key={ep.id} className="glass rounded-lg p-3 flex items-center gap-3">
              <div className="font-display text-xl sm:text-2xl text-neon w-10 text-center shrink-0">
                {ep.episode_number}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate flex items-center gap-2">
                  {ep.title}
                  {ep.is_vip && <Lock className="h-3 w-3 text-neon-pink shrink-0" />}
                </div>
                <div className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-neon/10 text-neon font-display tracking-widest">
                    {ep.video_type === "direct" ? "MP4" : "GDRIVE"}
                  </span>
                  <span className="truncate">{ep.video_type === "direct" ? ep.video_url : ep.gdrive_url}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="hidden sm:inline text-[10px] font-display tracking-widest text-neon/70">VIP</span>
                <Switch checked={ep.is_vip} onCheckedChange={() => toggleVip(ep)} />
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setEditing({
                    id: ep.id,
                    episode_number: ep.episode_number,
                    title: ep.title,
                    video_type: ep.video_type,
                    gdrive_url: ep.gdrive_url ?? "",
                    video_url: ep.video_url ?? "",
                    is_vip: ep.is_vip,
                  })
                }
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove(ep.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-strong rounded-xl w-full max-w-md p-5 space-y-3 my-8">
            <div className="flex items-center justify-between">
              <h3 className="font-display tracking-widest neon-text">
                {editing.id ? "Tahrirlash" : "Yangi epizod"}
              </h3>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-neon">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Field label="Epizod #">
                <Input
                  type="number"
                  value={editing.episode_number}
                  onChange={(e) => setEditing({ ...editing, episode_number: Number(e.target.value) })}
                />
              </Field>
              <div className="col-span-2">
                <Field label="Sarlavha">
                  <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                </Field>
              </div>
            </div>

            <Field label="Video turi">
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setEditing({ ...editing, video_type: "gdrive" })}
                  className={`px-3 py-2 rounded-lg text-[11px] font-display tracking-widest transition-all ${
                    editing.video_type === "gdrive" ? "bg-neon/15 text-neon neon-glow-sm" : "glass text-foreground/70"
                  }`}
                >
                  GOOGLE DRIVE
                </button>
                <button
                  type="button"
                  onClick={() => setEditing({ ...editing, video_type: "direct" })}
                  className={`px-3 py-2 rounded-lg text-[11px] font-display tracking-widest transition-all ${
                    editing.video_type === "direct" ? "bg-neon/15 text-neon neon-glow-sm" : "glass text-foreground/70"
                  }`}
                >
                  TO'G'RIDAN MP4
                </button>
              </div>
            </Field>

            {editing.video_type === "gdrive" ? (
              <Field label="Google Drive havolasi">
                <Input
                  value={editing.gdrive_url}
                  onChange={(e) => setEditing({ ...editing, gdrive_url: e.target.value })}
                  placeholder="https://drive.google.com/file/d/..../view"
                />
              </Field>
            ) : (
              <Field label="Video URL (MP4 yoki HLS)">
                <Input
                  value={editing.video_url}
                  onChange={(e) => setEditing({ ...editing, video_url: e.target.value })}
                  placeholder="https://example.com/video.mp4"
                />
              </Field>
            )}

            <div className="flex items-center justify-between p-3 glass rounded-lg">
              <div>
                <div className="font-display text-sm tracking-widest flex items-center gap-2">
                  <LockIcon className="h-3.5 w-3.5" /> VIP
                </div>
                <div className="text-[11px] text-muted-foreground">Faqat obunachilar uchun</div>
              </div>
              <Switch
                checked={editing.is_vip}
                onCheckedChange={(v) => setEditing({ ...editing, is_vip: v })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>Bekor</Button>
              <Button onClick={save} className="bg-neon text-primary-foreground hover:bg-neon/90">
                Saqlash
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-[11px] font-display tracking-widest text-foreground/70">{label}</Label>
    {children}
  </div>
);

export default AdminEpisodes;
