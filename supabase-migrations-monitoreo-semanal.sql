-- Migración: monitoreo semanal (Flujo C)
-- Ejecutar en Supabase SQL Editor si la tabla aún no existe.

CREATE TABLE IF NOT EXISTS monitoreo_semanal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaña_id UUID NOT NULL REFERENCES ordenes_transmision(id) ON DELETE CASCADE,
  semana_inicio DATE NOT NULL,
  semana_fin DATE NOT NULL,
  eval_inicio DATE NOT NULL,
  eval_fin DATE NOT NULL,
  dias_efectivos INTEGER NOT NULL DEFAULT 0,
  transmitidas_semana INTEGER NOT NULL DEFAULT 0,
  contratadas_semana INTEGER NOT NULL DEFAULT 0,
  transmitidas_acumuladas INTEGER NOT NULL DEFAULT 0,
  faltantes_semana INTEGER NOT NULL DEFAULT 0,
  excedentes_semana INTEGER NOT NULL DEFAULT 0,
  faltantes_acumulados INTEGER NOT NULL DEFAULT 0,
  estado TEXT NOT NULL CHECK (estado IN ('cumple', 'atrasado', 'en_compensacion')),
  porcentaje_cumplimiento NUMERIC(5, 1),
  whatsapp_destino TEXT,
  email_destino TEXT,
  enviado_whatsapp_at TIMESTAMPTZ,
  enviado_email_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaña_id, semana_inicio)
);

CREATE INDEX IF NOT EXISTS idx_monitoreo_semanal_campaña
  ON monitoreo_semanal(campaña_id);
CREATE INDEX IF NOT EXISTS idx_monitoreo_semanal_semana
  ON monitoreo_semanal(semana_inicio);

COMMENT ON TABLE monitoreo_semanal IS
  'Reportes semanales (Flujo C). No reemplaza resumen_campaña (monitoreo diario).';
