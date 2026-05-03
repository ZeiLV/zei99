import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Notif {
  id: string;
  title: string;
  subtitle: string;
  ts: number;
}

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "content" },
        (payload) => {
          const c: any = payload.new;
          const n: Notif = {
            id: `c-${c.id}`,
            title: "Yangi kontent qo'shildi",
            subtitle: c.title ?? "Yangi anime",
            ts: Date.now(),
          };
          setItems((prev) => [n, ...prev].slice(0, 20));
          setUnread((u) => u + 1);
          toast(n.title, {
            description: n.subtitle,
            className: "glass-strong neon-border",
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "episodes" },
        (payload) => {
          const e: any = payload.new;
          const n: Notif = {
            id: `e-${e.id}`,
            title: "Yangi epizod chiqdi",
            subtitle: `${e.title ?? "Epizod"} (EP ${e.episode_number})`,
            ts: Date.now(),
          };
          setItems((prev) => [n, ...prev].slice(0, 20));
          setUnread((u) => u + 1);
          toast(n.title, {
            description: n.subtitle,
            className: "glass-strong neon-border",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleOpen = () => {
    setOpen((o) => !o);
    setUnread(0);
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="h-10 w-10 rounded-full glass flex items-center justify-center text-neon hover:neon-glow-sm transition-all relative"
        aria-label="Bildirishnomalar"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center"
            style={{
              background: "hsl(var(--neon-pink))",
              color: "hsl(var(--background))",
              boxShadow: "0 0 8px hsl(var(--neon-pink) / 0.7)",
            }}
          >
            {unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-72 glass-strong rounded-2xl p-3 neon-border animate-fade-up">
            <div className="font-display text-xs tracking-widest text-neon mb-2 px-1">
              BILDIRISHNOMALAR
            </div>
            {items.length === 0 ? (
              <div className="text-xs text-muted-foreground p-3 text-center">
                Hozircha bildirishnoma yo'q
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-1.5">
                {items.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-lg glass hover:neon-glow-sm transition-all"
                  >
                    <div className="text-xs font-medium text-foreground">{n.title}</div>
                    <div className="text-[11px] text-foreground/70 truncate mt-0.5">
                      {n.subtitle}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
