import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Content, Episode } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LogOut, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ImageUpload";

const Admin = () => {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [contents, setContents] = useState<Content[]>([]);
  const [episodesByContent, setEpisodesByContent] = useState<Record<string, Episode[]>>({});
  const [editingContent, setEditingContent] = useState<Partial<Content> | null>(null);
  const [editingEp, setEditingEp] = useState<{ contentId: string; ep: Partial<Episode> } | null>(null);

  // Guard
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/", { replace: true });
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (cancelled) return;
      if (!roles) {
        await supabase.auth.signOut();
        navigate("/", { replace: true });
        return;
      }
      setAuthChecked(true);
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  const loadAll = async () => {
    const { data: cs } = await supabase.from("content").select("*").order("created_at", { ascending: false });
    const list = (cs ?? []) as Content[];
    setContents(list);
    if (list.length) {
      const { data: eps } = await supabase
        .from("episodes")
        .select("*")
        .in("content_id", list.map((c) => c.id))
        .order("episode_number", { ascending: true });
      const grouped: Record<string, Episode[]> = {};
      ((eps ?? []) as Episode[]).forEach((e) => {
        (grouped[e.content_id] ||= []).push(e);
      });
      setEpisodesByContent(grouped);
    } else {
      setEpisodesByContent({});
    }
  };

  useEffect(() => { if (authChecked) loadAll(); }, [authChecked]);

  const saveContent = async () => {
    if (!editingContent || !editingContent.title) return;
    const payload = {
      title: editingContent.title,
      description: editingContent.description ?? null,
      genre: typeof editingContent.genre === "string"
        ? (editingContent.genre as unknown as string).split(",").map((s) => s.trim()).filter(Boolean)
        : (editingContent.genre ?? []),
      poster_url: editingContent.poster_url ?? null,
      banner_url: editingContent.banner_url ?? null,
    };
    if (editingContent.id) {
      const { error } = await supabase.from("content").update(payload).eq("id", editingContent.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("content").insert(payload);
      if (error) return toast.error(error.message);
    }
    toast.success("Saqlandi");
    setEditingContent(null);
    loadAll();
  };

  const deleteContent = async (id: string) => {
    if (!confirm("O'chirilsinmi?")) return;
    const { error } = await supabase.from("content").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("O'chirildi");
    loadAll();
  };

  const saveEp = async () => {
    if (!editingEp) return;
    const { contentId, ep } = editingEp;
    if (!ep.title || !ep.gdrive_url || ep.episode_number == null) return;
    const payload = {
      content_id: contentId,
      episode_number: Number(ep.episode_number),
      title: ep.title,
      gdrive_url: ep.gdrive_url,
      is_vip: ep.is_vip ?? true,
    };
    if (ep.id) {
      const { error } = await supabase.from("episodes").update(payload).eq("id", ep.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("episodes").insert(payload);
      if (error) return toast.error(error.message);
    }
    toast.success("Saqlandi");
    setEditingEp(null);
    loadAll();
  };

  const deleteEp = async (id: string) => {
    if (!confirm("O'chirilsinmi?")) return;
    const { error } = await supabase.from("episodes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    loadAll();
  };

  const toggleEpVip = async (ep: Episode) => {
    const { error } = await supabase.from("episodes").update({ is_vip: !ep.is_vip }).eq("id", ep.id);
    if (error) return toast.error(error.message);
    loadAll();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-neon/20 border-t-neon animate-spin-neon" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <header className="fixed top-0 inset-x-0 z-40 glass-strong border-b border-neon/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="font-display neon-text tracking-widest text-sm sm:text-base">ZEI · ADMIN</div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>Sayt</Button>
            <Button variant="ghost" size="sm" onClick={logout}><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <main className="pt-20 max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display tracking-widest text-lg">KONTENT</h1>
          <Button
            onClick={() => setEditingContent({ title: "", description: "", genre: [], poster_url: "", banner_url: "" })}
            className="bg-neon text-primary-foreground hover:bg-neon/90 neon-glow-sm"
          >
            <Plus className="h-4 w-4 mr-1" /> Yangi
          </Button>
        </div>

        <div className="space-y-3">
          {contents.length === 0 && (
            <div className="glass rounded-lg p-6 text-center text-muted-foreground text-sm">
              Hali kontent qo'shilmagan
            </div>
          )}

          {contents.map((c) => (
            <div key={c.id} className="glass rounded-xl overflow-hidden">
              <div className="p-4 flex gap-4 items-start">
                {c.poster_url && (
                  <img src={c.poster_url} alt="" className="w-14 h-20 object-cover rounded" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-display tracking-wide">{c.title}</div>
                  <div className="text-[11px] text-neon/80 mt-1">{c.genre?.join(" • ")}</div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</div>
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setEditingContent({
                        ...c,
                        // join genre for textbox editing
                        genre: c.genre as unknown as string[],
                      })
                    }
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteContent(c.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {/* Episodes */}
              <div className="border-t border-neon/15 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-display text-xs tracking-widest text-foreground/80">EPIZODLAR</div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setEditingEp({
                        contentId: c.id,
                        ep: {
                          episode_number: (episodesByContent[c.id]?.length ?? 0) + 1,
                          title: "",
                          gdrive_url: "",
                          is_vip: (episodesByContent[c.id]?.length ?? 0) > 0,
                        },
                      })
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {(episodesByContent[c.id] ?? []).map((ep) => (
                  <div key={ep.id} className="flex items-center gap-2 p-2 rounded glass">
                    <div className="font-display text-neon w-8 text-center text-sm">{ep.episode_number}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{ep.title}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{ep.gdrive_url}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-display tracking-widest text-neon/70">VIP</span>
                      <Switch checked={ep.is_vip} onCheckedChange={() => toggleEpVip(ep)} />
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setEditingEp({ contentId: c.id, ep })}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteEp(ep.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Content modal */}
      {editingContent && (
        <Modal onClose={() => setEditingContent(null)} title={editingContent.id ? "Tahrirlash" : "Yangi kontent"}>
          <Field label="Sarlavha">
            <Input value={editingContent.title ?? ""} onChange={(e) => setEditingContent({ ...editingContent, title: e.target.value })} />
          </Field>
          <Field label="Tavsif">
            <Textarea rows={3} value={editingContent.description ?? ""} onChange={(e) => setEditingContent({ ...editingContent, description: e.target.value })} />
          </Field>
          <Field label="Janrlar (vergul bilan)">
            <Input
              value={Array.isArray(editingContent.genre) ? (editingContent.genre as string[]).join(", ") : (editingContent.genre as unknown as string ?? "")}
              onChange={(e) => setEditingContent({ ...editingContent, genre: e.target.value as unknown as string[] })}
              placeholder="Anime, Sarguzasht"
            />
          </Field>
          <Field label="Poster (9:16)">
            <ImageUpload
              value={editingContent.poster_url ?? ""}
              onChange={(url) => setEditingContent({ ...editingContent, poster_url: url })}
              folder="posters"
              aspect="9/16"
            />
          </Field>
          <Field label="Banner (16:9)">
            <ImageUpload
              value={editingContent.banner_url ?? ""}
              onChange={(url) => setEditingContent({ ...editingContent, banner_url: url })}
              folder="banners"
              aspect="16/9"
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setEditingContent(null)}>Bekor</Button>
            <Button onClick={saveContent} className="bg-neon text-primary-foreground hover:bg-neon/90">Saqlash</Button>
          </div>
        </Modal>
      )}

      {/* Episode modal */}
      {editingEp && (
        <Modal onClose={() => setEditingEp(null)} title={editingEp.ep.id ? "Epizodni tahrirlash" : "Yangi epizod"}>
          <Field label="Epizod #">
            <Input
              type="number"
              value={editingEp.ep.episode_number ?? ""}
              onChange={(e) => setEditingEp({ ...editingEp, ep: { ...editingEp.ep, episode_number: Number(e.target.value) } })}
            />
          </Field>
          <Field label="Sarlavha">
            <Input
              value={editingEp.ep.title ?? ""}
              onChange={(e) => setEditingEp({ ...editingEp, ep: { ...editingEp.ep, title: e.target.value } })}
            />
          </Field>
          <Field label="Google Drive URL">
            <Input
              value={editingEp.ep.gdrive_url ?? ""}
              onChange={(e) => setEditingEp({ ...editingEp, ep: { ...editingEp.ep, gdrive_url: e.target.value } })}
              placeholder="https://drive.google.com/file/d/..../view"
            />
          </Field>
          <div className="flex items-center justify-between p-3 glass rounded-lg">
            <div>
              <div className="font-display text-sm tracking-widest">VIP</div>
              <div className="text-[11px] text-muted-foreground">Faqat obunachilar uchun</div>
            </div>
            <Switch
              checked={editingEp.ep.is_vip ?? true}
              onCheckedChange={(v) => setEditingEp({ ...editingEp, ep: { ...editingEp.ep, is_vip: v } })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setEditingEp(null)}>Bekor</Button>
            <Button onClick={saveEp} className="bg-neon text-primary-foreground hover:bg-neon/90">Saqlash</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

const Modal = ({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) => (
  <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
    <div className="glass-strong rounded-xl w-full max-w-md p-5 space-y-3 my-8">
      <div className="flex items-center justify-between">
        <h3 className="font-display tracking-widest neon-text">{title}</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-neon">
          <X className="h-4 w-4" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-[11px] font-display tracking-widest text-foreground/70">{label}</Label>
    {children}
  </div>
);

export default Admin;
