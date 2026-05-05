import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { VipBadge } from "./VipBadge";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
    public_id: string;
    vip_until: string | null;
  } | null;
}

export const Reviews = ({ contentId }: { contentId: string }) => {
  const { user, profile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: revs } = await supabase
      .from("reviews")
      .select("*")
      .eq("content_id", contentId)
      .order("created_at", { ascending: false });

    const list = (revs ?? []) as Review[];
    if (list.length > 0) {
      const ids = Array.from(new Set(list.map((r) => r.user_id)));
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, public_id, vip_until")
        .in("user_id", ids);
      const map = new Map((profs ?? []).map((p: any) => [p.user_id, p]));
      list.forEach((r) => (r.profile = map.get(r.user_id) ?? null));
    }
    setReviews(list);
    const own = list.find((r) => r.user_id === user?.id);
    if (own) {
      setRating(own.rating);
      setComment(own.comment ?? "");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [contentId, user?.id]);

  const submit = async () => {
    if (!user) {
      toast.error("Avval tizimga kiring");
      return;
    }
    if (rating < 1) {
      toast.error("Yulduzcha bering (1-10)");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("reviews").upsert(
      {
        content_id: contentId,
        user_id: user.id,
        rating,
        comment: comment.trim() || null,
      },
      { onConflict: "content_id,user_id" }
    );
    setSubmitting(false);
    if (error) {
      toast.error("Xatolik: " + error.message);
      return;
    }
    toast.success("Fikringiz saqlandi");
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("O'chirildi");
    setRating(0);
    setComment("");
    load();
  };

  const avg =
    reviews.length > 0
      ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <section className="mt-12 sm:mt-16 pb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-lg tracking-widest text-foreground/90">
          FIKRLAR {reviews.length > 0 && <span className="text-neon">({reviews.length})</span>}
        </h2>
        {avg && (
          <div className="flex items-center gap-1.5 text-sm">
            <Star className="h-4 w-4 fill-neon text-neon" />
            <span className="font-display text-neon">{avg}</span>
            <span className="text-foreground/50">/10</span>
          </div>
        )}
      </div>

      {/* Form */}
      {user ? (
        <div className="glass-strong rounded-2xl p-5 mb-6 border border-neon/20">
          <div className="text-xs font-display tracking-widest text-foreground/70 mb-3">
            SIZNING BAHONGIZ
          </div>
          <div className="flex items-center gap-1 mb-4 flex-wrap">
            {Array.from({ length: 10 }).map((_, i) => {
              const v = i + 1;
              const active = (hover || rating) >= v;
              return (
                <button
                  key={v}
                  onMouseEnter={() => setHover(v)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(v)}
                  className="p-1 transition-all hover:scale-110"
                  aria-label={`${v} yulduz`}
                >
                  <Star
                    className={`h-5 w-5 sm:h-6 sm:w-6 transition-all ${
                      active ? "fill-neon text-neon drop-shadow-[0_0_6px_hsl(var(--neon)/0.7)]" : "text-foreground/30"
                    }`}
                  />
                </button>
              );
            })}
            {rating > 0 && (
              <span className="ml-2 font-display text-neon text-sm">{rating}/10</span>
            )}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 500))}
            placeholder="Fikringizni yozing (ixtiyoriy)..."
            rows={3}
            className="w-full bg-background/40 rounded-lg p-3 text-sm outline-none border border-neon/15 focus:border-neon/50 transition-colors resize-none"
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-[10px] text-foreground/40">{comment.length}/500</span>
            <button
              onClick={submit}
              disabled={submitting}
              className="px-5 py-2 rounded-full font-display text-xs tracking-widest text-neon border border-neon/40 bg-neon/10 hover:bg-neon/20 hover:neon-glow-sm transition-all disabled:opacity-50"
            >
              {submitting ? "SAQLANMOQDA..." : "YUBORISH"}
            </button>
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl p-5 mb-6 text-center text-sm text-foreground/70">
          Fikr qoldirish uchun Google orqali tizimga kiring.
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-sm text-muted-foreground">Yuklanmoqda...</div>
      ) : reviews.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-8">
          Hali fikrlar yo'q. Birinchi bo'ling!
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="glass rounded-xl p-4 border border-neon/10">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-full bg-neon/15 flex items-center justify-center text-neon font-display text-xs shrink-0">
                  {r.profile?.avatar_url ? (
                    <img src={r.profile.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    (r.profile?.display_name ?? "U").charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium truncate">
                      {r.profile?.display_name ?? "Foydalanuvchi"}
                    </span>
                    {r.profile?.vip_until && new Date(r.profile.vip_until) > new Date() && (
                      <VipBadge size="sm" />
                    )}
                    <span className="flex items-center gap-1 text-xs text-neon">
                      <Star className="h-3 w-3 fill-neon" />
                      {r.rating}/10
                    </span>
                    <span className="text-[10px] text-foreground/40 ml-auto">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {r.comment && (
                    <p className="text-sm text-foreground/80 mt-1.5 leading-relaxed whitespace-pre-wrap">
                      {r.comment}
                    </p>
                  )}
                </div>
                {user?.id === r.user_id && (
                  <button
                    onClick={() => remove(r.id)}
                    className="text-foreground/40 hover:text-destructive transition-colors p-1"
                    aria-label="O'chirish"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
