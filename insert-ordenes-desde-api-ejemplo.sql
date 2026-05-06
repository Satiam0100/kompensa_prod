-- Órdenes de prueba derivadas de la respuesta del API (cliente RBB, meta period 2026-04-07 a 2026-04-20, 959 registros).
-- Una fila por campaña en cada emisora: clave = (emisora, spot_id) — un mismo spot puede existir en varias emisoras = varias filas.
-- campaña = spot_name | cuñas_diarias: 8 | estado: activa | opcionales: NULL
-- periodo: desde febrero hasta “hoy” (2026-04-24); total_contratadas = 8 * días calendario inclusivos
--   2026-02-01 .. 2026-04-24 = 83 días → 83 * 8 = 664
--
-- Si ya insertaste filas con 144/abr-mediados, ajusta en Supabase, p. ej.:
--   UPDATE ordenes_transmision SET periodo_inicio = '2026-02-01', periodo_fin = '2026-04-24', total_contratadas = 664 WHERE estado = 'activa';
-- (Ajusta el WHERE a tu criterio.)
--
-- Regenerar desde JSON del API: node build-ordenes-from-api.mjs < respuesta.json

INSERT INTO ordenes_transmision (
  id,
  cliente,
  campaña,
  spot_id,
  spot_name,
  emisora,
  cuñas_diarias,
  total_contratadas,
  periodo_inicio,
  periodo_fin,
  estado,
  email_cliente,
  agencia,
  duracion_seg,
  horario,
  ciudad,
  created_at,
  updated_at
) VALUES
  (gen_random_uuid(), 'RBB', 'Banco de Venezuela | BDV | Tarjeta Internacional', 'ba9a65960cfc4b6ff8cfc19b6721fc6a', 'Banco de Venezuela | BDV | Tarjeta Internacional', 'Explendida 91.9 FM', 8, 664, '2026-02-01', '2026-04-24', 'activa', NULL, NULL, NULL, NULL, 'Puerto La Cruz', NOW(), NOW()),
  (gen_random_uuid(), 'RBB', 'BNC | BNC | envio de dinero desde EEUU', 'c7e352a15afe5858ab24caeddfc70ab6', 'BNC | BNC | envio de dinero desde EEUU', 'Explendida 91.9 FM', 8, 664, '2026-02-01', '2026-04-24', 'activa', NULL, NULL, NULL, NULL, 'Puerto La Cruz', NOW(), NOW()),
  (gen_random_uuid(), 'RBB', 'Nestlé Multicategoría', 'ac7faec73ac3fe11a5af6733573ede5a', 'Nestlé Multicategoría', 'Explendida 91.9 FM', 8, 664, '2026-02-01', '2026-04-24', 'activa', NULL, NULL, NULL, NULL, 'Puerto La Cruz', NOW(), NOW()),
  (gen_random_uuid(), 'RBB', 'Galletas Caledonia | María Caledonia | María Momentos Spot #3', '81502e2fd5030017672179fb0638adb0', 'Galletas Caledonia | María Caledonia | María Momentos Spot #3', 'Radiorama Stereo', 8, 664, '2026-02-01', '2026-04-24', 'activa', NULL, NULL, NULL, NULL, 'Caracas', NOW(), NOW()),
  (gen_random_uuid(), 'RBB', 'Galletas Caledonia | María Caledonia | María Momentos Spots #2', 'b1fba19d0020d0ce0ed66521de31fe89', 'Galletas Caledonia | María Caledonia | María Momentos Spots #2', 'Radiorama Stereo', 8, 664, '2026-02-01', '2026-04-24', 'activa', NULL, NULL, NULL, NULL, 'Caracas', NOW(), NOW()),
  (gen_random_uuid(), 'RBB', 'Galletas Caledonia | María Caledonia | María Momentos', 'd4866d21dcd0cd56249954c0d62d348c', 'Galletas Caledonia | María Caledonia | María Momentos', 'Radiorama Stereo', 8, 664, '2026-02-01', '2026-04-24', 'activa', NULL, NULL, NULL, NULL, 'Caracas', NOW(), NOW()),
  (gen_random_uuid(), 'RBB', 'Mango Bajito | Tiendas Mango Bajito | Eso es un mango bajito', 'c7a2bcc027ef3a62b71e2102eade93c4', 'Mango Bajito | Tiendas Mango Bajito | Eso es un mango bajito', 'Radiorama Stereo', 8, 664, '2026-02-01', '2026-04-24', 'activa', NULL, NULL, NULL, NULL, 'Caracas', NOW(), NOW()),
  (gen_random_uuid(), 'RBB', 'Previparking | Previparking | Torre La Previsora', '8dba25b073218bfb5c76fbdacab1a74a', 'Previparking | Previparking | Torre La Previsora', 'Radiorama Stereo', 8, 664, '2026-02-01', '2026-04-24', 'activa', NULL, NULL, NULL, NULL, 'Caracas', NOW(), NOW()),
  (gen_random_uuid(), 'RBB', 'Previparking | Previparking | Torre La Previsora Spot #2', 'c7867b858142d2e9c1f126ded3bdf77d', 'Previparking | Previparking | Torre La Previsora Spot #2', 'Radiorama Stereo', 8, 664, '2026-02-01', '2026-04-24', 'activa', NULL, NULL, NULL, NULL, 'Caracas', NOW(), NOW()),
  (gen_random_uuid(), 'RBB', 'Previparking | Previparking | Torre La Previsora Spot #3', 'abc2d3fa150f125e82dc92ecfa2fb181', 'Previparking | Previparking | Torre La Previsora Spot #3', 'Radiorama Stereo', 8, 664, '2026-02-01', '2026-04-24', 'activa', NULL, NULL, NULL, NULL, 'Caracas', NOW(), NOW()),
  (gen_random_uuid(), 'RBB', 'PUIG | Galletas PUIG | María PUIG', '07456d4deb39800f10dc06013de5fef6', 'PUIG | Galletas PUIG | María PUIG', 'Radiorama Stereo', 8, 664, '2026-02-01', '2026-04-24', 'activa', NULL, NULL, NULL, NULL, 'Caracas', NOW(), NOW()),
  (gen_random_uuid(), 'RBB', 'Ron Santa Teresa | Ron Santa Teresa | Saca El Pecho Fest', '85071919c9d3a7dd7789bee39dca1700', 'Ron Santa Teresa | Ron Santa Teresa | Saca El Pecho Fest', 'Radiorama Stereo', 8, 664, '2026-02-01', '2026-04-24', 'activa', NULL, NULL, NULL, NULL, 'Caracas', NOW(), NOW()),
  (gen_random_uuid(), 'RBB', 'Tiendas Charbys | Tiendas Charbys | El Rey del Morral Contigo Spot #2', '573f757ce20bbdbe2e71248831907ed5', 'Tiendas Charbys | Tiendas Charbys | El Rey del Morral Contigo Spot #2', 'Radiorama Stereo', 8, 664, '2026-02-01', '2026-04-24', 'activa', NULL, NULL, NULL, NULL, 'Caracas', NOW(), NOW()),
  (gen_random_uuid(), 'RBB', 'Tiendas Charbys | Tiendas Charbys | El Rey del Morral Contigo', 'a8cee853eb097c0dd01790117b327476', 'Tiendas Charbys | Tiendas Charbys | El Rey del Morral Contigo', 'Radiorama Stereo', 8, 664, '2026-02-01', '2026-04-24', 'activa', NULL, NULL, NULL, NULL, 'Caracas', NOW(), NOW()),
  (gen_random_uuid(), 'RBB', 'VIP Phone | VIP Phone | VIP Phone', 'cc68f2720793ef88fe3a579a7b025d16', 'VIP Phone | VIP Phone | VIP Phone', 'Radiorama Stereo', 8, 664, '2026-02-01', '2026-04-24', 'activa', NULL, NULL, NULL, NULL, 'Caracas', NOW(), NOW()),
  (gen_random_uuid(), 'RBB', 'Yango | Yango | Yango App', '2f2d87406008a0b1b5e3766c9b0d2297', 'Yango | Yango | Yango App', 'Radiorama Stereo', 8, 664, '2026-02-01', '2026-04-24', 'activa', NULL, NULL, NULL, NULL, 'Caracas', NOW(), NOW()),
  (gen_random_uuid(), 'RBB', 'Nestlé Multicategoría', 'ac7faec73ac3fe11a5af6733573ede5a', 'Nestlé Multicategoría', 'Radiorama Stereo', 8, 664, '2026-02-01', '2026-04-24', 'activa', NULL, NULL, NULL, NULL, 'Caracas', NOW(), NOW()),
  (gen_random_uuid(), 'RBB', 'Banco de Venezuela | BDV | Tarjeta Internacional', 'ba9a65960cfc4b6ff8cfc19b6721fc6a', 'Banco de Venezuela | BDV | Tarjeta Internacional', 'Super Stereo 98.1 FM', 8, 664, '2026-02-01', '2026-04-24', 'activa', NULL, NULL, NULL, NULL, 'Valencia', NOW(), NOW()),
  (gen_random_uuid(), 'RBB', 'BNC | BNC | envio de dinero desde EEUU', 'c7e352a15afe5858ab24caeddfc70ab6', 'BNC | BNC | envio de dinero desde EEUU', 'Super Stereo 98.1 FM', 8, 664, '2026-02-01', '2026-04-24', 'activa', NULL, NULL, NULL, NULL, 'Valencia', NOW(), NOW()),
  (gen_random_uuid(), 'RBB', 'Cervecería Regional | Malta Morena', 'd214268d2e3611a1dc55a3907195541b', 'Cervecería Regional | Malta Morena', 'Super Stereo 98.1 FM', 8, 664, '2026-02-01', '2026-04-24', 'activa', NULL, NULL, NULL, NULL, 'Valencia', NOW(), NOW()),
  (gen_random_uuid(), 'RBB', 'Cervecería Regional | Malta Morena | Musical', 'a9916fdaae3e2a2c4b677d29864775d7', 'Cervecería Regional | Malta Morena | Musical', 'Super Stereo 98.1 FM', 8, 664, '2026-02-01', '2026-04-24', 'activa', NULL, NULL, NULL, NULL, 'Valencia', NOW(), NOW()),
  (gen_random_uuid(), 'RBB', 'Digitel | La Mega', '493a742f603d16e483923b1f757d1f44', 'Digitel | La Mega', 'Super Stereo 98.1 FM', 8, 664, '2026-02-01', '2026-04-24', 'activa', NULL, NULL, NULL, NULL, 'Valencia', NOW(), NOW()),
  (gen_random_uuid(), 'RBB', 'Mango Bajito | Tiendas Mango Bajito | Eso es un mango bajito', 'c7a2bcc027ef3a62b71e2102eade93c4', 'Mango Bajito | Tiendas Mango Bajito | Eso es un mango bajito', 'Super Stereo 98.1 FM', 8, 664, '2026-02-01', '2026-04-24', 'activa', NULL, NULL, NULL, NULL, 'Valencia', NOW(), NOW());
