-- Generate short 8-char public ID
CREATE OR REPLACE FUNCTION public.generate_public_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  public_id TEXT NOT NULL UNIQUE DEFAULT public.generate_public_id(),
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  vip_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Users can update their own non-VIP fields
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can update any profile (incl. vip_until)
CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Prevent regular users from changing vip_until via trigger
CREATE OR REPLACE FUNCTION public.protect_vip_field()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.vip_until IS DISTINCT FROM OLD.vip_until
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can modify VIP status';
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_protect_vip
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_vip_field();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_pid TEXT;
  attempts INT := 0;
BEGIN
  LOOP
    new_pid := public.generate_public_id();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE public_id = new_pid);
    attempts := attempts + 1;
    IF attempts > 10 THEN EXIT; END IF;
  END LOOP;

  INSERT INTO public.profiles (user_id, public_id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    new_pid,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Check if a user is currently VIP
CREATE OR REPLACE FUNCTION public.is_vip(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id
      AND vip_until IS NOT NULL
      AND vip_until > now()
  );
$$;

-- Admin: grant VIP days by public_id
CREATE OR REPLACE FUNCTION public.grant_vip_days(_public_id TEXT, _days INT)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_until TIMESTAMPTZ;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can grant VIP';
  END IF;

  UPDATE public.profiles
  SET vip_until = GREATEST(COALESCE(vip_until, now()), now()) + make_interval(days => _days)
  WHERE public_id = upper(_public_id)
  RETURNING vip_until INTO new_until;

  IF new_until IS NULL THEN
    RAISE EXCEPTION 'User with public_id % not found', _public_id;
  END IF;

  RETURN new_until;
END;
$$;

-- Admin: revoke VIP
CREATE OR REPLACE FUNCTION public.revoke_vip(_public_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can revoke VIP';
  END IF;

  UPDATE public.profiles
  SET vip_until = NULL
  WHERE public_id = upper(_public_id);
END;
$$;