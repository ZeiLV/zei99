import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder: "posters" | "banners";
  aspect?: "9/16" | "16/9";
}

export const ImageUpload = ({ value, onChange, folder, aspect = "16/9" }: Props) => {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Faqat rasm fayli");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Rasm 8MB dan kichik bo'lishi kerak");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      const { data } = supabase.storage.from("media").getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Yuklandi");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div
        className={`relative w-full glass rounded-lg overflow-hidden ${
          aspect === "9/16" ? "aspect-[9/16] max-w-[140px]" : "aspect-video"
        }`}
      >
        {value ? (
          <>
            <img src={value} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-background/70 backdrop-blur flex items-center justify-center text-foreground hover:text-destructive"
              aria-label="O'chirish"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-neon transition-colors"
          >
            {uploading ? (
              <div className="h-8 w-8 rounded-full border-2 border-neon/20 border-t-neon animate-spin-neon" />
            ) : (
              <>
                <Upload className="h-5 w-5" />
                <span className="text-[11px] font-display tracking-widest">YUKLASH</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="text-xs"
        >
          <Upload className="h-3 w-3 mr-1" />
          {value ? "Almashtirish" : "Tanlash"}
        </Button>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="yoki URL kiriting"
          className="text-xs h-8"
        />
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
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
