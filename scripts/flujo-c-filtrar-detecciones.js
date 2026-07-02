// Flujo C — nodo Code: Filtrar Detecciones (misma lógica que Flujo B).
const response = $input.first().json;
const detecciones = response.data || [];
const orden = $("Split In Batches - Por Campaña").item.json;
const ventana = $("Code: Ventana Efectiva Semanal").item.json;
const meta = response.meta || {};

const parsearFechaRFC2822 = (fechaStr) => {
  if (!fechaStr) return null;
  try {
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return null;
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${año}-${mes}-${dia}`;
  } catch {
    return null;
  }
};

const eval_inicio = ventana.eval_inicio;
const eval_fin = ventana.eval_fin;
const acum_inicio = orden.periodo_inicio;
const acum_fin = eval_fin;

const ordenSinSpot = !orden.spot_id && !orden.spot_name;
const matchPorClienteOCampaña = (d) => {
  if (!d.spot_name) return false;
  const sn = d.spot_name.toLowerCase();
  if (orden.cliente && sn.includes(orden.cliente.toLowerCase())) return true;
  if (orden.campaña && sn.includes(orden.campaña.toLowerCase())) return true;
  return false;
};

const coincideSpot = (d) =>
  (orden.spot_name &&
    d.spot_name &&
    (d.spot_name.toLowerCase().includes(orden.spot_name.toLowerCase()) ||
      orden.spot_name.toLowerCase().includes(d.spot_name.toLowerCase()))) ||
  (orden.spot_id && d.spot_id && d.spot_id === orden.spot_id) ||
  (orden.emisora &&
    d.channel_name &&
    (d.channel_name.toLowerCase().includes(orden.emisora.toLowerCase()) ||
      orden.emisora.toLowerCase().includes(d.channel_name.toLowerCase()))) ||
  (orden.emisora &&
    d.channel_id &&
    orden.channel_id &&
    d.channel_id === orden.channel_id) ||
  (ordenSinSpot && matchPorClienteOCampaña(d));

const filtradas = detecciones.filter((d) => {
  const fechaStr = parsearFechaRFC2822(d.datetime_utc);
  if (!fechaStr) return false;
  const enRangoAcum =
    fechaStr >= acum_inicio && fechaStr <= acum_fin;
  if (!enRangoAcum) return false;
  return coincideSpot(d);
});

return [
  {
    json: {
      detecciones_filtradas: filtradas,
      total_filtradas: filtradas.length,
      orden,
      eval_inicio,
      eval_fin,
      acum_inicio,
      acum_fin,
      ...ventana,
    },
  },
];
