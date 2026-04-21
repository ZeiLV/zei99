-- Add category, metadata fields to content
ALTER TABLE public.content
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'anime',
  ADD COLUMN IF NOT EXISTS year integer,
  ADD COLUMN IF NOT EXISTS rating numeric(3,1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS duration text,
  ADD COLUMN IF NOT EXISTS is_trending boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

-- Constrain category to known values
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'content_category_check'
  ) THEN
    ALTER TABLE public.content
      ADD CONSTRAINT content_category_check
      CHECK (category IN ('anime','drama','kino','multfilm'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS content_category_idx ON public.content(category);
CREATE INDEX IF NOT EXISTS content_trending_idx ON public.content(is_trending) WHERE is_trending = true;
CREATE INDEX IF NOT EXISTS content_featured_idx ON public.content(is_featured) WHERE is_featured = true;

-- Episodes: add direct video URL + type so admin can pick gdrive vs direct mp4/hls
ALTER TABLE public.episodes
  ADD COLUMN IF NOT EXISTS video_type text NOT NULL DEFAULT 'gdrive',
  ADD COLUMN IF NOT EXISTS video_url text;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'episodes_video_type_check'
  ) THEN
    ALTER TABLE public.episodes
      ADD CONSTRAINT episodes_video_type_check
      CHECK (video_type IN ('gdrive','direct'));
  END IF;
END $$;

-- Atomic view increment function (callable by anyone, only increments)
CREATE OR REPLACE FUNCTION public.increment_views(_content_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.content SET views = views + 1 WHERE id = _content_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_views(uuid) TO anon, authenticated;
