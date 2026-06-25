// Flujo B — REEMPLAZAR TODO el código del nodo (no pegar encima del anterior).
// Métricas acumuladas de campaña: periodo_inicio → min(hoy, periodo_fin)
const data = $input.first().json;
const detecciones = data.detecciones_filtradas || [];
const orden = data.orden;

const fechas = $('Code: Calcular Fechas1').first().json || {};
const fechaHoy = fechas.fecha_hoy || new Date().toISOString().split('T')[0];

const cierre = fechaHoy >= orden.periodo_fin;

const periodoInicioEvaluacion = orden.periodo_inicio;
const periodoFinEvaluacion =
  fechaHoy < orden.periodo_fin ? fechaHoy : orden.periodo_fin;

const parsearFechaRFC2822 = (fechaStr) => {
  if (!fechaStr) return null;
  const fecha = new Date(fechaStr);
  if (isNaN(fecha.getTime())) return null;
  const año = fecha.getUTCFullYear();
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getUTCDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
};

const porDia = {};

if (fechaHoy < orden.periodo_inicio) {
  return [{
    json: {
      orden,
      fecha_hoy: fechaHoy,
      periodo_inicio_evaluacion: periodoInicioEvaluacion,
      periodo_fin_evaluacion: periodoFinEvaluacion,
      dias_evaluacion: 0,
      total_contratadas_periodo: 0,
      transmitidas_dia: 0,
      transmitidas_acumuladas: 0,
      faltantes: 0,
      excedentes: 0,
      kompensadas: 0,
      estado: 'atrasado',
      porcentaje_cumplimiento: '0.0',
      detalle_por_dia: porDia,
      total_detecciones: detecciones.length,
      cierre,
    },
  }];
}

const inicio = new Date(`${periodoInicioEvaluacion}T00:00:00Z`);
const fin = new Date(`${periodoFinEvaluacion}T00:00:00Z`);
for (let d = new Date(inicio); d <= fin; d.setUTCDate(d.getUTCDate() + 1)) {
  const fechaStr = d.toISOString().split('T')[0];
  porDia[fechaStr] = 0;
}

detecciones.forEach((d) => {
  const fechaStr = parsearFechaRFC2822(d.datetime_utc);
  if (fechaStr && Object.prototype.hasOwnProperty.call(porDia, fechaStr)) {
    porDia[fechaStr] = (porDia[fechaStr] || 0) + 1;
  }
});

const transmitidasHoy = porDia[fechaHoy] || 0;
const transmitidasAcum = Object.values(porDia).reduce((a, b) => a + b, 0);

const milisPorDia = 24 * 60 * 60 * 1000;
const diasTranscurridos = Math.max(0, Math.floor((fin - inicio) / milisPorDia) + 1);
const cuniasDiarias = Number(orden.cuñas_diarias || 0);
const totalContratadasOrden = Number(orden.total_contratadas || 0);

const totalContratadasPeriodo = cierre
  ? totalContratadasOrden
  : Math.min(cuniasDiarias * diasTranscurridos, totalContratadasOrden);

const faltantes = Math.max(0, totalContratadasPeriodo - transmitidasAcum);
const excedentes = Math.max(0, transmitidasAcum - totalContratadasPeriodo);
const kompensadas = excedentes;

let estado = 'atrasado';
if (transmitidasAcum >= totalContratadasPeriodo) {
  estado = transmitidasAcum > totalContratadasPeriodo ? 'en_compensacion' : 'cumple';
}

const porcentajeCumplimiento = totalContratadasPeriodo > 0
  ? ((transmitidasAcum / totalContratadasPeriodo) * 100).toFixed(1)
  : '0.0';

return [{
  json: {
    orden,
    fecha_hoy: fechaHoy,
    periodo_inicio_evaluacion: periodoInicioEvaluacion,
    periodo_fin_evaluacion: cierre ? orden.periodo_fin : periodoFinEvaluacion,
    dias_evaluacion: diasTranscurridos,
    total_contratadas_periodo: totalContratadasPeriodo,
    transmitidas_dia: transmitidasHoy,
    transmitidas_acumuladas: transmitidasAcum,
    faltantes,
    excedentes,
    kompensadas,
    estado,
    porcentaje_cumplimiento: porcentajeCumplimiento,
    detalle_por_dia: porDia,
    total_detecciones: detecciones.length,
    cierre,
  },
}];
