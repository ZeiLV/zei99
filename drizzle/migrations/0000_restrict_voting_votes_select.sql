DROP POLICY IF EXISTS "Public can view votes" ON public.voting_votes;

CREATE POLICY "Users can view own votes"
  ON public.voting_votes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all votes"
  ON public.voting_votes
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.is_owner(auth.uid()));

CREATE OR REPLACE FUNCTION public.get_voting_counts()
RETURNS TABLE(project_id uuid, vote_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT project_id, COUNT(*)::bigint AS vote_count
  FROM public.voting_votes
  GROUP BY project_id;
$$;

REVOKE ALL ON FUNCTION public.get_voting_counts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_voting_counts() TO authenticated, service_role;