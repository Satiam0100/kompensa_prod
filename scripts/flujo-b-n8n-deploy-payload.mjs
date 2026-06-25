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

  return {
    start_date: `={{ ${batch}.item.json.periodo_inicio }}`,
    end_date: `={{ (() => { const orden = ${batch}.item.json; const h = ${fechas}.first().json.fecha_hoy; if (h < orden.periodo_inicio) return orden.periodo_inicio; return h < orden.periodo_fin ? h : orden.periodo_fin; })() }}`,
  };
}
