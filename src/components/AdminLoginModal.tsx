import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const AdminLoginModal = ({ open, onOpenChange }: Props) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-login", {
        body: { password },
      });
      if (error || !data?.access_token) {
        toast.error("Noto'g'ri parol");
        return;
      }
      const { error: sErr } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      if (sErr) {
        toast.error("Sessiya xatosi");
        return;
      }
      onOpenChange(false);
      setPassword("");
      navigate("/admin");
    } catch {
      toast.error("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong border-neon/30 max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display neon-text text-center tracking-widest">
            ADMIN
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4 pt-2">
          <Input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Parol"
            className="bg-transparent border-neon/40 focus-visible:ring-neon text-center tracking-widest"
          />
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full h-10 rounded-md bg-neon text-primary-foreground font-display text-sm tracking-widest neon-glow-md disabled:opacity-50 transition-all hover:neon-glow-lg"
          >
            {loading ? "..." : "KIRISH"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
