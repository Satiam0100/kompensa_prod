/**

 * Simula Flujo C para cada lunes de la campaña activa (semana anterior).

 * Uso: node scripts/test-flujo-c-semanas.mjs

 */

import fs from "node:fs";

import path from "node:path";

import { createRequire } from "node:module";



const require = createRequire(import.meta.url);

const {

  metaAcumuladaHasta,

  contratadasEnRango,

  calcularEstadoSemanal,

  addDaysUtc,

} = require("./meta-campana.js");



const ORDEN_ID = "aa9e39b0-fb74-49cb-94a1-0efa93c2241b";

const LUNES_EJECUCION = [

  "2026-06-08",

  "2026-06-15",

  "2026-06-22",

  "2026-06-29",

];



const workflow = JSON.parse(

  fs.readFileSync(

    path.join(import.meta.dirname, "..", "flujo-b-ejecucion-automatica.json"),

    "utf8",

  ),

);

const API_KEY = String(

  workflow.nodes.find((n) => n.name === "Set: API Key")?.parameters

    ?.assignments?.assignments?.[0]?.value ?? "",

)

  .replace(/^=/, "")

  .trim();



const orden = {

  id: ORDEN_ID,

  cliente: "Mavesa",

  campaña: "Margarina Mavesa",

  emisora: "OK 101.3 FM",

  periodo_inicio: "2026-06-01",

  periodo_fin: "2026-06-28",

  cuñas_diarias: 6,

  total_contratadas: 114,

  telefono_cliente: "584245246292",

  email_cliente: "sergioperezcjob@gmail.com",

  spot_id: "6fc9fdfbf54571c7c2b455f5b14dac7c",

  spot_name: null,

  channel_id: "400508",

  tramos_cuotas: [

    {

      desde: "2026-06-01",

      hasta: "2026-06-21",

      dias_semana: [1, 2, 3, 4, 5],

      cuñas_por_dia: 6,

    },

    {

      desde: "2026-06-22",

      hasta: "2026-06-28",

      dias_semana: [1, 2, 3, 4, 5],

      cuñas_por_dia: 5,

    },

  ],

};



const maxDate = (a, b) => (a > b ? a : b);

const minDate = (a, b) => (a < b ? a : b);



const diasInclusivos = (inicio, fin) => {

  const start = new Date(`${inicio}T00:00:00Z`);

  const end = new Date(`${fin}T00:00:00Z`);

  const ms = end.getTime() - start.getTime();

  if (ms < 0) return 0;

  return Math.floor(ms / (24 * 60 * 60 * 1000)) + 1;

};



const parsearFechaRFC2822 = (fechaStr) => {

  if (!fechaStr) return null;

  const fecha = new Date(fechaStr);

  if (isNaN(fecha.getTime())) return null;

  const y = fecha.getFullYear();

  const m = String(fecha.getMonth() + 1).padStart(2, "0");

  const d = String(fecha.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;

};



async function fetchDetecciones(start, end) {

  const all = [];

  let page = 1;

  let totalPages = 1;

  while (page <= totalPages) {

    const url = new URL(

      "https://monitoreodigital.net/nueva_app_flask/api/v1/detections",

    );

    url.searchParams.set("api_key", API_KEY);

    url.searchParams.set("start_date", start);

    url.searchParams.set("end_date", end);

    url.searchParams.set("page", String(page));

    url.searchParams.set("limit", "10000");

    const res = await fetch(url);

    const json = await res.json();

    if (json.status !== "success") {

      throw new Error(`API: ${JSON.stringify(json)}`);

    }

    totalPages = json.meta?.total_pages || 1;

    all.push(...(json.data || []));

    page++;

  }

  return all;

}



function filtrarDetecciones(detecciones, ordenRow) {

  const ordenSinSpot = !ordenRow.spot_id && !ordenRow.spot_name;

  const matchPorClienteOCampaña = (d) => {

    if (!d.spot_name) return false;

    const sn = d.spot_name.toLowerCase();

    if (ordenRow.cliente && sn.includes(ordenRow.cliente.toLowerCase()))

      return true;

    if (ordenRow.campaña && sn.includes(ordenRow.campaña.toLowerCase()))

      return true;

    return false;

  };



  return detecciones.filter((d) => {

    const fechaStr = parsearFechaRFC2822(d.datetime_utc);

    if (!fechaStr) return false;

    if (fechaStr < ordenRow.periodo_inicio || fechaStr > ordenRow.periodo_fin)

      return false;



    if (ordenRow.spot_id) {

      if (!d.spot_id || d.spot_id !== ordenRow.spot_id) return false;

      if (

        ordenRow.channel_id &&

        d.channel_id &&

        d.channel_id !== ordenRow.channel_id

      ) {

        return false;

      }

      return true;

    }



    return (

      (ordenRow.spot_name &&

        d.spot_name &&

        (d.spot_name.toLowerCase().includes(ordenRow.spot_name.toLowerCase()) ||

          ordenRow.spot_name.toLowerCase().includes(d.spot_name.toLowerCase()))) ||

      (ordenRow.emisora &&

        d.channel_name &&

        (d.channel_name.toLowerCase().includes(ordenRow.emisora.toLowerCase()) ||

          ordenRow.emisora.toLowerCase().includes(d.channel_name.toLowerCase()))) ||

      (ordenRow.emisora &&

        d.channel_id &&

        ordenRow.channel_id &&

        d.channel_id === ordenRow.channel_id) ||

      (ordenSinSpot && matchPorClienteOCampaña(d))

    );

  });

}



function calcularMetricasSemanal(ordenRow, detecciones, ventana) {

  const {

    semana_inicio,

    semana_fin,

    eval_inicio,

    eval_fin,

    dias_efectivos,

    fecha_ejecucion,

  } = ventana;



  const totalContratadasOrden = Number(ordenRow.total_contratadas || 0);

  const dayBeforeEvalInicio = addDaysUtc(eval_inicio, -1);

  const metaAntesSemana =

    eval_inicio <= ordenRow.periodo_inicio

      ? 0

      : metaAcumuladaHasta(ordenRow, dayBeforeEvalInicio);

  const contratadas_semana = contratadasEnRango(

    ordenRow,

    eval_inicio,

    eval_fin,

  );

  const cuotaSemanaAgotada =

    contratadas_semana <= 0 &&

    totalContratadasOrden > 0 &&

    metaAntesSemana >= totalContratadasOrden;



  let transmitidas_semana = 0;

  let transmitidas_acumuladas = 0;



  detecciones.forEach((d) => {

    const fechaStr = parsearFechaRFC2822(d.datetime_utc);

    if (!fechaStr) return;

    if (fechaStr >= eval_inicio && fechaStr <= eval_fin) transmitidas_semana += 1;

    if (fechaStr >= ordenRow.periodo_inicio && fechaStr <= eval_fin)

      transmitidas_acumuladas += 1;

  });



  const faltantes_semana = Math.max(0, contratadas_semana - transmitidas_semana);

  const excedentes_semana = Math.max(0, transmitidas_semana - contratadas_semana);

  const metaAcumuladaCampana = metaAcumuladaHasta(ordenRow, eval_fin);

  const faltantes_acumulados = Math.max(

    0,

    metaAcumuladaCampana - transmitidas_acumuladas,

  );



  const estadoResult = calcularEstadoSemanal(

    transmitidas_semana,

    contratadas_semana,

    cuotaSemanaAgotada,

  );



  return {

    campaña_id: ordenRow.id,

    semana_inicio,

    semana_fin,

    eval_inicio,

    eval_fin,

    dias_efectivos,

    transmitidas_semana,

    contratadas_semana,

    transmitidas_acumuladas,

    faltantes_semana,

    excedentes_semana,

    faltantes_acumulados,

    estado: estadoResult.estado,

    estado_label: estadoResult.estado_label,

    porcentaje_cumplimiento: estadoResult.porcentaje_cumplimiento,

    whatsapp_destino: ordenRow.telefono_cliente,

    email_destino: ordenRow.email_cliente,

    fecha_ejecucion,

  };

}



function ventanaDesdeLunes(fechaEjecucion) {

  const semana_fin = addDaysUtc(fechaEjecucion, -1);

  const semana_inicio = addDaysUtc(semana_fin, -6);

  const eval_inicio = maxDate(semana_inicio, orden.periodo_inicio);

  const eval_fin = minDate(semana_fin, orden.periodo_fin);

  const skip = eval_inicio > eval_fin;

  const dias_efectivos = skip ? 0 : diasInclusivos(eval_inicio, eval_fin);

  return {

    skip,

    semana_inicio,

    semana_fin,

    eval_inicio,

    eval_fin,

    dias_efectivos,

    fecha_ejecucion: fechaEjecucion,

  };

}



const deteccionesRaw = await fetchDetecciones(

  orden.periodo_inicio,

  orden.periodo_fin,

);

const detecciones = filtrarDetecciones(deteccionesRaw, orden);



console.log(`Orden: ${orden.cliente} — ${orden.campaña} (${orden.emisora})`);

console.log(`Periodo: ${orden.periodo_inicio} → ${orden.periodo_fin}`);

console.log(

  `API: ${deteccionesRaw.length} total, ${detecciones.length} filtradas\n`,

);



const resultados = [];



for (const lunes of LUNES_EJECUCION) {

  const ventana = ventanaDesdeLunes(lunes);

  if (ventana.skip) {

    console.log(`⏭ ${lunes}: sin solapamiento`);

    continue;

  }

  const m = calcularMetricasSemanal(orden, detecciones, ventana);

  resultados.push(m);

  console.log(

    `📅 Ejecución ${lunes} | semana ${m.semana_inicio}→${m.semana_fin} | eval ${m.eval_inicio}→${m.eval_fin}`,

  );

  console.log(

    `   Tx ${m.transmitidas_semana}/${m.contratadas_semana} (${m.porcentaje_cumplimiento}%) | acum ${m.transmitidas_acumuladas} | ${m.estado} — ${m.estado_label}`,

  );

}



fs.writeFileSync(

  path.join(import.meta.dirname, "test-flujo-c-resultados.json"),

  JSON.stringify(resultados, null, 2),

);

console.log(`\n${resultados.length} semanas → scripts/test-flujo-c-resultados.json`);

