-- ============================================================================
-- MPaFlow - RLS mais restritiva para relacionamentos do dominio
-- ============================================================================
-- Execute APOS 001_init_auth.sql e 002_init_mpaflow_tables.sql.
--
-- Objetivo:
--   1. Caminhoes so podem apontar para pavimentos do proprio usuario.
--   2. Corpos de prova so podem apontar para caminhoes do proprio usuario.
--   3. Updates tambem validam o novo estado da linha, nao apenas a linha antiga.
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own trucks"   ON public.trucks;
DROP POLICY IF EXISTS "Users can insert own trucks" ON public.trucks;
DROP POLICY IF EXISTS "Users can update own trucks" ON public.trucks;
DROP POLICY IF EXISTS "Users can delete own trucks" ON public.trucks;

CREATE POLICY "Users can view own trucks"
  ON public.trucks FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trucks"
  ON public.trucks FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.pavimentos p
      WHERE p.id = trucks.pavimento_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own trucks"
  ON public.trucks FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.pavimentos p
      WHERE p.id = trucks.pavimento_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own trucks"
  ON public.trucks FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own specimens"   ON public.test_specimens;
DROP POLICY IF EXISTS "Users can insert own specimens" ON public.test_specimens;
DROP POLICY IF EXISTS "Users can update own specimens" ON public.test_specimens;
DROP POLICY IF EXISTS "Users can delete own specimens" ON public.test_specimens;

CREATE POLICY "Users can view own specimens"
  ON public.test_specimens FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own specimens"
  ON public.test_specimens FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.trucks t
      WHERE t.id = test_specimens.truck_id
        AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own specimens"
  ON public.test_specimens FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.trucks t
      WHERE t.id = test_specimens.truck_id
        AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own specimens"
  ON public.test_specimens FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
