import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Palette, Plus, Trash2, Save, Share2 } from "lucide-react";
import {
  applyAccent,
  DEFAULT_SOCIALS,
  type FooterLink,
  type SocialLink,
  type SocialPlatform,
} from "@/hooks/useSiteSettings";

const PRESETS: { name: string; hsl: string }[] = [
  { name: "Neon Blue", hsl: "200 95% 60%" },
  { name: "Cyan", hsl: "185 100% 55%" },
  { name: "Violet", hsl: "265 90% 65%" },
  { name: "Pink", hsl: "330 90% 62%" },
  { name: "Emerald", hsl: "155 85% 48%" },
  { name: "Gold", hsl: "45 95% 55%" },
  { name: "Orange", hsl: "25 95% 58%" },
  { name: "Red", hsl: "0 85% 60%" },
];

const PLATFORMS: { value: SocialPlatform; label: string }[] = [
  { value: "telegram", label: "Telegram" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "website", label: "Sayt" },
];

const hexToHsl = (hex: string): string | null => {
  const m = /^#?([a-f\d]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const int = parseInt(m[1], 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const AdminSite = () => {
  const [accent, setAccent] = useState("200 95% 60%");
  const [hex, setHex] = useState("");
  const [footerEnabled, setFooterEnabled] = useState(true);
  const [footerText, setFooterText] = useState("");
  const [links, setLinks] = useState<FooterLink[]>([]);
  const [socials, setSocials] = useState<SocialLink[]>(DEFAULT_SOCIALS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_settings").select("*").eq("id", "main").maybeSingle();
      if (!data) return;
      const row = data as unknown as Record<string, unknown>;
      setAccent(row.accent_hsl as string);
      setFooterEnabled(row.footer_enabled as boolean);
      setFooterText(row.footer_text as string);
      setLinks(Array.isArray(row.footer_links) ? (row.footer_links as FooterLink[]) : []);
      setSocials(
        Array.isArray(row.social_links) && row.social_links.length
          ? (row.social_links as SocialLink[])
          : DEFAULT_SOCIALS
      );
    })();
  }, []);

  const pick = (hsl: string) => {
    setAccent(hsl);
    applyAccent(hsl);
  };

  const applyHex = () => {
    const hsl = hexToHsl(hex);
    if (!hsl) {
      toast.error("Noto'g'ri HEX rang (masalan #00A3FF)");
      return;
    }
    pick(hsl);
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .update({
        accent_hsl: accent,
        footer_enabled: footerEnabled,
        footer_text: footerText,
        footer_links: links as unknown as never,
        social_links: socials as unknown as never,
      })
      .eq("id", "main");
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      applyAccent(accent);
      toast.success("Sayt sozlamalari saqlandi");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl tracking-widest text-neon">SAYT TAHRIRLASH</h1>
        <p className="text-xs text-muted-foreground mt-1">Rang, ijtimoiy tarmoq va footer sozlamalari</p>
      </div>

      {/* Accent */}
      <section className="glass rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-neon" />
          <h2 className="font-display text-xs tracking-widest text-foreground/80">ASOSIY RANG</h2>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.hsl}
              onClick={() => pick(p.hsl)}
              title={p.name}
              className={`aspect-square rounded-xl border-2 transition-transform hover:scale-105 ${
                accent === p.hsl ? "border-foreground" : "border-transparent"
              }`}
              style={{ background: `hsl(${p.hsl})` }}
            />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            placeholder="#00A3FF"
            className="sm:max-w-[180px]"
          />
          <Button variant="secondary" onClick={applyHex}>
            HEX qo'llash
          </Button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className="h-6 w-6 rounded-md border border-foreground/20"
              style={{ background: `hsl(${accent})` }}
            />
            hsl({accent})
          </div>
        </div>
      </section>

      {/* Social icons */}
      <section className="glass rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-neon" />
            <h2 className="font-display text-xs tracking-widest text-foreground/80">
              IJTIMOIY TARMOQ IKONKALARI
            </h2>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-neon"
            onClick={() =>
              setSocials([...socials, { platform: "telegram", url: "", label: "Telegram" }])
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Qo'shish
          </Button>
        </div>

        {socials.length === 0 && (
          <p className="text-xs text-muted-foreground">Hozircha ikonka yo'q</p>
        )}

        {socials.map((s, i) => (
          <div key={i} className="flex flex-col sm:flex-row gap-2">
            <select
              value={s.platform}
              onChange={(e) => {
                const next = [...socials];
                const platform = e.target.value as SocialPlatform;
                next[i] = {
                  ...next[i],
                  platform,
                  label: PLATFORMS.find((p) => p.value === platform)?.label ?? platform,
                };
                setSocials(next);
              }}
              className="h-10 rounded-md bg-input border border-border px-3 text-sm text-foreground sm:w-[140px]"
            >
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <Input
              value={s.url}
              placeholder="https://t.me/ZeiDubbing"
              onChange={(e) => {
                const next = [...socials];
                next[i] = { ...next[i], url: e.target.value };
                setSocials(next);
              }}
              className="flex-1"
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setSocials(socials.filter((_, x) => x !== i))}
              className="text-destructive shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </section>

      {/* Footer */}
      <section className="glass rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xs tracking-widest text-foreground/80">FOOTER</h2>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">
              {footerEnabled ? "Yoqilgan" : "O'chirilgan"}
            </span>
            <Switch checked={footerEnabled} onCheckedChange={setFooterEnabled} />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] tracking-widest text-muted-foreground">MATN</Label>
          <Input value={footerText} onChange={(e) => setFooterText(e.target.value)} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] tracking-widest text-muted-foreground">TUGMALAR</Label>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setLinks([...links, { label: "", url: "" }])}
              className="text-neon"
            >
              <Plus className="h-4 w-4 mr-1" /> Qo'shish
            </Button>
          </div>

          {links.length === 0 && (
            <p className="text-xs text-muted-foreground">Hozircha tugma yo'q</p>
          )}

          {links.map((l, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={l.label}
                placeholder="Nomi"
                onChange={(e) => {
                  const next = [...links];
                  next[i] = { ...next[i], label: e.target.value };
                  setLinks(next);
                }}
                className="flex-1"
              />
              <Input
                value={l.url}
                placeholder="https://..."
                onChange={(e) => {
                  const next = [...links];
                  next[i] = { ...next[i], url: e.target.value };
                  setLinks(next);
                }}
                className="flex-[1.4]"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setLinks(links.filter((_, x) => x !== i))}
                className="text-destructive shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <Button
        onClick={save}
        disabled={saving}
        className="w-full sm:w-auto bg-neon text-primary-foreground hover:bg-neon/90"
      >
        <Save className="h-4 w-4 mr-1" />
        {saving ? "Saqlanmoqda..." : "Saqlash"}
      </Button>
    </div>
  );
};

export default AdminSite;
