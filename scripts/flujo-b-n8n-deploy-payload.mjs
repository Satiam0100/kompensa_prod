/**
 * Despliega lógica de campaña completa en n8n prod (nodos con sufijo "1").
 */
import fs from "node:fs";
import path from "node:path";

const SUFFIX = process.env.N8N_NODE_SUFFIX ?? "1";

const METRICAS_BASE = fs.readFileSync(
  path.join(import.meta.dirname, "flujo-b-calcular-metricas.js"),
  "utf8",
);

/** Expresión n8n para end_date alineada con Calcular Métricas. */
export const API_END_DATE_BODY = `(() => {
  const addDays = (ds, n) => {
    const d = new Date(ds + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  };
  const orden = BATCH.item.json;
  const h = FECHAS.first().json.fecha_hoy;
  if (h < orden.periodo_inicio) return orden.periodo_inicio;
  if (h > orden.periodo_fin) return orden.periodo_fin;
  if (h === orden.periodo_fin) {
    const prev = addDays(orden.periodo_fin, -1);
    return prev < orden.periodo_inicio ? orden.periodo_inicio : prev;
  }
  return h;
})()`;

export function buildMetricasJs(suffix = "") {
  if (!suffix) return METRICAS_BASE;
  return METRICAS_BASE.replace(
    /\$\('Code: Calcular Fechas'\)/g,
    `$('Code: Calcular Fechas${suffix}')`,
  );
}

export function buildApiDateExpressions(suffix = "") {
  const batch = `$('Split In Batches - Por Campaña${suffix}')`;
  const fechas = `$('Code: Calcular Fechas${suffix}')`;

  const endBody = API_END_DATE_BODY.replace(/BATCH/g, batch).replace(
    /FECHAS/g,
    fechas,
  );

  return {
    start_date: `={{ ${batch}.item.json.periodo_inicio }}`,
    end_date: `={{ ${endBody} }}`,
  };
}

export function buildCertificadoIfExpression(suffix = "") {
  const metricas = `$('Code: Calcular Métricas${suffix}')`;
  return `={{ (() => { const m = ${metricas}.first().json; const tieneMetricas = (Number(m.total_contratadas_periodo || 0) > 0) || (Number(m.transmitidas_acumuladas || 0) > 0) || (Number(m.faltantes || 0) > 0) || (Number(m.kompensadas || 0) > 0) || (Number(m.excedentes || 0) > 0); return m.cierre && tieneMetricas; })() }}`;
}
