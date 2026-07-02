import type { TramoCuota } from "@/lib/types/tramo-cuota";
import { DIAS_SEMANA_LV, DIAS_SEMANA_TODOS } from "@/lib/types/tramo-cuota";

export interface OrdenMetaInput {
  periodo_inicio: string;
  periodo_fin: string;
  cuñas_diarias?: number | null;
  total_contratadas?: number | null;
  tramos_cuotas?: TramoCuota[] | null;
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateOnly(dateStr: string | null | undefined): boolean {
  if (!dateStr || !DATE_ONLY.test(dateStr)) return false;
  const d = new Date(`${dateStr}T00:00:00Z`);
  return !Number.isNaN(d.getTime());
}

export function addDaysUtc(dateStr: string, days: number): string {
  if (!isValidDateOnly(dateStr)) return dateStr;
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  const next = d.toISOString().split("T")[0];
  return isValidDateOnly(next) ? next : dateStr;
}

export function isoWeekdayFromDateStr(dateStr: string): number {
  const d = new Date(`${dateStr}T12:00:00Z`);
  const js = d.getUTCDay();
  return js === 0 ? 7 : js;
}

export function diasInclusivos(inicio: string, fin: string): number {
  const start = new Date(`${inicio}T00:00:00Z`);
  const end = new Date(`${fin}T00:00:00Z`);
  const ms = end.getTime() - start.getTime();
  if (ms < 0) return 0;
  return Math.floor(ms / (24 * 60 * 60 * 1000)) + 1;
}

export function parseTramosCuotas(
  raw: unknown,
): TramoCuota[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const tramos: TramoCuota[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const t = item as Record<string, unknown>;
    const desde = String(t.desde ?? "");
    const hasta = String(t.hasta ?? "");
    if (!DATE_ONLY.test(desde) || !DATE_ONLY.test(hasta)) continue;
    const dias = Array.isArray(t.dias_semana)
      ? t.dias_semana
          .map((d) => Number(d))
          .filter((d) => d >= 1 && d <= 7)
      : [];
    const cuñas = Number(t.cuñas_por_dia ?? t.cunias_por_dia);
    if (!Number.isFinite(cuñas) || cuñas < 0) continue;
    tramos.push({
      desde,
      hasta,
      dias_semana: dias as TramoCuota["dias_semana"],
      cuñas_por_dia: cuñas,
    });
  }
  return tramos.length > 0 ? tramos : null;
}

export function cuniasContratadasDelDia(
  orden: OrdenMetaInput,
  dateStr: string,
): number {
  if (dateStr < orden.periodo_inicio || dateStr > orden.periodo_fin) {
    return 0;
  }

  const tramos = parseTramosCuotas(orden.tramos_cuotas);
  if (tramos) {
    let sum = 0;
    for (const tramo of tramos) {
      if (dateStr >= tramo.desde && dateStr <= tramo.hasta) {
        const dow = isoWeekdayFromDateStr(dateStr);
        if (tramo.dias_semana.includes(dow as TramoCuota["dias_semana"][0])) {
          sum += tramo.cuñas_por_dia;
        }
      }
    }
    return sum;
  }

  return Number(orden.cuñas_diarias) || 0;
}

export function metaAcumuladaHasta(
  orden: OrdenMetaInput,
  finDate: string | null | undefined,
): number {
  if (
    !isValidDateOnly(orden.periodo_inicio) ||
    !isValidDateOnly(orden.periodo_fin) ||
    !finDate ||
    !isValidDateOnly(finDate) ||
    finDate < orden.periodo_inicio
  ) {
    return 0;
  }
  const finEfectivo =
    finDate > orden.periodo_fin ? orden.periodo_fin : finDate;

  let acum = 0;
  let d = orden.periodo_inicio;
  let guard = 0;
  while (d <= finEfectivo && guard < 4000) {
    acum += cuniasContratadasDelDia(orden, d);
    const next = addDaysUtc(d, 1);
    if (next <= d) break;
    d = next;
    guard += 1;
  }

  const cap = Number(orden.total_contratadas) || 0;
  if (cap <= 0) return acum;
  return Math.min(acum, cap);
}

export function contratadasEnRango(
  orden: OrdenMetaInput,
  inicio: string,
  fin: string,
): number {
  if (
    !isValidDateOnly(inicio) ||
    !isValidDateOnly(fin) ||
    fin < inicio
  ) {
    return 0;
  }
  let sum = 0;
  let d = inicio;
  let guard = 0;
  while (d <= fin && guard < 4000) {
    if (d >= orden.periodo_inicio && d <= orden.periodo_fin) {
      sum += cuniasContratadasDelDia(orden, d);
    }
    const next = addDaysUtc(d, 1);
    if (next <= d) break;
    d = next;
    guard += 1;
  }
  return sum;
}

export function totalContratadasCalculado(
  orden: OrdenMetaInput,
): number {
  if (
    !isValidDateOnly(orden.periodo_inicio) ||
    !isValidDateOnly(orden.periodo_fin) ||
    orden.periodo_fin < orden.periodo_inicio
  ) {
    return 0;
  }
  return contratadasEnRango(
    orden,
    orden.periodo_inicio,
    orden.periodo_fin,
  );
}

export function crearTramoLunesAViernes(
  desde: string,
  hasta: string,
  cuñasPorDia: number,
): TramoCuota {
  return {
    desde,
    hasta,
    dias_semana: [...DIAS_SEMANA_LV],
    cuñas_por_dia: cuñasPorDia,
  };
}

export function crearTramoTodosLosDias(
  desde: string,
  hasta: string,
  cuñasPorDia: number,
): TramoCuota {
  return {
    desde,
    hasta,
    dias_semana: [...DIAS_SEMANA_TODOS],
    cuñas_por_dia: cuñasPorDia,
  };
}

export function tramosCuotasPorDefecto(
  periodoInicio: string,
  periodoFin: string,
  cuñasDiarias: number,
): TramoCuota[] {
  const cuñas = Number.isFinite(cuñasDiarias) && cuñasDiarias > 0 ? cuñasDiarias : 1;
  return [crearTramoLunesAViernes(periodoInicio, periodoFin, cuñas)];
}

export function clampDateToRange(
  dateStr: string,
  min: string,
  max: string,
): string {
  if (!isValidDateOnly(dateStr)) return dateStr;
  if (!isValidDateOnly(min) || !isValidDateOnly(max)) return dateStr;
  if (dateStr < min) return min;
  if (dateStr > max) return max;
  return dateStr;
}

export function ajustarTramoAlPeriodo(
  tramo: TramoCuota,
  periodoInicio: string,
  periodoFin: string,
): TramoCuota {
  if (!isValidDateOnly(periodoInicio) || !isValidDateOnly(periodoFin)) {
    return tramo;
  }
  const desde = clampDateToRange(tramo.desde, periodoInicio, periodoFin);
  let hasta = clampDateToRange(tramo.hasta, periodoInicio, periodoFin);
  if (hasta < desde) {
    hasta = desde;
  }
  return { ...tramo, desde, hasta };
}

export function ajustarTramosAlPeriodo(
  tramos: TramoCuota[],
  periodoInicio: string,
  periodoFin: string,
): TramoCuota[] {
  return tramos.map((t) => ajustarTramoAlPeriodo(t, periodoInicio, periodoFin));
}

export function validarTramosDentroPeriodo(
  periodoInicio: string,
  periodoFin: string,
  tramos: TramoCuota[],
): string | null {
  if (!isValidDateOnly(periodoInicio) || !isValidDateOnly(periodoFin)) {
    return null;
  }
  for (let i = 0; i < tramos.length; i++) {
    const t = tramos[i];
    if (!isValidDateOnly(t.desde) || !isValidDateOnly(t.hasta)) {
      return `Tramo ${i + 1}: fechas inválidas.`;
    }
    if (t.hasta < t.desde) {
      return `Tramo ${i + 1}: la fecha fin no puede ser anterior al inicio.`;
    }
    if (t.desde < periodoInicio || t.hasta > periodoFin) {
      return `Tramo ${i + 1}: debe estar dentro del periodo del contrato (${periodoInicio} – ${periodoFin}).`;
    }
  }
  return null;
}

export function resolveTramosCuotas(
  data: Pick<
    OrdenMetaInput,
    "periodo_inicio" | "periodo_fin" | "cuñas_diarias" | "tramos_cuotas"
  >,
): TramoCuota[] {
  const parsed = parseTramosCuotas(data.tramos_cuotas);
  if (parsed && parsed.length > 0) {
    return ajustarTramosAlPeriodo(
      parsed,
      data.periodo_inicio,
      data.periodo_fin,
    );
  }
  if (
    isValidDateOnly(data.periodo_inicio) &&
    isValidDateOnly(data.periodo_fin) &&
    data.periodo_fin >= data.periodo_inicio
  ) {
    return tramosCuotasPorDefecto(
      data.periodo_inicio,
      data.periodo_fin,
      Number(data.cuñas_diarias) || 1,
    );
  }
  return [];
}

export function validarHuecosCoberturaTramos(
  periodoInicio: string,
  periodoFin: string,
  tramos: TramoCuota[],
): string | null {
  if (!isValidDateOnly(periodoInicio) || !isValidDateOnly(periodoFin)) {
    return null;
  }
  let d = periodoInicio;
  let guard = 0;
  while (d <= periodoFin && guard < 4000) {
    const cubierto = tramos.some((t) => d >= t.desde && d <= t.hasta);
    if (!cubierto) {
      return `Hay días del contrato sin tramo asignado (desde ${d}). Añade un tramo o amplía sus fechas.`;
    }
    const next = addDaysUtc(d, 1);
    if (next <= d) break;
    d = next;
    guard += 1;
  }
  return null;
}

export type EstadoCumplimientoSemanal =
  | "cumple"
  | "atrasado"
  | "en_compensacion";

export interface ResultadoEstadoSemanal {
  estado: EstadoCumplimientoSemanal;
  estado_label: string;
  porcentaje_cumplimiento: string;
  cuota_semana_agotada: boolean;
}

export function calcularEstadoSemanal(
  transmitidasSemana: number,
  contratadasSemana: number,
  cuotaSemanaAgotada: boolean,
): ResultadoEstadoSemanal {
  if (contratadasSemana <= 0) {
    if (cuotaSemanaAgotada) {
      return {
        estado:
          transmitidasSemana > 0 ? "en_compensacion" : "cumple",
        estado_label:
          transmitidasSemana > 0
            ? "En compensación (cuota cumplida)"
            : "Cuota cumplida",
        porcentaje_cumplimiento: "—",
        cuota_semana_agotada: true,
      };
    }
    if (transmitidasSemana === 0) {
      return {
        estado: "cumple",
        estado_label: "Sin meta esta semana",
        porcentaje_cumplimiento: "—",
        cuota_semana_agotada: false,
      };
    }
    return {
      estado: "en_compensacion",
      estado_label: "En compensación",
      porcentaje_cumplimiento: "—",
      cuota_semana_agotada: false,
    };
  }

  let estado: EstadoCumplimientoSemanal = "atrasado";
  if (transmitidasSemana >= contratadasSemana) {
    estado =
      transmitidasSemana > contratadasSemana
        ? "en_compensacion"
        : "cumple";
  }

  const estadoLabel =
    estado === "cumple"
      ? "Cumple"
      : estado === "atrasado"
        ? "Atrasado"
        : "En compensación";

  const porcentaje = (
    (transmitidasSemana / contratadasSemana) *
    100
  ).toFixed(1);

  return {
    estado,
    estado_label: estadoLabel,
    porcentaje_cumplimiento: porcentaje,
    cuota_semana_agotada: false,
  };
}
