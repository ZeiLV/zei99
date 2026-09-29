import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ExternalLink, Image as ImageIcon, X } from "lucide-react";
import { isZeilabMediaUrl, ZEILAB_MEDIA_HINT } from "@/lib/mediaUrl";

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder: "posters" | "banners";
  aspect?: "9/16" | "16/9";
  initialValue?: string;
}

export const ImageUpload = ({ value, onChange, folder, aspect = "16/9", initialValue = "" }: Props) => {
  const [imageFailed, setImageFailed] = useState(false);
  const isUnchangedLegacy = !!value && value === initialValue;
  const valid = !value || isZeilabMediaUrl(value) || isUnchangedLegacy;

  return (
    <div className="space-y-2">
      <div
        className={`relative w-full glass rounded-lg overflow-hidden ${
          aspect === "9/16" ? "aspect-[9/16] max-w-[140px]" : "aspect-video"
        }`}
      >
        {value && !imageFailed ? (
          <>
            <img src={value} alt="" className="w-full h-full object-cover" onError={() => setImageFailed(true)} />
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
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImageIcon className="h-5 w-5" />
              <span className="text-[11px] font-display tracking-widest">CDN RASM HAVOLASI</span>
            </div>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="relative">
          <ExternalLink className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neon" />
        <Input
          value={value}
            onChange={(e) => { setImageFailed(false); onChange(e.target.value); }}
            placeholder={ZEILAB_MEDIA_HINT}
            className={`h-9 pl-9 text-xs ${valid ? "" : "border-destructive"}`}
        />
        </div>
        <p className={`text-[10px] ${valid ? "text-muted-foreground" : "text-destructive"}`}>
          {isUnchangedLegacy && !isZeilabMediaUrl(value)
            ? "Eski havola saqlanadi. Almashtirsangiz, yangi Zeilab CDN havolasini kiriting."
            : valid
              ? `${folder === "posters" ? "Poster" : "Banner"} avval Zeilab CDN'ga yuklanadi, keyin tayyor havola shu yerga qo'yiladi.`
              : "Faqat cdn.zeilab.uz dagi to'g'ridan-to'g'ri fayl havolasini kiriting."}
        </p>
      </div>
    </div>
  );
};
