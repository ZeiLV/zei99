ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS social_links jsonb NOT NULL DEFAULT '[{"platform":"telegram","url":"https://t.me/Zei_Dubbing","label":"Telegram"},{"platform":"instagram","url":"https://www.instagram.com/zei_dubbing","label":"Instagram"}]'::jsonb;

UPDATE public.site_settings SET footer_text = E'2026 ZEI. Barcha huquqlar himoyalangan' WHERE id = 'main';