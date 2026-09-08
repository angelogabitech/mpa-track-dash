-- MPaFlow: limites defensivos para campos textuais
-- NOT VALID aplica os limites a novos INSERTs/UPDATEs sem bloquear a migration
-- caso existam registros legados acima do tamanho permitido.
BEGIN;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_display_name_length;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_display_name_length
  CHECK (display_name IS NULL OR char_length(display_name) <= 120) NOT VALID;

ALTER TABLE public.obras
  DROP CONSTRAINT IF EXISTS obras_name_length;
ALTER TABLE public.obras
  ADD CONSTRAINT obras_name_length
  CHECK (char_length(name) BETWEEN 1 AND 120) NOT VALID;

ALTER TABLE public.pavimentos
  DROP CONSTRAINT IF EXISTS pavimentos_text_lengths;
ALTER TABLE public.pavimentos
  ADD CONSTRAINT pavimentos_text_lengths
  CHECK (
    char_length(name) BETWEEN 1 AND 120
    AND char_length(responsible) BETWEEN 1 AND 120
    AND char_length(supplier) BETWEEN 1 AND 120
    AND char_length(structural_piece) <= 120
  ) NOT VALID;

ALTER TABLE public.trucks
  DROP CONSTRAINT IF EXISTS trucks_text_lengths;
ALTER TABLE public.trucks
  ADD CONSTRAINT trucks_text_lengths
  CHECK (
    char_length(invoice_number) BETWEEN 1 AND 60
    AND char_length(supplier) BETWEEN 1 AND 120
    AND char_length(observation) <= 1000
  ) NOT VALID;

COMMIT;

