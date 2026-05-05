ALTER TABLE public.episodes
ADD COLUMN IF NOT EXISTS early_access_until TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_episodes_early_access ON public.episodes(early_access_until) WHERE early_access_until IS NOT NULL;