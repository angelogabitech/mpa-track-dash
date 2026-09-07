-- MPaFlow: compartilhamento seguro de obras entre usuarios autenticados
BEGIN;

CREATE TABLE IF NOT EXISTS public.obras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Obra principal',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  legacy_owner_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.obra_members (
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (obra_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_obra_members_user_id ON public.obra_members(user_id);

ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obra_members ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_obras_updated_at ON public.obras;
CREATE TRIGGER update_obras_updated_at
  BEFORE UPDATE ON public.obras
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.pavimentos
  ADD COLUMN IF NOT EXISTS obra_id UUID REFERENCES public.obras(id) ON DELETE CASCADE;

INSERT INTO public.obras (name, created_by, legacy_owner_id)
SELECT
  'Obra - ' || COALESCE(NULLIF(trim(p.display_name), ''), split_part(u.email, '@', 1), 'Principal'),
  u.id,
  u.id
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
ON CONFLICT (legacy_owner_id) DO NOTHING;

INSERT INTO public.obra_members (obra_id, user_id, added_by)
SELECT o.id, o.legacy_owner_id, o.legacy_owner_id
FROM public.obras o
WHERE o.legacy_owner_id IS NOT NULL
ON CONFLICT (obra_id, user_id) DO NOTHING;

UPDATE public.pavimentos p
SET obra_id = o.id
FROM public.obras o
WHERE p.obra_id IS NULL
  AND o.legacy_owner_id = p.user_id;

ALTER TABLE public.pavimentos ALTER COLUMN obra_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pavimentos_obra_id ON public.pavimentos(obra_id);

CREATE OR REPLACE FUNCTION public.is_obra_member(p_obra_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.obra_members m
    WHERE m.obra_id = p_obra_id
      AND m.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.can_access_pavimento(p_pavimento_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.pavimentos p
    JOIN public.obra_members m ON m.obra_id = p.obra_id
    WHERE p.id = p_pavimento_id
      AND m.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.can_access_truck(p_truck_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.trucks t
    JOIN public.pavimentos p ON p.id = t.pavimento_id
    JOIN public.obra_members m ON m.obra_id = p.obra_id
    WHERE t.id = p_truck_id
      AND m.user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_obra_member(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_access_pavimento(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_access_truck(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_obra_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_pavimento(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_truck(UUID) TO authenticated;

DROP POLICY IF EXISTS "Members can view obras" ON public.obras;
DROP POLICY IF EXISTS "Members can create obras" ON public.obras;
DROP POLICY IF EXISTS "Members can update obras" ON public.obras;
DROP POLICY IF EXISTS "Members can delete obras" ON public.obras;

CREATE POLICY "Members can view obras"
  ON public.obras FOR SELECT TO authenticated
  USING (public.is_obra_member(id));
CREATE POLICY "Members can update obras"
  ON public.obras FOR UPDATE TO authenticated
  USING (public.is_obra_member(id))
  WITH CHECK (public.is_obra_member(id));
CREATE POLICY "Members can delete obras"
  ON public.obras FOR DELETE TO authenticated
  USING (public.is_obra_member(id));

DROP POLICY IF EXISTS "Members can view obra memberships" ON public.obra_members;
CREATE POLICY "Members can view obra memberships"
  ON public.obra_members FOR SELECT TO authenticated
  USING (public.is_obra_member(obra_id));

DROP POLICY IF EXISTS "Users can view own pavimentos" ON public.pavimentos;
DROP POLICY IF EXISTS "Users can insert own pavimentos" ON public.pavimentos;
DROP POLICY IF EXISTS "Users can update own pavimentos" ON public.pavimentos;
DROP POLICY IF EXISTS "Users can delete own pavimentos" ON public.pavimentos;
DROP POLICY IF EXISTS "Members can view pavimentos" ON public.pavimentos;
DROP POLICY IF EXISTS "Members can insert pavimentos" ON public.pavimentos;
DROP POLICY IF EXISTS "Members can update pavimentos" ON public.pavimentos;
DROP POLICY IF EXISTS "Members can delete pavimentos" ON public.pavimentos;

CREATE POLICY "Members can view pavimentos"
  ON public.pavimentos FOR SELECT TO authenticated
  USING (public.is_obra_member(obra_id));
CREATE POLICY "Members can insert pavimentos"
  ON public.pavimentos FOR INSERT TO authenticated
  WITH CHECK (public.is_obra_member(obra_id) AND user_id = auth.uid());
CREATE POLICY "Members can update pavimentos"
  ON public.pavimentos FOR UPDATE TO authenticated
  USING (public.is_obra_member(obra_id))
  WITH CHECK (public.is_obra_member(obra_id));
CREATE POLICY "Members can delete pavimentos"
  ON public.pavimentos FOR DELETE TO authenticated
  USING (public.is_obra_member(obra_id));

DROP POLICY IF EXISTS "Users can view own trucks" ON public.trucks;
DROP POLICY IF EXISTS "Users can insert own trucks" ON public.trucks;
DROP POLICY IF EXISTS "Users can update own trucks" ON public.trucks;
DROP POLICY IF EXISTS "Users can delete own trucks" ON public.trucks;
DROP POLICY IF EXISTS "Members can view trucks" ON public.trucks;
DROP POLICY IF EXISTS "Members can insert trucks" ON public.trucks;
DROP POLICY IF EXISTS "Members can update trucks" ON public.trucks;
DROP POLICY IF EXISTS "Members can delete trucks" ON public.trucks;

CREATE POLICY "Members can view trucks"
  ON public.trucks FOR SELECT TO authenticated
  USING (public.can_access_pavimento(pavimento_id));
CREATE POLICY "Members can insert trucks"
  ON public.trucks FOR INSERT TO authenticated
  WITH CHECK (public.can_access_pavimento(pavimento_id) AND user_id = auth.uid());
CREATE POLICY "Members can update trucks"
  ON public.trucks FOR UPDATE TO authenticated
  USING (public.can_access_pavimento(pavimento_id))
  WITH CHECK (public.can_access_pavimento(pavimento_id));
CREATE POLICY "Members can delete trucks"
  ON public.trucks FOR DELETE TO authenticated
  USING (public.can_access_pavimento(pavimento_id));

DROP POLICY IF EXISTS "Users can view own specimens" ON public.test_specimens;
DROP POLICY IF EXISTS "Users can insert own specimens" ON public.test_specimens;
DROP POLICY IF EXISTS "Users can update own specimens" ON public.test_specimens;
DROP POLICY IF EXISTS "Users can delete own specimens" ON public.test_specimens;
DROP POLICY IF EXISTS "Members can view specimens" ON public.test_specimens;
DROP POLICY IF EXISTS "Members can insert specimens" ON public.test_specimens;
DROP POLICY IF EXISTS "Members can update specimens" ON public.test_specimens;
DROP POLICY IF EXISTS "Members can delete specimens" ON public.test_specimens;

CREATE POLICY "Members can view specimens"
  ON public.test_specimens FOR SELECT TO authenticated
  USING (public.can_access_truck(truck_id));
CREATE POLICY "Members can insert specimens"
  ON public.test_specimens FOR INSERT TO authenticated
  WITH CHECK (public.can_access_truck(truck_id) AND user_id = auth.uid());
CREATE POLICY "Members can update specimens"
  ON public.test_specimens FOR UPDATE TO authenticated
  USING (public.can_access_truck(truck_id))
  WITH CHECK (public.can_access_truck(truck_id));
CREATE POLICY "Members can delete specimens"
  ON public.test_specimens FOR DELETE TO authenticated
  USING (public.can_access_truck(truck_id));

CREATE OR REPLACE FUNCTION public.add_obra_member_by_email(p_obra_id UUID, p_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_obra_member(p_obra_id) THEN
    RAISE EXCEPTION 'Acesso negado para compartilhar esta obra' USING ERRCODE = '42501';
  END IF;

  SELECT u.id INTO target_user_id
  FROM auth.users u
  WHERE lower(u.email) = lower(trim(p_email))
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario nao encontrado. Ele precisa criar uma conta primeiro.' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.obra_members (obra_id, user_id, added_by)
  VALUES (p_obra_id, target_user_id, auth.uid())
  ON CONFLICT (obra_id, user_id) DO NOTHING;

  RETURN target_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.add_obra_member_by_email(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_obra_member_by_email(UUID, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_obra_id UUID;
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.obras (name, created_by, legacy_owner_id)
  VALUES (
    'Obra - ' || COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1), 'Principal'),
    NEW.id,
    NEW.id
  )
  ON CONFLICT (legacy_owner_id)
  DO UPDATE SET updated_at = EXCLUDED.updated_at
  RETURNING id INTO new_obra_id;

  INSERT INTO public.obra_members (obra_id, user_id, added_by)
  VALUES (new_obra_id, NEW.id, NEW.id)
  ON CONFLICT (obra_id, user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON public.obras, public.obra_members FROM anon;
REVOKE ALL ON public.pavimentos, public.trucks, public.test_specimens FROM anon;
GRANT SELECT, UPDATE, DELETE ON public.obras TO authenticated;
GRANT SELECT ON public.obra_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pavimentos, public.trucks, public.test_specimens TO authenticated;

COMMIT;
