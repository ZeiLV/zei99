-- Phase 4: Multi-server & 4K quality
ALTER TABLE public.episodes
  ADD COLUMN IF NOT EXISTS server2_url TEXT,
  ADD COLUMN IF NOT EXISTS quality_4k_url TEXT;

-- Phase 5: Voting system
CREATE TABLE IF NOT EXISTS public.voting_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  poster_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.voting_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view voting projects"
  ON public.voting_projects FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert voting projects"
  ON public.voting_projects FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update voting projects"
  ON public.voting_projects FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete voting projects"
  ON public.voting_projects FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER voting_projects_updated_at
  BEFORE UPDATE ON public.voting_projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.voting_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.voting_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_voting_votes_project ON public.voting_votes(project_id);
CREATE INDEX IF NOT EXISTS idx_voting_votes_user ON public.voting_votes(user_id);

ALTER TABLE public.voting_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view votes"
  ON public.voting_votes FOR SELECT
  USING (true);

CREATE POLICY "VIP users can vote"
  ON public.voting_votes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.is_vip(auth.uid()));

CREATE POLICY "Users can remove own vote"
  ON public.voting_votes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);