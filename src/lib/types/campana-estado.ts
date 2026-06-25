import type { OrdenTransmisionRow } from "@/lib/types/orden-transmision";

export type EstadoCumplimiento = "cumple" | "atrasado" | "en_compensacion";

export interface ResumenCampanaRow {
  id: string;
  campaña_id: string;
  fecha: string;
  transmitidas_dia: number;
  transmitidas_acumuladas: number;
  faltantes: number;
  excedentes: number;
  estado: EstadoCumplimiento;
  created_at: string;
}

export interface MetricasCampanaDisplay {
  transmitidas_acumuladas: number;
  total_contratadas: number;
  porcentaje_cumplimiento: number;
  faltantes_total: number;
  excedentes_total: number;
  dias_transcurridos: number;
  dias_totales_campana: number;
  avance_temporal_pct: number;
  sin_monitoreo: boolean;
}

export interface CampanaConEstado extends OrdenTransmisionRow {
  resumen: ResumenCampanaRow | null;
  metricas: MetricasCampanaDisplay;
  estado_cumplimiento: EstadoCumplimiento | null;
}

export interface CampanaDetalle extends CampanaConEstado {
  historial: ResumenCampanaRow[];
  certificado_pdf_url: string | null;
}
