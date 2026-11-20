import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { readSavedTitles, savedTitlesKey, toggleSavedTitle } from "@/lib/savedTitles";
import { toast } from "sonner";

const SavedTitlesContext = createContext<{ ids: string[]; toggle: (id: string) => void } | null>(null);

export const SavedTitlesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const key = user ? savedTitlesKey(user.id) : null;
  const [state, setState] = useState<{ key: string | null; ids: string[] }>({ key: null, ids: [] });
  useEffect(() => {
    const refresh = () => {
      let ids: string[] = [];
      try { ids = key ? readSavedTitles(localStorage.getItem(key)) : []; } catch { /* storage unavailable */ }
      setState({ key, ids });
    };
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, [key]);
  const ids = state.key === key ? state.ids : [];
  const toggle = (id: string) => {
    if (!key) return;
    const next = toggleSavedTitle(ids, id);
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setState({ key, ids: next });
      toast.success(next.includes(id) ? "Shu qurilmadagi saqlanganlarga qo‘shildi" : "Saqlanganlardan olib tashlandi");
    } catch { toast.error("Bu qurilmada saqlab bo‘lmadi"); }
  };
  return <SavedTitlesContext.Provider value={{ ids, toggle }}>{children}</SavedTitlesContext.Provider>;
};

export const useSavedTitles = () => {
  const context = useContext(SavedTitlesContext);
  if (!context) throw new Error("SavedTitlesProvider is required");
  return context;
};