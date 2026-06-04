import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Film } from "lucide-react";
import { toast } from "sonner";

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export const VideoUpload = ({ value, onChange }: Props) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    if (!file.type.startsWith("video/")) {
      toast.error("Faqat video fayl");
      return;
    }
    // Supabase Storage single-request limit is ~50MB by default; warn for big files
    if (file.size > 500 * 1024 * 1024) {
      toast.error("Video 500MB dan kichik bo'lishi kerak");
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const ext = file.name.split(".").pop() || "mp4";
      const path = `videos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      // simulate progress (Supabase JS v2 doesn't expose progress for browser uploads reliably)
      const tick = setInterval(() => {
        setProgress((p) => (p < 90 ? p + 2 : p));
      }, 300);

      const { error } = await supabase.storage.from("media").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

      clearInterval(tick);

      if (error) {
        toast.error(error.message);
        return;
      }
      const { data } = supabase.storage.from("media").getPublicUrl(path);
      onChange(data.publicUrl);
      setProgress(100);
      toast.success("Video yuklandi");
    } catch (e: any) {
      toast.error(e?.message ?? "Yuklashda xato");
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="text-xs shrink-0"
        >
          <Upload className="h-3 w-3 mr-1" />
          {uploading ? `Yuklanmoqda ${progress}%` : value ? "Video almashtirish" : "Video tanlash"}
        </Button>
        {value && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onChange("")}
            className="text-xs text-destructive"
          >
            <X className="h-3 w-3 mr-1" /> Tozalash
          </Button>
        )}
      </div>

      {uploading && (
        <div className="h-1 w-full rounded bg-neon/10 overflow-hidden">
          <div
            className="h-full bg-neon transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {value && !uploading && (
        <div className="glass rounded-lg p-2 flex items-center gap-2 text-[11px] text-muted-foreground">
          <Film className="h-3.5 w-3.5 text-neon shrink-0" />
          <span className="truncate flex-1">{value}</span>
        </div>
      )}

      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="yoki to'g'ridan-to'g'ri video URL kiriting (MP4, HLS .m3u8)"
        className="text-xs h-8"
      />

      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = "";
        }}
      />
    </div>
  );
};
