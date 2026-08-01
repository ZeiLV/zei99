import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, Category } from "@/lib/types";

/**
 * Returns only the categories that actually have content in the database,
 * so navigation never shows an empty section.
 */
export const useAvailableCategories = () => {
  const [categories, setCategories] = useState<typeof CATEGORIES>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.from("content").select("category");
      if (!active) return;
      const present = new Set((data ?? []).map((r) => r.category as Category));
      setCategories(CATEGORIES.filter((c) => present.has(c.value)));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  return { categories, loading };
};
