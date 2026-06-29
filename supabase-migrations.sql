-- Migraciones para Sistema Kompensa
-- Ejecutar en Supabase SQL Editor

-- Tabla: ordenes_transmision
CREATE TABLE IF NOT EXISTS ordenes_transmision (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente TEXT NOT NULL,
  campaña TEXT NOT NULL,
  spot_id TEXT,
  spot_name TEXT,
  emisora TEXT NOT NULL,
  cuñas_diarias INTEGER NOT NULL,
  total_contratadas INTEGER NOT NULL,
  periodo_inicio DATE NOT NULL,
  periodo_fin DATE NOT NULL,
  estado TEXT DEFAULT 'activa' CHECK (estado IN ('activa', 'pausada', 'finalizada')),
  email_cliente TEXT,
  telefono_cliente TEXT,
  channel_id TEXT,
  agencia TEXT,
  duracion_seg INTEGER,
  horario TEXT,
  ciudad TEXT,
  numero_certificado TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_ordenes_estado ON ordenes_transmision(estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_periodo ON ordenes_transmision(periodo_inicio, periodo_fin);
CREATE INDEX IF NOT EXISTS idx_ordenes_spot ON ordenes_transmision(spot_id, spot_name);
CREATE INDEX IF NOT EXISTS idx_ordenes_numero_certificado ON ordenes_transmision(numero_certificado) WHERE numero_certificado IS NOT NULL;

-- Tabla: resumen_campaña
CREATE TABLE IF NOT EXISTS resumen_campaña (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaña_id UUID REFERENCES ordenes_transmision(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  transmitidas_dia INTEGER DEFAULT 0,
  transmitidas_acumuladas INTEGER DEFAULT 0,
  faltantes INTEGER DEFAULT 0,
  excedentes INTEGER DEFAULT 0,
  estado TEXT CHECK (estado IN ('cumple', 'atrasado', 'en_compensacion')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(campaña_id, fecha)
);

-- Índices para resumen_campaña
CREATE INDEX IF NOT EXISTS idx_resumen_campaña_id ON resumen_campaña(campaña_id);
CREATE INDEX IF NOT EXISTS idx_resumen_fecha ON resumen_campaña(fecha);

-- Tabla: certificados_emitidos
CREATE TABLE IF NOT EXISTS certificados_emitidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaña_id UUID REFERENCES ordenes_transmision(id) ON DELETE CASCADE,
  semana DATE NOT NULL, -- Lunes de la semana
  transmitidas INTEGER NOT NULL,
  faltantes INTEGER DEFAULT 0,
  excedentes INTEGER DEFAULT 0,
  estado TEXT NOT NULL,
  pdf_url TEXT,
  fecha_envio TIMESTAMP,
  codigo_certificado TEXT,
  numero_certificado TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(campaña_id, semana)
);

-- Índices para certificados_emitidos
CREATE INDEX IF NOT EXISTS idx_certificados_campaña_id ON certificados_emitidos(campaña_id);
CREATE INDEX IF NOT EXISTS idx_certificados_semana ON certificados_emitidos(semana);
CREATE INDEX IF NOT EXISTS idx_certificados_numero_certificado ON certificados_emitidos(numero_certificado) WHERE numero_certificado IS NOT NULL;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en ordenes_transmision
CREATE TRIGGER update_ordenes_updated_at 
    BEFORE UPDATE ON ordenes_transmision 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios en las tablas
COMMENT ON TABLE ordenes_transmision IS 'Almacena las órdenes de transmisión recibidas por correo';
COMMENT ON TABLE resumen_campaña IS 'Resumen diario de transmisiones por campaña';
COMMENT ON TABLE certificados_emitidos IS 'Registro de certificados PDF generados semanalmente';

