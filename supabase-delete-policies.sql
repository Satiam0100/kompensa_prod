-- Políticas DELETE para el panel Kompensa
-- Ejecutar en Supabase → SQL Editor si no usas SUPABASE_SERVICE_ROLE_KEY
--
-- Con RLS activo, INSERT/UPDATE suelen estar permitidos pero DELETE no.
-- Sin estas políticas (o sin service role), el delete devuelve 0 filas sin error.

-- Agencias
ALTER TABLE agencias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kompensa_panel_delete_agencias" ON agencias;
CREATE POLICY "kompensa_panel_delete_agencias"
  ON agencias
  FOR DELETE
  USING (true);

-- Emisoras
ALTER TABLE emisoras ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kompensa_panel_delete_emisoras" ON emisoras;
CREATE POLICY "kompensa_panel_delete_emisoras"
  ON emisoras
  FOR DELETE
  USING (true);

-- Órdenes de transmisión
ALTER TABLE ordenes_transmision ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kompensa_panel_delete_ordenes" ON ordenes_transmision;
CREATE POLICY "kompensa_panel_delete_ordenes"
  ON ordenes_transmision
  FOR DELETE
  USING (true);
