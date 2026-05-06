-- Orden de transmisión Savoy (prueba / cliente nuevo)
-- Fuente: pauta recibida por correo (Cliente Savoy, Cuñas en vivo, 2 cada día lun-vie, Rumbera Maturín 89.5 FM, periodo 27/01 por un mes)
-- Ejecutar en Supabase SQL Editor si se necesita insertar de nuevo o en otro proyecto

INSERT INTO ordenes_transmision (
  cliente,
  campaña,
  emisora,
  cuñas_diarias,
  total_contratadas,
  periodo_inicio,
  periodo_fin,
  estado,
  ciudad
) VALUES (
  'Savoy',
  'Cuñas en vivo',
  'Rumbera Maturín 89.5 FM',
  2,
  46,
  '2026-01-27',
  '2026-02-27',
  'activa',
  'Maturín'
);
