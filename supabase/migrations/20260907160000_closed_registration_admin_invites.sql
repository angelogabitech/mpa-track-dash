-- MPaFlow: cadastro fechado e provisionamento de usuarios por administrador
BEGIN;

CREATE TABLE IF NOT EXISTS public.platform_admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.platform_admins FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_admins TO service_role;

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.platform_admins a
    WHERE a.user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_platform_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated;

-- Usada somente pela Edge Function com a credencial de servidor.
CREATE OR REPLACE FUNCTION public.get_user_id_by_email_for_admin(p_email TEXT)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT u.id
  FROM auth.users u
  WHERE lower(u.email) = lower(trim(p_email))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_user_id_by_email_for_admin(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_id_by_email_for_admin(TEXT) TO service_role;

-- Compartilhamento direto pelo navegador deixa de ser permitido.
REVOKE ALL ON FUNCTION public.add_obra_member_by_email(UUID, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.add_obra_member_by_email(UUID, TEXT) TO service_role;

-- Novas contas recebem somente o perfil. A obra sera atribuida pela Edge Function.
-- Isso tambem evita que um cadastro eventualmente criado fora do fluxo ganhe uma obra.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;

COMMIT;
