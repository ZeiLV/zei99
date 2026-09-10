import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/** True only for the site owner (bosh admin) who can grant/remove admin rights. */
export const useIsOwner = () => {
  const { user, loading: authLoading } = useAuth();
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (authLoading) return;
    if (!user) {
      setIsOwner(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "owner")
        .maybeSingle();
      if (!active) return;
      setIsOwner(!!data);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user, authLoading]);

  return { isOwner, loading: loading || authLoading };
};
