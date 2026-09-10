
CREATE OR REPLACE FUNCTION public.is_owner(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'owner')
$$;

-- make the main hidden admin account and muhemmed097@gmail.com owners
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, 'owner'::app_role FROM public.profiles p
WHERE p.email IN ('zei-admin@zei-dubbing.internal', 'muhemmed097@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'owner'::app_role FROM auth.users u
WHERE u.email IN ('zei-admin@zei-dubbing.internal', 'muhemmed097@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Owner can manage roles" ON public.user_roles
FOR ALL TO authenticated
USING (public.is_owner(auth.uid()))
WITH CHECK (public.is_owner(auth.uid()));

CREATE POLICY "Admins can view roles" ON public.user_roles
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.is_owner(auth.uid()));
