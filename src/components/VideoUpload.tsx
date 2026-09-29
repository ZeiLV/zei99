import { Input } from "@/components/ui/input";
import { Film, Link2, X } from "lucide-react";
import { isSupportedVideoUrl, ZEILAB_MEDIA_HINT } from "@/lib/mediaUrl";

interface Props {
  value: string;
  onChange: (url: string) => void;
  uploadOnly?: boolean;
  compact?: boolean;
  label?: string;
  initialValue?: string;
}

export const VideoUpload = ({ value, onChange, compact = false, label = "CDN VIDEO HAVOLASI", initialValue = "" }: Props) => {
  const isUnchangedLegacy = !!value && value === initialValue;
  const valid = !value || isSupportedVideoUrl(value) || isUnchangedLegacy;

  return (
    <div className="space-y-2">
      <div className={`rounded-lg border border-neon/20 bg-background/40 ${compact ? "p-3" : "p-4"}`}>
        <div className="mb-2 flex items-center gap-2 text-[11px] font-display tracking-widest text-neon">
          <Link2 className="h-3.5 w-3.5" /> {label}
        </div>
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={`${ZEILAB_MEDIA_HINT}/video.mp4 yoki stream.m3u8`}
          className={`text-xs ${valid ? "" : "border-destructive"}`}
        />
        <p className={`mt-2 text-[10px] leading-relaxed ${valid ? "text-muted-foreground" : "text-destructive"}`}>
          {isUnchangedLegacy && !isSupportedVideoUrl(value)
            ? "Eski manba saqlanadi. Almashtirsangiz, yangi Zeilab CDN havolasini kiriting."
            : valid
              ? "MP4, HLS (.m3u8), WEBM, MOV yoki M4V to'g'ridan-to'g'ri havolasi."
              : "Faqat cdn.zeilab.uz dagi qo'llab-quvvatlanadigan video fayl havolasini kiriting."}
        </p>
      </div>

      {value && (
        <div className="glass flex items-center gap-2 rounded-lg p-2 text-[11px] text-muted-foreground">
          <Film className="h-3.5 w-3.5 shrink-0 text-neon" />
          <span className="min-w-0 flex-1 truncate">{value}</span>
          <button type="button" onClick={() => onChange("")} className="text-destructive" aria-label="Tozalash">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};