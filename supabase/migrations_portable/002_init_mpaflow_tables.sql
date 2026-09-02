-- ============================================================================
-- MPaFlow — Migration portátil: tabelas do domínio (Pavimentos, Caminhões, CPs)
-- ============================================================================
-- Execute APÓS o script 001_init_auth.sql.
-- Cria toda a estrutura de dados do MPaFlow no seu próprio banco PostgreSQL.
--
-- Hierarquia:
--   profiles (usuário)
--     └── pavimentos
--           └── trucks (caminhões / cargas)
--                 └── test_specimens (corpos de prova)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.truck_status AS ENUM ('approved', 'rejected', 'above');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.specimen_age AS ENUM ('12h', '7d', '28d');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.risk_level AS ENUM ('low', 'medium', 'high');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.calculist_approval AS ENUM ('approved', 'rejected', 'analyzing');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ----------------------------------------------------------------------------
-- TABELA: pavimentos
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pavimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  responsible TEXT NOT NULL DEFAULT '',
  supplier TEXT NOT NULL DEFAULT '',
  structural_piece TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pavimentos_user_id ON public.pavimentos(user_id);
CREATE INDEX IF NOT EXISTS idx_pavimentos_date    ON public.pavimentos(date);

ALTER TABLE public.pavimentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own pavimentos"   ON public.pavimentos;
DROP POLICY IF EXISTS "Users can insert own pavimentos" ON public.pavimentos;
DROP POLICY IF EXISTS "Users can update own pavimentos" ON public.pavimentos;
DROP POLICY IF EXISTS "Users can delete own pavimentos" ON public.pavimentos;

CREATE POLICY "Users can view own pavimentos"
  ON public.pavimentos FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pavimentos"
  ON public.pavimentos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pavimentos"
  ON public.pavimentos FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pavimentos"
  ON public.pavimentos FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_pavimentos_updated_at ON public.pavimentos;
CREATE TRIGGER update_pavimentos_updated_at
  BEFORE UPDATE ON public.pavimentos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ----------------------------------------------------------------------------
-- TABELA: trucks (caminhões / cargas de concreto)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trucks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pavimento_id UUID NOT NULL REFERENCES public.pavimentos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identificação / horários
  invoice_number            TEXT NOT NULL DEFAULT '',
  arrival_date              DATE,
  arrival_time              TEXT NOT NULL DEFAULT '',
  departure_time_from_plant TEXT NOT NULL DEFAULT '',
  unload_start_time         TEXT NOT NULL DEFAULT '',
  unload_end_time           TEXT NOT NULL DEFAULT '',
  departure_time_from_site  TEXT NOT NULL DEFAULT '',

  -- Dados técnicos
  volume_m3         NUMERIC(10,2) NOT NULL DEFAULT 0,
  expected_mpa      NUMERIC(10,2) NOT NULL DEFAULT 0,
  achieved_mpa      NUMERIC(10,2) NOT NULL DEFAULT 0,
  status            public.truck_status NOT NULL DEFAULT 'approved',
  percent_diff      NUMERIC(10,2) NOT NULL DEFAULT 0,
  supplier          TEXT NOT NULL DEFAULT '',
  slump             NUMERIC(10,2) NOT NULL DEFAULT 0,
  slump_min         NUMERIC(10,2) NOT NULL DEFAULT 0,
  slump_max         NUMERIC(10,2) NOT NULL DEFAULT 0,
  slump_conformity  BOOLEAN NOT NULL DEFAULT true,
  water_added       NUMERIC(10,2) NOT NULL DEFAULT 0,
  observation       TEXT NOT NULL DEFAULT '',
  cost_per_m3       NUMERIC(10,2) NOT NULL DEFAULT 0,

  -- Predições / risco
  mpa_7d            NUMERIC(10,2),
  mpa_28d           NUMERIC(10,2),
  predicted_mpa_28d NUMERIC(10,2),
  prediction_index  NUMERIC(10,4),
  risk_level        public.risk_level,

  -- Aprovação técnica
  calculist_approval public.calculist_approval NOT NULL DEFAULT 'analyzing',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trucks_pavimento_id ON public.trucks(pavimento_id);
CREATE INDEX IF NOT EXISTS idx_trucks_user_id      ON public.trucks(user_id);
CREATE INDEX IF NOT EXISTS idx_trucks_supplier     ON public.trucks(supplier);

ALTER TABLE public.trucks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own trucks"   ON public.trucks;
DROP POLICY IF EXISTS "Users can insert own trucks" ON public.trucks;
DROP POLICY IF EXISTS "Users can update own trucks" ON public.trucks;
DROP POLICY IF EXISTS "Users can delete own trucks" ON public.trucks;

CREATE POLICY "Users can view own trucks"
  ON public.trucks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trucks"
  ON public.trucks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trucks"
  ON public.trucks FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trucks"
  ON public.trucks FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_trucks_updated_at ON public.trucks;
CREATE TRIGGER update_trucks_updated_at
  BEFORE UPDATE ON public.trucks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ----------------------------------------------------------------------------
-- TABELA: test_specimens (corpos de prova)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.test_specimens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id UUID NOT NULL REFERENCES public.trucks(id) ON DELETE CASCADE,
  user_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  age          public.specimen_age NOT NULL,
  mpa_result   NUMERIC(10,2) NOT NULL DEFAULT 0,
  rupture_date DATE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_specimens_truck_id ON public.test_specimens(truck_id);
CREATE INDEX IF NOT EXISTS idx_specimens_user_id  ON public.test_specimens(user_id);

ALTER TABLE public.test_specimens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own specimens"   ON public.test_specimens;
DROP POLICY IF EXISTS "Users can insert own specimens" ON public.test_specimens;
DROP POLICY IF EXISTS "Users can update own specimens" ON public.test_specimens;
DROP POLICY IF EXISTS "Users can delete own specimens" ON public.test_specimens;

CREATE POLICY "Users can view own specimens"
  ON public.test_specimens FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own specimens"
  ON public.test_specimens FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own specimens"
  ON public.test_specimens FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own specimens"
  ON public.test_specimens FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_specimens_updated_at ON public.test_specimens;
CREATE TRIGGER update_specimens_updated_at
  BEFORE UPDATE ON public.test_specimens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- FIM. Estrutura completa do MPaFlow criada.
-- Próximo passo (opcional): migrar dados do localStorage do app para o banco.
-- ============================================================================
