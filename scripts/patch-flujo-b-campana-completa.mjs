/**
 * Parchea Flujo B: API y métricas usan campaña completa (inicio → hoy).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DEFAULT_PATCHED = path.join(ROOT, "flujo-b-live-patched.json");
const METRICAS_JS = fs.readFileSync(
  path.join(import.meta.dirname, "flujo-b-calcular-metricas.js"),
  "utf8",
);

const API_START_DATE =
  "={{ $('Split In Batches - Por Campaña').item.json.periodo_inicio }}";

const API_END_DATE =
  "={{ (() => { const orden = $('Split In Batches - Por Campaña').item.json; const h = $('Code: Calcular Fechas').first().json.fecha_hoy; if (h < orden.periodo_inicio) return orden.periodo_inicio; return h < orden.periodo_fin ? h : orden.periodo_fin; })() }}";

export function patchFlujoBCampanaCompleta(
  patchedPath = DEFAULT_PATCHED,
) {
  const workflow = JSON.parse(fs.readFileSync(patchedPath, "utf8"));

  const http = workflow.nodes.find(
    (n) => n.name === "HTTP Request: API Detecciones - Página 1",
  );
  if (!http) throw new Error("Nodo HTTP Request no encontrado");

  const params = http.parameters.queryParameters.parameters;
  const startParam = params.find((p) => p.name === "start_date");
  const endParam = params.find((p) => p.name === "end_date");
  if (!startParam || !endParam) {
    throw new Error("Parámetros start_date/end_date no encontrados");
  }

  startParam.value = API_START_DATE;
  endParam.value = API_END_DATE;

  const metricas = workflow.nodes.find(
    (n) => n.name === "Code: Calcular Métricas",
  );
  if (!metricas) throw new Error("Nodo Code: Calcular Métricas no encontrado");
  metricas.parameters.jsCode = METRICAS_JS;

  const fechas = workflow.nodes.find((n) => n.name === "Code: Calcular Fechas");
  if (fechas) {
    fechas.parameters.jsCode = fechas.parameters.jsCode.replace(
      "// Ventana semanal: 7 dias incluyendo fecha_hoy (hoy y 6 dias hacia atras)",
      "// Ventana semanal solo para carpeta Drive (métricas/API usan campaña completa)",
    );
  }

  const gmail = workflow.nodes.find((n) => n.name === "Gmail: Send Email");
  if (gmail?.parameters?.subject) {
    gmail.parameters.subject = gmail.parameters.subject.replace(
      " - Semana ",
      " - Periodo ",
    );
  }

  fs.writeFileSync(patchedPath, `${JSON.stringify(workflow, null, 2)}\n`, "utf8");
}

if (process.argv[1]?.endsWith("patch-flujo-b-campana-completa.mjs")) {
  patchFlujoBCampanaCompleta();
  console.log("OK: flujo-b-live-patched.json parcheado (campaña completa)");
}
