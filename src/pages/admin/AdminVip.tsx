import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Crown, Search, Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProfileRow {
  id: string;
  user_id: string;
  public_id: string;
  email: string | null;
  display_name: string | null;
  vip_until: string | null;
  created_at: string;
}

const AdminVip = () => {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [grantId, setGrantId] = useState("");
  const [grantDays, setGrantDays] = useState("30");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setProfiles((data as ProfileRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const grantVip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const days = parseInt(grantDays, 10);
    if (!grantId.trim() || isNaN(days) || days < 1) {
      toast.error("ID va kun sonini to'g'ri kiriting");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.rpc("grant_vip_days", {
      _public_id: grantId.trim().toUpperCase(),
      _days: days,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`VIP berildi! Tugashi: ${new Date(data as string).toLocaleDateString()}`);
    setGrantId("");
    load();
  };

  const revokeVip = async (publicId: string) => {
    if (!confirm(`${publicId} VIP olib tashlansinmi?`)) return;
    const { error } = await supabase.rpc("revoke_vip", { _public_id: publicId });
    if (error) return toast.error(error.message);
    toast.success("VIP olib tashlandi");
    load();
  };

  const filtered = profiles.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.public_id.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.display_name?.toLowerCase().includes(q)
    );
  });

  const isActiveVip = (until: string | null) => !!(until && new Date(until) > new Date());
  const daysLeft = (until: string | null) => {
    if (!until) return 0;
    return Math.max(0, Math.ceil((new Date(until).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl tracking-widest multineon-text">VIP BOSHQARUV</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Foydalanuvchi ID si orqali VIP maqomi va muddatini bering
        </p>
      </div>

      {/* Grant form */}
      <form onSubmit={grantVip} className="glass rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex-1">
          <label className="block text-[10px] font-display tracking-widest text-muted-foreground mb-1.5">
            FOYDALANUVCHI ID
          </label>
          <Input
            value={grantId}
            onChange={(e) => setGrantId(e.target.value.toUpperCase())}
            placeholder="A3F9K2L1"
            maxLength={8}
            className="font-mono tracking-widest uppercase"
          />
        </div>
        <div className="w-full sm:w-32">
          <label className="block text-[10px] font-display tracking-widest text-muted-foreground mb-1.5">
            KUN
          </label>
          <Input
            type="number"
            min={1}
            value={grantDays}
            onChange={(e) => setGrantDays(e.target.value)}
            placeholder="30"
          />
        </div>
        <Button type="submit" disabled={busy} className="bg-amber-500 text-[#0A0F1E] hover:bg-amber-400 gap-1">
          <Crown className="h-4 w-4" />
          VIP berish
        </Button>
      </form>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ID, email yoki ism bo'yicha qidirish..."
          className="pl-10"
        />
      </div>

      {/* Users list */}
      <div className="glass rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Yuklanmoqda...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Foydalanuvchi topilmadi</div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((p) => {
              const active = isActiveVip(p.vip_until);
              const left = daysLeft(p.vip_until);
              return (
                <div key={p.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm tracking-wider text-white">{p.public_id}</span>
                      {active && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-display tracking-widest bg-amber-400/15 text-amber-400 border border-amber-400/30">
                          <Crown className="h-2.5 w-2.5" /> VIP · {left}k
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">
                      {p.display_name || "—"} · {p.email || "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setGrantId(p.public_id);
                        document.querySelector<HTMLInputElement>('input[type="number"]')?.focus();
                      }}
                      className="px-3 py-1.5 rounded-md text-xs font-display tracking-widest bg-white/5 hover:bg-white/10 text-white/80 transition-colors flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> KUN
                    </button>
                    {active && (
                      <button
                        onClick={() => revokeVip(p.public_id)}
                        className="p-1.5 rounded-md text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label="VIP olib tashlash"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVip;
