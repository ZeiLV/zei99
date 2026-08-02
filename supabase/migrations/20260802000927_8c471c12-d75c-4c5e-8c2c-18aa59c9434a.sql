-- ============ SITE SETTINGS ============
CREATE TABLE public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  accent_hsl TEXT NOT NULL DEFAULT '200 95% 60%',
  footer_enabled BOOLEAN NOT NULL DEFAULT true,
  footer_text TEXT NOT NULL DEFAULT E'© 2025 Zei Dubbing. Barcha huquqlar himoyalangan.',
  footer_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view site settings"
  ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Admins can insert site settings"
  ON public.site_settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site settings"
  ON public.site_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_settings (id) VALUES ('main') ON CONFLICT DO NOTHING;

-- ============ REVIEW REPLIES ============
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE;

ALTER TABLE public.reviews ALTER COLUMN rating DROP NOT NULL;

CREATE INDEX IF NOT EXISTS reviews_parent_id_idx ON public.reviews(parent_id);

-- ============ REVIEW LIKES ============
CREATE TABLE public.review_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (review_id, user_id)
);

GRANT SELECT ON public.review_likes TO anon;
GRANT SELECT, INSERT, DELETE ON public.review_likes TO authenticated;
GRANT ALL ON public.review_likes TO service_role;

ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view review likes"
  ON public.review_likes FOR SELECT USING (true);

CREATE POLICY "Users can like"
  ON public.review_likes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own like"
  ON public.review_likes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============ PROFILE BADGE ============
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS badge TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bonus_likes INTEGER NOT NULL DEFAULT 0;