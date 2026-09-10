import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ShieldCheck, UserPlus, Trash2, BadgeCheck, Crown, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsOwner } from "@/hooks/useIsOwner";

interface AdminRow {
  user_id: string;
  display_name: string | null;
  email: string | null;
  public_id: string;
  badge: string | null;
  is_owner?: boolean;
}

const AdminAdmins = () => {
  const { user } = useAuth();
  const { isOwner, loading: ownerLoading } = useIsOwner();
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [query, setQuery] = useState("");
  const [badgeQuery, setBadgeQuery] = useState("");
  const [badgeValue, setBadgeValue] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .in("role", ["admin", "owner"]);
    const list = roles ?? [];
    const ids = Array.from(new Set(list.map((r) => r.user_id)));
    if (!ids.length) {
      setRows([]);
      return;
    }
    const owners = new Set(list.filter((r) => r.role === "owner").map((r) => r.user_id));
    const { data: profs } = await supabase
      .from("profiles")
      .select("user_id, display_name, email, public_id, badge")
      .in("user_id", ids);
    setRows(
      ((profs ?? []) as AdminRow[]).map((p) => ({ ...p, is_owner: owners.has(p.user_id) }))
    );
  };

  useEffect(() => {
    load();
  }, []);

  const findProfile = async (q: string) => {
    const term = q.trim();
    if (!term) return null;
    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name, email, public_id, badge")
      .or(`public_id.eq.${term.toUpperCase()},email.eq.${term.toLowerCase()}`)
      .maybeSingle();
    return (data as AdminRow) ?? null;
  };

  const addAdmin = async () => {
    setBusy(true);
    const prof = await findProfile(query);
    if (!prof) {
      setBusy(false);
      toast.error("Foydalanuvchi topilmadi");
      return;
    }
    const { error } = await supabase.from("user_roles").insert({ user_id: prof.user_id, role: "admin" });
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success(`${prof.display_name || prof.public_id} admin qilindi`);
      setQuery("");
      load();
    }
  };

  const removeAdmin = async (row: AdminRow) => {
    if (row.user_id === user?.id) {
      toast.error("O'zingizni adminlikdan olib tashlay olmaysiz");
      return;
    }
    if (row.is_owner) {
      toast.error("Bosh adminni olib tashlab bo'lmaydi");
      return;
    }
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", row.user_id)
      .eq("role", "admin");
    if (error) toast.error(error.message);
    else {
      toast.success("Adminlik olib tashlandi");
      load();
    }
  };

  const setBadge = async () => {
    setBusy(true);
    const prof = await findProfile(badgeQuery);
    if (!prof) {
      setBusy(false);
      toast.error("Foydalanuvchi topilmadi");
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ badge: badgeValue.trim() || null })
      .eq("user_id", prof.user_id);
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Nishon yangilandi");
      setBadgeQuery("");
      setBadgeValue("");
      load();
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl tracking-widest text-neon">ADMINLAR</h1>
        <p className="text-xs text-muted-foreground mt-1">Admin qo'shish, olib tashlash va nishonlar</p>
      </div>

      {ownerLoading ? null : isOwner ? (
        <section className="glass rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-neon" />
            <h2 className="font-display text-xs tracking-widest text-foreground/80">ADMIN QO'SHISH</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ID (masalan A7K2M9QX) yoki email"
              className="flex-1"
            />
            <Button
              onClick={addAdmin}
              disabled={busy || !query.trim()}
              className="bg-neon text-primary-foreground hover:bg-neon/90"
            >
              Qo'shish
            </Button>
          </div>
        </section>
      ) : (
        <section className="glass rounded-xl p-4 sm:p-5 flex items-center gap-3">
          <Lock className="h-4 w-4 text-amber-400 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Admin qo'shish yoki olib tashlash faqat bosh admin (owner) uchun mavjud.
          </p>
        </section>
      )}

      <section className="glass rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2">
          <BadgeCheck className="h-4 w-4 text-amber-400" />
          <h2 className="font-display text-xs tracking-widest text-foreground/80">MAXSUS NISHON</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={badgeQuery}
            onChange={(e) => setBadgeQuery(e.target.value)}
            placeholder="ID yoki email"
            className="flex-1"
          />
          <Input
            value={badgeValue}
            onChange={(e) => setBadgeValue(e.target.value)}
            placeholder="Nishon matni (masalan Z E I)"
            className="sm:max-w-[200px]"
          />
          <Button variant="secondary" onClick={setBadge} disabled={busy || !badgeQuery.trim()}>
            Saqlash
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Nishonni o'chirish uchun matnni bo'sh qoldiring.
        </p>
      </section>

      <section className="glass rounded-xl p-4 sm:p-5 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="h-4 w-4 text-neon" />
          <h2 className="font-display text-xs tracking-widest text-foreground/80">
            JORIY ADMINLAR ({rows.length})
          </h2>
        </div>
        {rows.map((r) => (
          <div
            key={r.user_id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-foreground/[0.03]"
          >
            <div className="min-w-0 flex-1">
              <div className="text-sm text-foreground/90 truncate flex items-center gap-2">
                {r.display_name || r.public_id}
                {r.is_owner && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-display tracking-widest bg-amber-400/15 text-amber-400 border border-amber-400/40 flex items-center gap-1">
                    <Crown className="h-2.5 w-2.5" /> BOSH ADMIN
                  </span>
                )}
                {r.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-display tracking-widest bg-amber-400/15 text-amber-400 border border-amber-400/40">
                    {r.badge}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-muted-foreground truncate">
                {r.email} · {r.public_id}
              </div>
            </div>
            {isOwner && !r.is_owner && (
              <Button
                size="icon"
                variant="ghost"
                className="text-destructive shrink-0"
                onClick={() => removeAdmin(r)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </section>
    </div>
  );
};

export default AdminAdmins;
