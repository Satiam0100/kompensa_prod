-- Tramos de cuotas por día/semana (contrato variable L–V, última semana distinta, etc.)
ALTER TABLE ordenes_transmision
  ADD COLUMN IF NOT EXISTS tramos_cuotas JSONB;

COMMENT ON COLUMN ordenes_transmision.tramos_cuotas IS
  'Tramos [{desde,hasta,dias_semana[1-7],cuñas_por_dia}]. NULL = legacy (cuñas_diarias todos los días).';
