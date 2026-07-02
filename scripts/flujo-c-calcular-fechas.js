// Flujo C — REEMPLAZAR TODO el código del nodo Code: Calcular Fechas Semanal.
// Ejecución: lunes 8:00 → reporte de la semana anterior (lun–dom).
const FECHA_EJECUCION_PRUEBA = null;

const valorPrueba =
  FECHA_EJECUCION_PRUEBA == null ? "" : String(FECHA_EJECUCION_PRUEBA).trim();
if (valorPrueba && !/^\d{4}-\d{2}-\d{2}$/.test(valorPrueba)) {
  throw new Error("FECHA_EJECUCION_PRUEBA debe ser YYYY-MM-DD o null");
}

const hoyEfectivo = valorPrueba
  ? new Date(`${valorPrueba}T12:00:00Z`)
  : new Date();
if (Number.isNaN(hoyEfectivo.getTime())) {
  throw new Error("Fecha inválida en FECHA_EJECUCION_PRUEBA");
}

const addDaysUtc = (dateStr, days) => {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
};

const fecha_ejecucion = hoyEfectivo.toISOString().split("T")[0];
const semana_fin = addDaysUtc(fecha_ejecucion, -1);
const semana_inicio = addDaysUtc(semana_fin, -6);

return [
  {
    json: {
      fecha_ejecucion,
      semana_inicio,
      semana_fin,
      fecha_prueba_usada: valorPrueba || null,
    },
  },
];
