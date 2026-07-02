// Flujo C — nodo Code: Calcular Métricas Semanal.

// Requiere scripts/meta-campana.js (concatenado en build-flujo-c.mjs).

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



const totalContratadasOrden = Number(orden.total_contratadas || 0);

const dayBeforeEvalInicio = addDaysUtc(eval_inicio, -1);

const metaAntesSemana =

  eval_inicio <= orden.periodo_inicio

    ? 0

    : metaAcumuladaHasta(orden, dayBeforeEvalInicio);

const contratadas_semana = contratadasEnRango(orden, eval_inicio, eval_fin);

const cuotaSemanaAgotada =

  contratadas_semana <= 0 &&

  totalContratadasOrden > 0 &&

  metaAntesSemana >= totalContratadasOrden;



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



const metaAcumuladaCampana = metaAcumuladaHasta(orden, eval_fin);

const faltantes_acumulados = Math.max(

  0,

  metaAcumuladaCampana - transmitidas_acumuladas,

);



const estadoResult = calcularEstadoSemanal(

  transmitidas_semana,

  contratadas_semana,

  cuotaSemanaAgotada,

);



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

      estado: estadoResult.estado,

      estado_label: estadoResult.estado_label,

      porcentaje_cumplimiento: estadoResult.porcentaje_cumplimiento,

      cuota_semana_agotada: estadoResult.cuota_semana_agotada,

      tiene_telefono: telefono.length > 0,

      tiene_email: email.length > 0,

      telefono_destino: telefono || null,

      email_destino: email || null,

      total_contratadas_orden: totalContratadasOrden,

      meta_acumulada_campana: metaAcumuladaCampana,

    },

  },

];

