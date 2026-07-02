// Flujo C prod — pegar en Code: Calcular Métricas Semanal1 (misma lógica que flujo-c-calcular-metricas.js).
// Flujo C — nodo Code: Calcular Métricas Semanal.
// Métricas de la semana (eval_inicio → eval_fin) + acumulado de campaña hasta eval_fin.
const data = $input.first().json;
const detecciones = data.detecciones_filtradas || [];
const orden = data.orden;
const eval_inicio = data.eval_inicio;
const eval_fin = data.eval_fin;
const semana_inicio = data.semana_inicio;
const semana_fin = data.semana_fin;
const dias_efectivos = data.dias_efectivos;
const fecha_ejecucion = data.fecha_ejecucion;

const parsearFechaRFC2822 = (fechaStr) => {
  if (!fechaStr) return null;
  const fecha = new Date(fechaStr);
  if (isNaN(fecha.getTime())) return null;
  const año = fecha.getUTCFullYear();
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getUTCDate()).padStart(2, "0");
  return `${año}-${mes}-${dia}`;
};

const addDaysUtc = (dateStr, days) => {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
};

const diasInclusivos = (inicio, fin) => {
  const start = new Date(`${inicio}T00:00:00Z`);
  const end = new Date(`${fin}T00:00:00Z`);
  const ms = end.getTime() - start.getTime();
  if (ms < 0) return 0;
  return Math.floor(ms / (24 * 60 * 60 * 1000)) + 1;
};

const cuniasDiarias = Number(orden.cuñas_diarias || 0);
const totalContratadasOrden = Number(orden.total_contratadas || 0);

const metaAcumuladaHasta = (finDate) => {
  if (!finDate || finDate < orden.periodo_inicio) return 0;
  const finEfectivo = finDate > orden.periodo_fin ? orden.periodo_fin : finDate;
  const dias = diasInclusivos(orden.periodo_inicio, finEfectivo);
  return Math.min(cuniasDiarias * dias, totalContratadasOrden);
};

const dayBeforeEvalInicio = addDaysUtc(eval_inicio, -1);
const metaAntesSemana =
  eval_inicio <= orden.periodo_inicio
    ? 0
    : metaAcumuladaHasta(dayBeforeEvalInicio);
const metaHastaFinSemana = metaAcumuladaHasta(eval_fin);
const contratadas_semana = Math.max(0, metaHastaFinSemana - metaAntesSemana);

let transmitidas_semana = 0;
let transmitidas_acumuladas = 0;

detecciones.forEach((d) => {
  const fechaStr = parsearFechaRFC2822(d.datetime_utc);
  if (!fechaStr) return;
  if (fechaStr >= eval_inicio && fechaStr <= eval_fin) {
    transmitidas_semana += 1;
  }
  if (fechaStr >= orden.periodo_inicio && fechaStr <= eval_fin) {
    transmitidas_acumuladas += 1;
  }
});

const faltantes_semana = Math.max(0, contratadas_semana - transmitidas_semana);
const excedentes_semana = Math.max(0, transmitidas_semana - contratadas_semana);

const metaAcumuladaCampana = metaAcumuladaHasta(eval_fin);
const faltantes_acumulados = Math.max(
  0,
  metaAcumuladaCampana - transmitidas_acumuladas,
);

let estado = "atrasado";
if (transmitidas_semana >= contratadas_semana) {
  estado =
    transmitidas_semana > contratadas_semana ? "en_compensacion" : "cumple";
}

const porcentaje_cumplimiento =
  contratadas_semana > 0
    ? ((transmitidas_semana / contratadas_semana) * 100).toFixed(1)
    : "0.0";

const estadoLabel =
  estado === "cumple"
    ? "Cumple"
    : estado === "atrasado"
      ? "Atrasado"
      : "En Compensación";

const telefono = String(orden.telefono_cliente ?? "").trim();
const email = String(orden.email_cliente ?? "").trim();

return [
  {
    json: {
      orden,
      semana_inicio,
      semana_fin,
      eval_inicio,
      eval_fin,
      dias_efectivos,
      fecha_ejecucion,
      transmitidas_semana,
      contratadas_semana,
      transmitidas_acumuladas,
      faltantes_semana,
      excedentes_semana,
      faltantes_acumulados,
      estado,
      estado_label: estadoLabel,
      porcentaje_cumplimiento,
      tiene_telefono: telefono.length > 0,
      tiene_email: email.length > 0,
      telefono_destino: telefono || null,
      email_destino: email || null,
      total_contratadas_orden: totalContratadasOrden,
      meta_acumulada_campana: metaAcumuladaCampana,
    },
  },
];
