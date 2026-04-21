import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Category, CATEGORIES, Content } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ImageUpload";
import { ArrowLeft, Tv, Save } from "lucide-react";
import { toast } from "sonner";

interface FormState {
  title: string;
  description: string;
  category: Category;
  genre: string;
  year: string;
  rating: string;
  duration: string;
  poster_url: string;
  banner_url: string;
  is_trending: boolean;
  is_featured: boolean;
}

const empty: FormState = {
  title: "",
  description: "",
  category: "anime",
  genre: "",
  year: "",
  rating: "",
  duration: "",
  poster_url: "",
  banner_url: "",
  is_trending: false,
  is_featured: false,
};

const AdminContentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState<FormState>(empty);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase.from("content").select("*").eq("id", id).maybeSingle();
      if (error || !data) {
        toast.error("Topilmadi");
        navigate("/admin/content", { replace: true });
        return;
      }
      const c = data as Content;
      setForm({
        title: c.title,
        description: c.description ?? "",
        category: c.category,
        genre: (c.genre ?? []).join(", "),
        year: c.year?.toString() ?? "",
        rating: c.rating?.toString() ?? "",
        duration: c.duration ?? "",
        poster_url: c.poster_url ?? "",
        banner_url: c.banner_url ?? "",
        is_trending: c.is_trending,
        is_featured: c.is_featured,
      });
      setLoading(false);
    })();
  }, [id, navigate]);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title.trim()) {
      toast.error("Sarlavha kerak");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      category: form.category,
      genre: form.genre.split(",").map((s) => s.trim()).filter(Boolean),
      year: form.year ? Number(form.year) : null,
      rating: form.rating ? Number(form.rating) : 0,
      duration: form.duration.trim() || null,
      poster_url: form.poster_url || null,
      banner_url: form.banner_url || null,
      is_trending: form.is_trending,
      is_featured: form.is_featured,
    };
    let savedId = id;
    if (id) {
      const { error } = await supabase.from("content").update(payload).eq("id", id);
      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { data, error } = await supabase.from("content").insert(payload).select("id").single();
      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
      savedId = data.id;
    }
    toast.success("Saqlandi");
    setSaving(false);
    navigate(isEdit ? "/admin/content" : `/admin/content/${savedId}/episodes`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 rounded-full border-2 border-neon/20 border-t-neon animate-spin-neon" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link to="/admin/content">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="font-display text-xl sm:text-2xl tracking-widest multineon-text">
              {isEdit ? "TAHRIRLASH" : "YANGI KONTENT"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {isEdit ? form.title : "Yangi anime, drama, kino yoki multfilm"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {isEdit && (
            <Link to={`/admin/content/${id}/episodes`}>
              <Button variant="ghost"><Tv className="h-4 w-4 mr-1" /> Epizodlar</Button>
            </Link>
          )}
          <Button onClick={save} disabled={saving} className="bg-neon text-primary-foreground hover:bg-neon/90">
            <Save className="h-4 w-4 mr-1" /> {saving ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4 glass rounded-xl p-4 sm:p-5">
          <Field label="Sarlavha *">
            <Input value={form.title} onChange={(e) => update("title", e.target.value)} />
          </Field>
          <Field label="Tavsif">
            <Textarea rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} />
          </Field>
          <Field label="Kategoriya *">
            <div className="grid grid-cols-4 gap-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => update("category", c.value)}
                  className={`px-2 py-2 rounded-lg text-[11px] font-display tracking-widest transition-all ${
                    form.category === c.value
                      ? "bg-neon/15 text-neon neon-glow-sm"
                      : "glass text-foreground/70 hover:text-neon"
                  }`}
                >
                  {c.label.toUpperCase()}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Janrlar (vergul bilan ajrating)">
            <Input
              value={form.genre}
              onChange={(e) => update("genre", e.target.value)}
              placeholder="Sarguzasht, Romantika, Jangari"
            />
          </Field>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Yil">
              <Input type="number" value={form.year} onChange={(e) => update("year", e.target.value)} placeholder="2024" />
            </Field>
            <Field label="Reyting (0-10)">
              <Input type="number" step="0.1" min="0" max="10" value={form.rating} onChange={(e) => update("rating", e.target.value)} placeholder="8.5" />
            </Field>
            <Field label="Davomiyligi">
              <Input value={form.duration} onChange={(e) => update("duration", e.target.value)} placeholder="24 daq" />
            </Field>
          </div>

          <div className="space-y-2 pt-2">
            <ToggleRow
              label="Trendda ko'rsatish"
              hint="Bosh sahifaning 'Trend' bo'limida chiqadi"
              checked={form.is_trending}
              onChange={(v) => update("is_trending", v)}
            />
            <ToggleRow
              label="Tanlangan (Featured)"
              hint="Bosh sahifa hero slideridagi e'tibor markazida"
              checked={form.is_featured}
              onChange={(v) => update("is_featured", v)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-xl p-4 sm:p-5 space-y-2">
            <Label className="text-[11px] font-display tracking-widest text-foreground/70">POSTER (9:16)</Label>
            <ImageUpload
              value={form.poster_url}
              onChange={(url) => update("poster_url", url)}
              folder="posters"
              aspect="9/16"
            />
          </div>
          <div className="glass rounded-xl p-4 sm:p-5 space-y-2">
            <Label className="text-[11px] font-display tracking-widest text-foreground/70">BANNER (16:9)</Label>
            <ImageUpload
              value={form.banner_url}
              onChange={(url) => update("banner_url", url)}
              folder="banners"
              aspect="16/9"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-[11px] font-display tracking-widest text-foreground/70">{label}</Label>
    {children}
  </div>
);

const ToggleRow = ({
  label, hint, checked, onChange,
}: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between p-3 glass rounded-lg">
    <div className="min-w-0">
      <div className="font-display text-sm tracking-wide truncate">{label}</div>
      <div className="text-[10px] text-muted-foreground truncate">{hint}</div>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

export default AdminContentEdit;
