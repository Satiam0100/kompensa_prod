import fs from "node:fs";
import path from "node:path";
import {
  buildApiDateExpressions,
  buildMetricasJs,
} from "./flujo-b-n8n-deploy-payload.mjs";

const SUFFIX = "1";
const { start_date, end_date } = buildApiDateExpressions(SUFFIX);
const js = buildMetricasJs(SUFFIX);

const gmailSubject =
  `=Certificado de Transmisión - {{ $('Code: Calcular Métricas${SUFFIX}').first().json.orden.campaña }} - Periodo {{ $('Code: Calcular Métricas${SUFFIX}').first().json.periodo_inicio_evaluacion }} a {{ $('Code: Calcular Métricas${SUFFIX}').first().json.periodo_fin_evaluacion }}`;

const payload = {
  workflowId: "GatzQWNdzkAL2Gp3",
  operations: [
    {
      type: "setNodeParameter",
      nodeName: "HTTP Request: API Detecciones - Página ",
      path: "/queryParameters/parameters/1/value",
      value: start_date,
    },
    {
      type: "setNodeParameter",
      nodeName: "HTTP Request: API Detecciones - Página ",
      path: "/queryParameters/parameters/2/value",
      value: end_date,
    },
    {
      type: "updateNodeParameters",
      nodeName: `Code: Calcular Métricas${SUFFIX}`,
      parameters: { jsCode: js },
    },
    {
      type: "setNodeParameter",
      nodeName: `Gmail: Send Email${SUFFIX}`,
      path: "/subject",
      value: gmailSubject,
    },
  ],
};

const out = path.join(import.meta.dirname, ".flujo-b-n8n-deploy.json");
fs.writeFileSync(out, JSON.stringify(payload));
console.log(`OK: ${out} (${js.length} chars)`);
