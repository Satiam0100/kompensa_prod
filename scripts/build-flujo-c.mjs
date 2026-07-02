/**
 * Genera flujo-c-monitoreo-semanal.json desde scripts/flujo-c-*.js
 * Ejecutar: node scripts/build-flujo-c.mjs
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  applyKompensaCredentialsToWorkflow,
  KOMPENSA_CREDENTIALS,
} from "./n8n-kompensa-credentials.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "flujo-c-monitoreo-semanal.json");

const readJs = (file) =>
  fs.readFileSync(path.join(ROOT, "scripts", file), "utf8");

const readJsWithMeta = (file) => {
  const meta = readJs("meta-campana.js").replace(
    /\r?\nmodule\.exports\s*=\s*\{[\s\S]*$/m,
    "",
  );
  return `${meta}\n${readJs(file)}`;
};

const M = "Code: Calcular Métricas Semanal";
const MET = `$('${M}').first().json`;

function node(id, name, type, typeVersion, position, parameters, extra = {}) {
  return {
    parameters,
    id,
    name,
    type,
    typeVersion,
    position,
    ...extra,
  };
}

function supabaseNode(id, name, position, parameters, extra = {}) {
  return node(id, name, "n8n-nodes-base.supabase", 1, position, parameters, {
    credentials: { supabaseApi: { ...KOMPENSA_CREDENTIALS.supabaseApi } },
    ...extra,
  });
}

const ids = {
  manual: crypto.randomUUID(),
  cron: crypto.randomUUID(),
  fechas: crypto.randomUUID(),
  activas: crypto.randomUUID(),
  split: crypto.randomUUID(),
  finLotes: crypto.randomUUID(),
  ventana: crypto.randomUUID(),
  ifVentana: crypto.randomUUID(),
  apiKey: crypto.randomUUID(),
  httpApi: crypto.randomUUID(),
  filtrar: crypto.randomUUID(),
  metricas: crypto.randomUUID(),
  getMonitoreo: crypto.randomUUID(),
  ifMonitoreo: crypto.randomUUID(),
  updateMonitoreo: crypto.randomUUID(),
  createMonitoreo: crypto.randomUUID(),
  ifTelefono: crypto.randomUUID(),
  whatsapp: crypto.randomUUID(),
  patchWhatsapp: crypto.randomUUID(),
  ifEmail: crypto.randomUUID(),
  gmail: crypto.randomUUID(),
  patchEmail: crypto.randomUUID(),
};

const fieldValuesMonitoreo = [
  { fieldId: "campaña_id", fieldValue: `={{ ${MET}.orden.id }}` },
  { fieldId: "semana_inicio", fieldValue: `={{ ${MET}.semana_inicio }}` },
  { fieldId: "semana_fin", fieldValue: `={{ ${MET}.semana_fin }}` },
  { fieldId: "eval_inicio", fieldValue: `={{ ${MET}.eval_inicio }}` },
  { fieldId: "eval_fin", fieldValue: `={{ ${MET}.eval_fin }}` },
  { fieldId: "dias_efectivos", fieldValue: `={{ ${MET}.dias_efectivos }}` },
  {
    fieldId: "transmitidas_semana",
    fieldValue: `={{ ${MET}.transmitidas_semana }}`,
  },
  {
    fieldId: "contratadas_semana",
    fieldValue: `={{ ${MET}.contratadas_semana }}`,
  },
  {
    fieldId: "transmitidas_acumuladas",
    fieldValue: `={{ ${MET}.transmitidas_acumuladas }}`,
  },
  { fieldId: "faltantes_semana", fieldValue: `={{ ${MET}.faltantes_semana }}` },
  {
    fieldId: "excedentes_semana",
    fieldValue: `={{ ${MET}.excedentes_semana }}`,
  },
  {
    fieldId: "faltantes_acumulados",
    fieldValue: `={{ ${MET}.faltantes_acumulados }}`,
  },
  { fieldId: "estado", fieldValue: `={{ ${MET}.estado }}` },
    {
      fieldId: "porcentaje_cumplimiento",
      fieldValue: `={{ (() => { const v = ${MET}.porcentaje_cumplimiento; const n = Number(v); return Number.isFinite(n) ? n : null; })() }}`,
    },
  {
    fieldId: "whatsapp_destino",
    fieldValue: `={{ ${MET}.telefono_destino }}`,
  },
  { fieldId: "email_destino", fieldValue: `={{ ${MET}.email_destino }}` },
];

const nodes = [
  node(ids.manual, "Manual Trigger - Ejecutar Flujo C", "n8n-nodes-base.manualTrigger", 1, [12800, 15200], {}),
  node(
    ids.cron,
    "Cron Trigger - Lunes 8:00",
    "n8n-nodes-base.cron",
    1,
    [12800, 15360],
    {
      triggerTimes: {
        item: [{ hour: 8, minute: 0, weekday: 1 }],
      },
    },
  ),
  node(
    ids.fechas,
    "Code: Calcular Fechas Semanal",
    "n8n-nodes-base.code",
    2,
    [13024, 15280],
    { jsCode: readJs("flujo-c-calcular-fechas.js") },
  ),
  supabaseNode(
    ids.activas,
    "Supabase: Campañas Activas",
    [13248, 15280],
    {
      operation: "getAll",
      tableId: "ordenes_transmision",
      matchType: "allFilters",
      filters: {
        conditions: [
          { keyName: "estado", condition: "eq", keyValue: "activa" },
        ],
      },
    },
  ),
  node(ids.split, "Split In Batches - Por Campaña", "n8n-nodes-base.splitInBatches", 3, [13472, 15280], { options: {} }),
  node(
    ids.finLotes,
    "Code: Fin de lotes",
    "n8n-nodes-base.code",
    2,
    [13696, 15088],
    {
      jsCode:
        "return [{ json: { flujo_c_completado: true, fecha: new Date().toISOString() } }];",
    },
  ),
  node(
    ids.ventana,
    "Code: Ventana Efectiva Semanal",
    "n8n-nodes-base.code",
    2,
    [13696, 15280],
    { jsCode: readJs("flujo-c-ventana-efectiva.js") },
  ),
  node(
    ids.ifVentana,
    "IF: Tiene Ventana Semanal",
    "n8n-nodes-base.if",
    2,
    [13920, 15280],
    {
      conditions: {
        options: {
          caseSensitive: true,
          leftValue: "",
          typeValidation: "strict",
          version: 1,
        },
        conditions: [
          {
            id: "cond-skip",
            leftValue: "={{ $json.skip }}",
            rightValue: false,
            operator: { type: "boolean", operation: "equals" },
          },
        ],
        combinator: "and",
      },
      options: {},
    },
  ),
  node(
    ids.apiKey,
    "Set: API Key",
    "n8n-nodes-base.set",
    3.4,
    [14144, 15280],
    {
      assignments: {
        assignments: [
          {
            id: "assign-api-key",
            name: "api_key",
            value: "=mduFkpmfvEJv2NAeyd",
            type: "string",
          },
        ],
      },
      options: {},
    },
  ),
  node(
    ids.httpApi,
    "HTTP Request: API Detecciones",
    "n8n-nodes-base.httpRequest",
    4.2,
    [14368, 15280],
    {
      url: "=https://monitoreodigital.net/nueva_app_flask/api/v1/detections",
      sendQuery: true,
      queryParameters: {
        parameters: [
          { name: "api_key", value: "={{ $json.api_key }}" },
          {
            name: "start_date",
            value:
              "={{ $('Split In Batches - Por Campaña').item.json.periodo_inicio }}",
          },
          {
            name: "end_date",
            value:
              "={{ $('Code: Ventana Efectiva Semanal').item.json.eval_fin }}",
          },
          { name: "page", value: "=1" },
          { name: "limit", value: "=10000" },
        ],
      },
      options: {
        response: { response: { responseFormat: "json" } },
        timeout: 30000,
      },
    },
    { continueOnFail: true },
  ),
  node(
    ids.filtrar,
    "Code: Filtrar Detecciones",
    "n8n-nodes-base.code",
    2,
    [14592, 15280],
    { jsCode: readJs("flujo-c-filtrar-detecciones.js") },
  ),
  node(
    ids.metricas,
    M,
    "n8n-nodes-base.code",
    2,
    [14816, 15280],
    { jsCode: readJsWithMeta("flujo-c-calcular-metricas.js") },
  ),
  supabaseNode(
    ids.getMonitoreo,
    "Supabase: Get Monitoreo Semanal",
    [15040, 15280],
    {
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
    { alwaysOutputData: true, continueOnFail: true },
  ),
  node(
    ids.ifMonitoreo,
    "IF: Monitoreo Existe",
    "n8n-nodes-base.if",
    2,
    [15264, 15280],
    {
      conditions: {
        options: {
          caseSensitive: true,
          leftValue: "",
          typeValidation: "strict",
          version: 1,
        },
        conditions: [
          {
            id: "cond-exists",
            leftValue: "={{ Boolean($json.id) }}",
            rightValue: true,
            operator: { type: "boolean", operation: "equals" },
          },
        ],
        combinator: "and",
      },
      options: {},
    },
  ),
  supabaseNode(
    ids.updateMonitoreo,
    "Supabase: Update Monitoreo Semanal",
    [15488, 15184],
    {
      operation: "update",
      tableId: "monitoreo_semanal",
      matchType: "allFilters",
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
      fieldsUi: {
        fieldValues: fieldValuesMonitoreo.filter(
          (f) => f.fieldId !== "campaña_id" && f.fieldId !== "semana_inicio",
        ),
      },
    },
  ),
  supabaseNode(
    ids.createMonitoreo,
    "Supabase: Create Monitoreo Semanal",
    [15488, 15376],
    {
      tableId: "monitoreo_semanal",
      fieldsUi: { fieldValues: fieldValuesMonitoreo },
    },
  ),
  node(
    ids.ifTelefono,
    "IF: Tiene Teléfono",
    "n8n-nodes-base.if",
    2,
    [15712, 15280],
    {
      conditions: {
        options: {
          caseSensitive: true,
          leftValue: "",
          typeValidation: "strict",
          version: 1,
        },
        conditions: [
          {
            id: "cond-tel",
            leftValue: `={{ ${MET}.tiene_telefono }}`,
            rightValue: true,
            operator: { type: "boolean", operation: "equals" },
          },
        ],
        combinator: "and",
      },
      options: {},
    },
  ),
  node(
    ids.whatsapp,
    "HTTP Request: WhatsApp",
    "n8n-nodes-base.httpRequest",
    4.2,
    [15936, 15184],
    {
      method: "POST",
      url: "=https://YOUR_WHATSAPP_PROVIDER/v1/messages",
      sendBody: true,
      contentType: "json",
      specifyBody: "json",
      jsonBody: `={{ JSON.stringify({ to: ${MET}.telefono_destino, body: \`Kompensa – Reporte semanal\\nCliente: \${${MET}.orden.cliente}\\nCampaña: \${${MET}.orden.campaña} | \${${MET}.orden.emisora}\\nSemana: \${${MET}.eval_inicio} al \${${MET}.eval_fin}\\nTransmitidas: \${${MET}.transmitidas_semana} / \${${MET}.contratadas_semana} (\${${MET}.porcentaje_cumplimiento}%)\\nAcumulado: \${${MET}.transmitidas_acumuladas} / \${${MET}.total_contratadas_orden}\\nEstado: \${${MET}.estado_label}\` }) }}`,
      options: { timeout: 30000 },
    },
    {
      continueOnFail: true,
      notes:
        "Configura URL y auth de tu proveedor WhatsApp (Twilio, Meta, etc.)",
    },
  ),
  supabaseNode(
    ids.patchWhatsapp,
    "Supabase: Marcar WhatsApp Enviado",
    [16160, 15184],
    {
      operation: "update",
      tableId: "monitoreo_semanal",
      matchType: "allFilters",
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
      fieldsUi: {
        fieldValues: [
          { fieldId: "enviado_whatsapp_at", fieldValue: "={{ $now.toISO() }}" },
        ],
      },
    },
  ),
  node(
    ids.ifEmail,
    "IF: Tiene Email",
    "n8n-nodes-base.if",
    2,
    [15936, 15376],
    {
      conditions: {
        options: {
          caseSensitive: true,
          leftValue: "",
          typeValidation: "strict",
          version: 1,
        },
        conditions: [
          {
            id: "cond-email",
            leftValue: `={{ ${MET}.tiene_email }}`,
            rightValue: true,
            operator: { type: "boolean", operation: "equals" },
          },
        ],
        combinator: "and",
      },
      options: {},
    },
  ),
  node(
    ids.gmail,
    "Gmail: Reporte Semanal",
    "n8n-nodes-base.gmail",
    1,
    [16160, 15376],
    {
      subject: `=Reporte semanal Kompensa – {{ ${MET}.orden.campaña }} ({{ ${MET}.eval_inicio }} – {{ ${MET}.eval_fin }})`,
      includeHtml: true,
      htmlMessage: `=<p>Hola,</p><p>Reporte semanal de transmisiones para <strong>{{ ${MET}.orden.cliente }}</strong> — campaña <strong>{{ ${MET}.orden.campaña }}</strong> ({{ ${MET}.orden.emisora }}).</p><p><strong>Semana evaluada:</strong> {{ ${MET}.eval_inicio }} al {{ ${MET}.eval_fin }}</p><ul><li>Transmitidas (semana): {{ ${MET}.transmitidas_semana }} / {{ ${MET}.contratadas_semana }} ({{ ${MET}.porcentaje_cumplimiento }}%)</li><li>Acumulado campaña: {{ ${MET}.transmitidas_acumuladas }} / {{ ${MET}.total_contratadas_orden }}</li><li>Faltantes (semana): {{ ${MET}.faltantes_semana }}</li><li>Estado: {{ ${MET}.estado_label }}</li></ul><p>Saludos,<br>Equipo Kompensa</p>`,
      message: "=Reporte semanal Kompensa. Ver correo HTML.",
      additionalFields: {
        toList: [`={{ ${MET}.email_destino }}`],
      },
    },
    {
      credentials: { gmailOAuth2: { ...KOMPENSA_CREDENTIALS.gmailOAuth2 } },
      settings: { executeOnce: true },
    },
  ),
  supabaseNode(
    ids.patchEmail,
    "Supabase: Marcar Email Enviado",
    [16384, 15376],
    {
      operation: "update",
      tableId: "monitoreo_semanal",
      matchType: "allFilters",
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
      fieldsUi: {
        fieldValues: [
          { fieldId: "enviado_email_at", fieldValue: "={{ $now.toISO() }}" },
        ],
      },
    },
  ),
];

const connections = {
  "Manual Trigger - Ejecutar Flujo C": {
    main: [[{ node: "Code: Calcular Fechas Semanal", type: "main", index: 0 }]],
  },
  "Cron Trigger - Lunes 8:00": {
    main: [[{ node: "Code: Calcular Fechas Semanal", type: "main", index: 0 }]],
  },
  "Code: Calcular Fechas Semanal": {
    main: [[{ node: "Supabase: Campañas Activas", type: "main", index: 0 }]],
  },
  "Supabase: Campañas Activas": {
    main: [[{ node: "Split In Batches - Por Campaña", type: "main", index: 0 }]],
  },
  "Split In Batches - Por Campaña": {
    main: [
      [{ node: "Code: Fin de lotes", type: "main", index: 0 }],
      [{ node: "Code: Ventana Efectiva Semanal", type: "main", index: 0 }],
    ],
  },
  "Code: Ventana Efectiva Semanal": {
    main: [[{ node: "IF: Tiene Ventana Semanal", type: "main", index: 0 }]],
  },
  "IF: Tiene Ventana Semanal": {
    main: [
      [{ node: "Set: API Key", type: "main", index: 0 }],
      [{ node: "Split In Batches - Por Campaña", type: "main", index: 0 }],
    ],
  },
  "Set: API Key": {
    main: [[{ node: "HTTP Request: API Detecciones", type: "main", index: 0 }]],
  },
  "HTTP Request: API Detecciones": {
    main: [[{ node: "Code: Filtrar Detecciones", type: "main", index: 0 }]],
  },
  "Code: Filtrar Detecciones": {
    main: [[{ node: M, type: "main", index: 0 }]],
  },
  [M]: {
    main: [[{ node: "Supabase: Get Monitoreo Semanal", type: "main", index: 0 }]],
  },
  "Supabase: Get Monitoreo Semanal": {
    main: [[{ node: "IF: Monitoreo Existe", type: "main", index: 0 }]],
  },
  "IF: Monitoreo Existe": {
    main: [
      [{ node: "Supabase: Update Monitoreo Semanal", type: "main", index: 0 }],
      [{ node: "Supabase: Create Monitoreo Semanal", type: "main", index: 0 }],
    ],
  },
  "Supabase: Update Monitoreo Semanal": {
    main: [[{ node: "IF: Tiene Teléfono", type: "main", index: 0 }]],
  },
  "Supabase: Create Monitoreo Semanal": {
    main: [[{ node: "IF: Tiene Teléfono", type: "main", index: 0 }]],
  },
  "IF: Tiene Teléfono": {
    main: [
      [{ node: "HTTP Request: WhatsApp", type: "main", index: 0 }],
      [{ node: "IF: Tiene Email", type: "main", index: 0 }],
    ],
  },
  "HTTP Request: WhatsApp": {
    main: [
      [{ node: "Supabase: Marcar WhatsApp Enviado", type: "main", index: 0 }],
    ],
  },
  "Supabase: Marcar WhatsApp Enviado": {
    main: [[{ node: "IF: Tiene Email", type: "main", index: 0 }]],
  },
  "IF: Tiene Email": {
    main: [
      [{ node: "Gmail: Reporte Semanal", type: "main", index: 0 }],
      [{ node: "Split In Batches - Por Campaña", type: "main", index: 0 }],
    ],
  },
  "Gmail: Reporte Semanal": {
    main: [[{ node: "Supabase: Marcar Email Enviado", type: "main", index: 0 }]],
  },
  "Supabase: Marcar Email Enviado": {
    main: [[{ node: "Split In Batches - Por Campaña", type: "main", index: 0 }]],
  },
};

const workflow = {
  name: "Kompensa - Flujo C: Monitoreo Semanal",
  nodes,
  connections,
  pinData: {},
  settings: { executionOrder: "v1" },
  staticData: null,
  tags: [],
};

applyKompensaCredentialsToWorkflow(workflow);

fs.writeFileSync(OUT, JSON.stringify(workflow, null, 2));
console.log("Escrito:", OUT);
