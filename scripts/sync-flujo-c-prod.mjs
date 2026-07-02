/**
 * Despliega scripts Flujo C en n8n prod y publica el workflow.
 * Uso: node scripts/sync-flujo-c-prod.mjs
 */
import fs from "node:fs";
import path from "node:path";

const WORKFLOW_ID = "CtqvVdk7aUtIFGmu";
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
  const dataLine = text.split("\n").find((l) => l.startsWith("data: "));
  if (!dataLine) throw new Error(`MCP sin data: ${text.slice(0, 500)}`);
  const payload = JSON.parse(dataLine.slice(6));
  if (payload.error) {
    throw new Error(`MCP ${method}: ${JSON.stringify(payload.error)}`);
  }
  return payload.result;
}

async function initMcp() {
  await mcpCall(
    "initialize",
    {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "sync-flujo-c-prod", version: "1.0" },
    },
    1,
  );
}

async function tool(name, args) {
  const result = await mcpCall("tools/call", { name, arguments: args });
  if (result?.isError) {
    throw new Error(`${name}: ${result.content?.[0]?.text ?? "error"}`);
  }
  const text = result?.content?.[0]?.text;
  return text ? JSON.parse(text) : result;
}

function readJs(file) {
  return fs.readFileSync(path.join(ROOT, "scripts", file), "utf8");
}

function readMetricasJs() {
  const meta = readJs("meta-campana.js").replace(
    /\r?\nmodule\.exports\s*=\s*\{[\s\S]*$/m,
    "",
  );
  return `${meta}\n${readJs("flujo-c-calcular-metricas.js")}`;
}

async function main() {
  console.log("Inicializando MCP n8n…");
  await initMcp();

  const MET = "$('Code: Calcular Métricas Semanal').first().json";
  const operations = [
    {
      type: "setNodeParameter",
      nodeName: "Code: Calcular Fechas Semanal",
      path: "/jsCode",
      value: readJs("flujo-c-calcular-fechas.js"),
    },
    {
      type: "setNodeParameter",
      nodeName: "Code: Ventana Efectiva Semanal",
      path: "/jsCode",
      value: readJs("flujo-c-ventana-efectiva.js"),
    },
    {
      type: "setNodeParameter",
      nodeName: "Code: Filtrar Detecciones",
      path: "/jsCode",
      value: readJs("flujo-c-filtrar-detecciones.js"),
    },
    {
      type: "setNodeParameter",
      nodeName: "Code: Calcular Métricas Semanal",
      path: "/jsCode",
      value: readMetricasJs(),
    },
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
    {
      type: "setNodeParameter",
      nodeName: "Supabase: Create Monitoreo Semanal",
      path: "/onError",
      value: "continueRegularOutput",
    },
  ];

  console.log("Actualizando workflow Flujo C…");
  const updated = await tool("update_workflow", {
    workflowId: WORKFLOW_ID,
    operations,
  });
  console.log(`  ${updated.appliedOperations} ops → ${updated.url}`);

  console.log("Publicando workflow (activar cron producción)…");
  const published = await tool("publish_workflow", {
    workflowId: WORKFLOW_ID,
  });
  if (!published.success) {
    throw new Error(`publish_workflow falló: ${published.error ?? "unknown"}`);
  }
  console.log(`  activeVersionId: ${published.activeVersionId}`);
  console.log("✅ Flujo C desplegado y activo en n8n prod");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
