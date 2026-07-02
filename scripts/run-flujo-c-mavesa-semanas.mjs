/**
 * Despliega nodos Flujo C en n8n y ejecuta 4 semanas Mavesa.
 * Uso: node scripts/run-flujo-c-mavesa-semanas.mjs
 */
import fs from "node:fs";
import path from "node:path";

const WORKFLOW_ID = "CtqvVdk7aUtIFGmu";
const ORDEN_ID = "aa9e39b0-fb74-49cb-94a1-0efa93c2241b";
const LUNES = ["2026-06-08", "2026-06-15", "2026-06-22", "2026-06-29"];

const ROOT = path.resolve(import.meta.dirname, "..");
const mcp = JSON.parse(
  fs.readFileSync(path.join(ROOT, ".cursor", "mcp.json"), "utf8"),
);
const AUTH =
  mcp.mcpServers?.["n8n-kompensa"]?.headers?.Authorization ??
  process.env.N8N_MCP_AUTH;
const N8N_MCP = "https://solwareagencia.app.n8n.cloud/mcp-server/http";

if (!AUTH) {
  throw new Error("Falta Authorization en .cursor/mcp.json (n8n-kompensa)");
}

let sessionId = null;

async function mcpCall(method, params, id = Date.now()) {
  const headers = {
    Authorization: AUTH,
    Accept: "application/json, text/event-stream",
    "Content-Type": "application/json",
  };
  if (sessionId) headers["mcp-session-id"] = sessionId;

  const body = JSON.stringify({ jsonrpc: "2.0", id, method, params });
  const res = await fetch(N8N_MCP, { method: "POST", headers, body });
  const newSession = res.headers.get("mcp-session-id");
  if (newSession) sessionId = newSession;

  const text = await res.text();
  const dataLine = text
    .split("\n")
    .find((l) => l.startsWith("data: "));
  if (!dataLine) throw new Error(`MCP sin data: ${text.slice(0, 500)}`);
  const payload = JSON.parse(dataLine.slice(6));
  if (payload.error) {
    throw new Error(`MCP ${method}: ${JSON.stringify(payload.error)}`);
  }
  return payload.result;
}

async function initMcp() {
  await mcpCall("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "run-flujo-c", version: "1.0" },
  }, 1);
}

async function tool(name, args) {
  const result = await mcpCall("tools/call", { name, arguments: args });
  if (result?.isError) {
    throw new Error(`${name}: ${result.content?.[0]?.text ?? "error"}`);
  }
  const text = result?.content?.[0]?.text;
  return text ? JSON.parse(text) : result;
}

function readMetricasJs() {
  const meta = fs
    .readFileSync(path.join(ROOT, "scripts", "meta-campana.js"), "utf8")
    .replace(/\r?\nmodule\.exports\s*=\s*\{[\s\S]*$/m, "");
  const metricas = fs.readFileSync(
    path.join(ROOT, "scripts", "flujo-c-calcular-metricas.js"),
    "utf8",
  );
  return `${meta}\n${metricas}`;
}

function fechasJs(fechaPrueba) {
  const valor = fechaPrueba ? `'${fechaPrueba}'` : "null";
  return `// Flujo C — Calcular Fechas Semanal (auto run-flujo-c-mavesa-semanas)
const FECHA_EJECUCION_PRUEBA = ${valor};
const valorPrueba = FECHA_EJECUCION_PRUEBA == null ? "" : String(FECHA_EJECUCION_PRUEBA).trim();
if (valorPrueba && !/^\\d{4}-\\d{2}-\\d{2}$/.test(valorPrueba)) {
  throw new Error("FECHA_EJECUCION_PRUEBA debe ser YYYY-MM-DD o null");
}
const hoyEfectivo = valorPrueba ? new Date(\`\${valorPrueba}T12:00:00Z\`) : new Date();
if (Number.isNaN(hoyEfectivo.getTime())) {
  throw new Error("Fecha inválida en FECHA_EJECUCION_PRUEBA");
}
const addDaysUtc = (dateStr, days) => {
  const d = new Date(\`\${dateStr}T00:00:00Z\`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
};
const fecha_ejecucion = hoyEfectivo.toISOString().split("T")[0];
const semana_fin = addDaysUtc(fecha_ejecucion, -1);
const semana_inicio = addDaysUtc(semana_fin, -6);
return [{ json: { fecha_ejecucion, semana_inicio, semana_fin, fecha_prueba_usada: valorPrueba || null } }];`;
}

async function deployAntiDuplicados() {
  const MET = "$('Code: Calcular Métricas Semanal').first().json";
  await updateWorkflow([
    {
      type: "setNodeSettings",
      nodeName: "Gmail: Reporte Semanal",
      settings: { executeOnce: true },
    },
    {
      type: "updateNodeParameters",
      nodeName: "Supabase: Get Monitoreo Semanal",
      replace: true,
      parameters: {
        operation: "getAll",
        tableId: "monitoreo_semanal",
        matchType: "allFilters",
        limit: 1,
        filters: {
          conditions: [
            {
              keyName: "campaña_id",
              condition: "eq",
              keyValue: `={{ ${MET}.orden.id }}`,
            },
            {
              keyName: "semana_inicio",
              condition: "eq",
              keyValue: `={{ ${MET}.semana_inicio }}`,
            },
          ],
        },
      },
    },
  ]);
}

async function updateWorkflow(operations) {
  return tool("update_workflow", { workflowId: WORKFLOW_ID, operations });
}

function semanaInicioDesdeLunes(lunes) {
  const fin = new Date(`${lunes}T00:00:00Z`);
  fin.setUTCDate(fin.getUTCDate() - 1);
  const inicio = new Date(fin);
  inicio.setUTCDate(inicio.getUTCDate() - 6);
  return inicio.toISOString().split("T")[0];
}

async function executeManual() {
  return tool("execute_workflow", {
    workflowId: WORKFLOW_ID,
    executionMode: "manual",
  });
}

async function waitExecution(executionId, maxMs = 180000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const res = await tool("get_execution", {
      workflowId: WORKFLOW_ID,
      executionId,
      includeData: false,
    });
    const status = res.execution?.status;
    if (status === "success" || status === "error") return res.execution;
    await new Promise((r) => setTimeout(r, 4000));
  }
  throw new Error(`Timeout esperando ejecución ${executionId}`);
}

async function main() {
  console.log("Inicializando MCP n8n…");
  await initMcp();

  console.log("Desplegando métricas con tramos + anti-duplicados email…");
  await updateWorkflow([
    {
      type: "setNodeParameter",
      nodeName: "Code: Calcular Métricas Semanal",
      path: "/jsCode",
      value: readMetricasJs(),
    },
    {
      type: "setNodeParameter",
      nodeName: "Supabase: Create Monitoreo Semanal",
      path: "/onError",
      value: "continueRegularOutput",
    },
  ]);
  await deployAntiDuplicados();

  const resultados = [];

  for (const lunes of LUNES) {
    const semanaInicio = semanaInicioDesdeLunes(lunes);
    console.log(`\n▶ Semana ${semanaInicio} (ejecución lunes ${lunes})…`);
    await updateWorkflow([
      {
        type: "setNodeParameter",
        nodeName: "Code: Calcular Fechas Semanal",
        path: "/jsCode",
        value: fechasJs(lunes),
      },
    ]);

    const exec = await executeManual();
    if (exec.status === "error") {
      throw new Error(`No arrancó ejecución ${lunes}: ${exec.error}`);
    }
    console.log(`   Ejecución ${exec.executionId} iniciada…`);
    const done = await waitExecution(exec.executionId);
    console.log(`   Estado: ${done.status}`);
    resultados.push({
      lunes,
      semana_inicio: semanaInicio,
      executionId: exec.executionId,
      status: done.status,
    });
    if (done.status === "error") {
      throw new Error(`Falló ejecución ${lunes} (${exec.executionId})`);
    }
    // Pausa entre semanas para no solapar envíos
    await new Promise((r) => setTimeout(r, 5000));
  }

  console.log("\nRestaurando FECHA_EJECUCION_PRUEBA = null…");
  await updateWorkflow([
    {
      type: "setNodeParameter",
      nodeName: "Code: Calcular Fechas Semanal",
      path: "/jsCode",
      value: fechasJs(null),
    },
  ]);

  const out = path.join(ROOT, "scripts", "run-flujo-c-mavesa-resultados.json");
  fs.writeFileSync(out, JSON.stringify(resultados, null, 2));
  console.log(`\n✅ 4 ejecuciones completadas → ${out}`);
  for (const r of resultados) {
    console.log(`   ${r.lunes}: ${r.executionId} (${r.status})`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
