import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Film, Link2, Code2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  value: string;
  onChange: (url: string) => void;
  uploadOnly?: boolean;
  compact?: boolean;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export const VideoUpload = ({ value, onChange, uploadOnly = false, compact = false }: Props) => {
  const [tab, setTab] = useState<"upload" | "link">(uploadOnly ? "upload" : "upload");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadXHR = (file: File) =>
    new Promise<string>(async (resolve, reject) => {
      const ext = (file.name.split(".").pop() || "mp4").toLowerCase();
      const path = `videos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const url = `${SUPABASE_URL}/storage/v1/object/media/${path}`;

      // pick up the current user session token if any, else fall back to anon key
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token || SUPABASE_KEY;

      const xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.setRequestHeader("apikey", SUPABASE_KEY);
      xhr.setRequestHeader("x-upsert", "false");
      xhr.setRequestHeader("Cache-Control", "3600");
      if (file.type) xhr.setRequestHeader("Content-Type", file.type);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const { data } = supabase.storage.from("media").getPublicUrl(path);
          resolve(data.publicUrl);
        } else {
          try {
            const j = JSON.parse(xhr.responseText);
            reject(new Error(j.message || j.error || `HTTP ${xhr.status}`));
          } catch {
            reject(new Error(`HTTP ${xhr.status}`));
          }
        }
      };
      xhr.onerror = () => reject(new Error("Tarmoq xatosi"));
      xhr.send(file);
    });

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("video/") && !/\.(mp4|mkv|webm|mov|m4v)$/i.test(file.name)) {
      toast.error("Faqat video fayl");
      return;
    }
    if (file.size > 2 * 1024 * 1024 * 1024) {
      toast.error("Video 2GB dan kichik bo'lishi kerak");
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const publicUrl = await uploadXHR(file);
      onChange(publicUrl);
      setProgress(100);
      toast.success("Video muvaffaqiyatli yuklandi");
    } catch (e: any) {
      toast.error(e?.message ?? "Yuklashda xato");
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1200);
    }
  };

  return (
    <div className="space-y-3">
      {/* Tab toggles */}
      {!uploadOnly && (
        <div className="grid grid-cols-2 gap-1 p-1 glass rounded-lg">
          <button
            type="button"
            onClick={() => setTab("upload")}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-[11px] font-display tracking-widest transition-all ${
              tab === "upload"
                ? "bg-neon/15 text-neon neon-glow-sm"
                : "text-foreground/60 hover:text-neon"
            }`}
          >
            <Upload className="h-3.5 w-3.5" /> A · FAYL YUKLASH
          </button>
          <button
            type="button"
            onClick={() => setTab("link")}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-[11px] font-display tracking-widest transition-all ${
              tab === "link"
                ? "bg-neon/15 text-neon neon-glow-sm"
                : "text-foreground/60 hover:text-neon"
            }`}
          >
            <Link2 className="h-3.5 w-3.5" /> B · LINK / EMBED
          </button>
        </div>
      )}

      {tab === "upload" ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          className="rounded-xl border border-dashed border-neon/40 bg-neon/[0.03] p-5 text-center space-y-3"
        >
          <div className="mx-auto h-12 w-12 rounded-full bg-neon/10 border border-neon/40 flex items-center justify-center neon-glow-sm">
            <Upload className="h-5 w-5 text-neon" />
          </div>
          <div className="text-xs text-foreground/80">
            Video faylni shu yerga tashlang yoki tanlang
          </div>
          <div className="text-[10px] text-muted-foreground">
            MP4 · MKV · WEBM · MOV — 2GB gacha
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="bg-neon text-primary-foreground hover:bg-neon/90 neon-glow-sm text-xs"
          >
            <Upload className="h-3 w-3 mr-1" />
            {uploading ? `Yuklanmoqda ${progress}%` : value ? "Boshqa fayl tanlash" : "Fayl tanlash"}
          </Button>

          {(uploading || progress > 0) && (
            <div className="space-y-1">
              <div className="h-2.5 w-full rounded-full bg-[#0A0F1E] border border-neon/30 overflow-hidden">
                <div
                  className="h-full transition-all duration-200"
                  style={{
                    width: `${progress}%`,
                    background:
                      "linear-gradient(90deg, hsl(var(--neon)) 0%, hsl(var(--neon-pink)) 100%)",
                    boxShadow:
                      "0 0 12px hsl(var(--neon) / 0.85), 0 0 24px hsl(var(--neon-pink) / 0.6)",
                  }}
                />
              </div>
              <div className="text-[10px] font-display tracking-widest text-neon tabular-nums">
                {progress}%
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="URL yoki <iframe src=...></iframe> kodini joylashtiring"
            className="text-xs"
          />
          <div className="text-[10px] text-muted-foreground leading-relaxed flex gap-1.5">
            <Code2 className="h-3 w-3 shrink-0 text-neon mt-0.5" />
            <span>
              MP4 · HLS .m3u8 · Google Drive · YouTube · DoodStream · Vidoza · Streamtape · to'liq{" "}
              <code>&lt;iframe&gt;</code> embed kodi — barchasi avtomatik aniqlanadi.
            </span>
          </div>
        </div>
      )}

      {value && (
        <div className="glass rounded-lg p-2 flex items-center gap-2 text-[11px] text-muted-foreground">
          <Film className="h-3.5 w-3.5 text-neon shrink-0" />
          <span className="truncate flex-1">{value}</span>
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-destructive hover:text-destructive/80"
            aria-label="Tozalash"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="video/*,.mkv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
};
