-- Backfill: órdenes sin tramos → un tramo L–V con cuñas_diarias del contrato.
-- Ejecutar una vez en Supabase SQL Editor después de desplegar el panel con tramos por defecto.

UPDATE ordenes_transmision
SET tramos_cuotas = jsonb_build_array(
  jsonb_build_object(
    'desde', periodo_inicio::text,
    'hasta', periodo_fin::text,
    'dias_semana', jsonb_build_array(1, 2, 3, 4, 5),
    'cuñas_por_dia', "cuñas_diarias"
  )
)
WHERE tramos_cuotas IS NULL
   OR tramos_cuotas = 'null'::jsonb
   OR jsonb_array_length(tramos_cuotas) = 0;

COMMENT ON COLUMN ordenes_transmision.tramos_cuotas IS
  'Tramos [{desde,hasta,dias_semana[1-7],cuñas_por_dia}]. Obligatorio en panel; L–V por defecto al crear.';
