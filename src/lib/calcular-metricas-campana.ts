import type {
  EstadoCumplimiento,
  MetricasCampanaDisplay,
  ResumenCampanaRow,
} from "@/lib/types/campana-estado";
import type { OrdenTransmisionRow } from "@/lib/types/orden-transmision";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function parseCalendarDate(value: string): Date {
  if (DATE_ONLY.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function hoyCalendario(): string {
  return toDateKey(new Date());
}

/** Días inclusivos entre dos fechas calendario (YYYY-MM-DD). */
export function diasInclusivos(inicio: string, fin: string): number {
  const start = parseCalendarDate(inicio);
  const end = parseCalendarDate(fin);
  const ms = end.getTime() - start.getTime();
  if (ms < 0) return 0;
  return Math.floor(ms / (24 * 60 * 60 * 1000)) + 1;
}

export function calcularAvanceTemporal(
  periodoInicio: string,
  periodoFin: string,
  fechaReferencia = hoyCalendario(),
): { dias_transcurridos: number; dias_totales: number; avance_temporal_pct: number } {
  const dias_totales = diasInclusivos(periodoInicio, periodoFin);

  if (fechaReferencia < periodoInicio) {
    return { dias_transcurridos: 0, dias_totales, avance_temporal_pct: 0 };
  }

  const finEfectivo =
    fechaReferencia < periodoFin ? fechaReferencia : periodoFin;
  const dias_transcurridos = diasInclusivos(periodoInicio, finEfectivo);
  const avance_temporal_pct =
    dias_totales > 0 ? (dias_transcurridos / dias_totales) * 100 : 0;

  return { dias_transcurridos, dias_totales, avance_temporal_pct };
}

/**
 * Porcentaje de cumplimiento sobre el total contratado de la campaña
 * (transmitidas acumuladas / total_contratadas), no sobre la meta parcial a hoy.
 */
export function calcularPorcentajeCumplimientoTotal(
  transmitidasAcumuladas: number,
  totalContratadas: number,
): number {
  if (totalContratadas <= 0) return 0;
  return (transmitidasAcumuladas / totalContratadas) * 100;
}

export function inferirEstadoCumplimiento(
  transmitidasAcumuladas: number,
  totalContratadas: number,
): EstadoCumplimiento {
  if (transmitidasAcumuladas >= totalContratadas) {
    return transmitidasAcumuladas > totalContratadas
      ? "en_compensacion"
      : "cumple";
  }
  return "atrasado";
}

export function calcularMetricasCampana(
  orden: Pick<OrdenTransmisionRow, "periodo_inicio" | "periodo_fin" | "total_contratadas">,
  resumen: ResumenCampanaRow | null,
  fechaReferencia = hoyCalendario(),
): MetricasCampanaDisplay {
  const total_contratadas = Number(orden.total_contratadas || 0);
  const { dias_transcurridos, dias_totales, avance_temporal_pct } =
    calcularAvanceTemporal(
      orden.periodo_inicio,
      orden.periodo_fin,
      fechaReferencia,
    );

  if (!resumen) {
    return {
      transmitidas_acumuladas: 0,
      total_contratadas,
      porcentaje_cumplimiento: 0,
      faltantes_total: total_contratadas,
      excedentes_total: 0,
      dias_transcurridos,
      dias_totales_campana: dias_totales,
      avance_temporal_pct,
      sin_monitoreo: true,
    };
  }

  const transmitidas_acumuladas = resumen.transmitidas_acumuladas;
  const porcentaje_cumplimiento = calcularPorcentajeCumplimientoTotal(
    transmitidas_acumuladas,
    total_contratadas,
  );

  return {
    transmitidas_acumuladas,
    total_contratadas,
    porcentaje_cumplimiento,
    faltantes_total: Math.max(0, total_contratadas - transmitidas_acumuladas),
    excedentes_total: Math.max(0, transmitidas_acumuladas - total_contratadas),
    dias_transcurridos,
    dias_totales_campana: dias_totales,
    avance_temporal_pct,
    sin_monitoreo: false,
  };
}

export function formatPorcentaje(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}
