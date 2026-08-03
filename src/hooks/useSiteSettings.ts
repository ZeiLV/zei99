import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FooterLink {
  label: string;
  url: string;
}

export type SocialPlatform = "telegram" | "instagram" | "youtube" | "tiktok" | "website";

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  label: string;
}

export interface SiteSettings {
  accent_hsl: string;
  footer_enabled: boolean;
  footer_text: string;
  footer_links: FooterLink[];
  social_links: SocialLink[];
}

export const DEFAULT_SOCIALS: SocialLink[] = [
  { platform: "telegram", url: "https://t.me/ZeiDubbing", label: "Telegram" },
  { platform: "instagram", url: "https://www.instagram.com/zei_dubbing", label: "Instagram" },
];

export const DEFAULT_SETTINGS: SiteSettings = {
  accent_hsl: "200 95% 60%",
  footer_enabled: true,
  footer_text: "2026 ZEI. Barcha huquqlar himoyalangan",
  footer_links: [],
  social_links: DEFAULT_SOCIALS,
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
      .select("accent_hsl, footer_enabled, footer_text, footer_links, social_links")
      .eq("id", "main")
      .maybeSingle();
    if (data) {
      const raw = data as unknown as {
        accent_hsl: string;
        footer_enabled: boolean;
        footer_text: string;
        footer_links: unknown;
        social_links: unknown;
      };
      const next: SiteSettings = {
        accent_hsl: raw.accent_hsl,
        footer_enabled: raw.footer_enabled,
        footer_text: raw.footer_text,
        footer_links: Array.isArray(raw.footer_links) ? (raw.footer_links as FooterLink[]) : [],
        social_links: Array.isArray(raw.social_links)
          ? (raw.social_links as SocialLink[])
          : DEFAULT_SOCIALS,
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
