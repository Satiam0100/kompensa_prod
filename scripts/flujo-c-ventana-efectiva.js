// Flujo C — nodo Code: Ventana Efectiva Semanal.
// Intersección semana calendario × periodo de la orden (semana parcial).
const orden = $("Split In Batches - Por Campaña").item.json;
const fechas = $("Code: Calcular Fechas Semanal").first().json;

const { semana_inicio, semana_fin, fecha_ejecucion } = fechas;

const maxDate = (a, b) => (a > b ? a : b);
const minDate = (a, b) => (a < b ? a : b);

const eval_inicio = maxDate(semana_inicio, orden.periodo_inicio);
const eval_fin = minDate(semana_fin, orden.periodo_fin);

const diasInclusivos = (inicio, fin) => {
  const start = new Date(`${inicio}T00:00:00Z`);
  const end = new Date(`${fin}T00:00:00Z`);
  const ms = end.getTime() - start.getTime();
  if (ms < 0) return 0;
  return Math.floor(ms / (24 * 60 * 60 * 1000)) + 1;
};

const skip = eval_inicio > eval_fin;
const dias_efectivos = skip ? 0 : diasInclusivos(eval_inicio, eval_fin);

return [
  {
    json: {
      skip,
      orden,
      semana_inicio,
      semana_fin,
      eval_inicio,
      eval_fin,
      dias_efectivos,
      fecha_ejecucion,
    },
  },
];
