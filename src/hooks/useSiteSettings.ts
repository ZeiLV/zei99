import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FooterLink {
  label: string;
  url: string;
}

export interface SiteSettings {
  accent_hsl: string;
  footer_enabled: boolean;
  footer_text: string;
  footer_links: FooterLink[];
}

export const DEFAULT_SETTINGS: SiteSettings = {
  accent_hsl: "200 95% 60%",
  footer_enabled: true,
  footer_text: "© 2025 Zei Dubbing. Barcha huquqlar himoyalangan.",
  footer_links: [],
};

/** Applies the accent colour to the CSS variables used across the design system. */
export const applyAccent = (hsl: string) => {
  const root = document.documentElement;
  root.style.setProperty("--neon", hsl);
  root.style.setProperty("--primary", hsl);
  root.style.setProperty("--accent", hsl);
  root.style.setProperty("--ring", hsl);
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("accent_hsl, footer_enabled, footer_text, footer_links")
      .eq("id", "main")
      .maybeSingle();
    if (data) {
      const next: SiteSettings = {
        accent_hsl: data.accent_hsl,
        footer_enabled: data.footer_enabled,
        footer_text: data.footer_text,
        footer_links: Array.isArray(data.footer_links)
          ? (data.footer_links as unknown as FooterLink[])
          : [],
      };
      setSettings(next);
      applyAccent(next.accent_hsl);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return { settings, loading, reload: load };
};
