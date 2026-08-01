import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/** Checks the current user's admin role against the server-side user_roles table. */
export const useIsAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (authLoading) return;
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!active) return;
      setIsAdmin(!!data);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user, authLoading]);

  return { isAdmin, loading: loading || authLoading };
};
