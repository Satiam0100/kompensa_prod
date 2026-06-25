/**
 * Sincroniza flujo-b-live-patched.json → flujo-b-ejecucion-automatica.json
 * - Credenciales Kompensa (Supabase prod + Google/Gmail)
 * - Email de cierre → email_cliente del formulario
 * - Nodo "Supabase: Finalizar Orden" tras Gmail
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  applyKompensaCredentials,
  applyKompensaCredentialsToWorkflow,
  EMAIL_CLIENTE_TO,
  KOMPENSA_CREDENTIALS,
} from "./n8n-kompensa-credentials.mjs";
import { patchFlujoBCampanaCompleta } from "./patch-flujo-b-campana-completa.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const PATCHED = path.join(ROOT, "flujo-b-live-patched.json");
const OUT = path.join(ROOT, "flujo-b-ejecucion-automatica.json");

patchFlujoBCampanaCompleta(PATCHED);

const patched = JSON.parse(fs.readFileSync(PATCHED, "utf8"));

applyKompensaCredentialsToWorkflow(patched);

const gmail = patched.nodes.find((n) => n.name === "Gmail: Send Email");
if (gmail?.parameters?.additionalFields) {
  gmail.parameters.additionalFields.toList = [EMAIL_CLIENTE_TO];
  delete gmail.parameters.additionalFields.ccList;
}

const FINALIZAR_NAME = "Supabase: Finalizar Orden";
const hasFinalizar = patched.nodes.some((n) => n.name === FINALIZAR_NAME);

if (!hasFinalizar) {
  const insertCert = patched.nodes.find(
    (n) => n.name === "Supabase: Insert Certificado",
  );
  const gmailNode = patched.nodes.find((n) => n.name === "Gmail: Send Email");

  const finalizarNode = {
    parameters: {
      operation: "update",
      tableId: "ordenes_transmision",
      filters: {
        conditions: [
          {
            keyName: "id",
            condition: "eq",
            keyValue:
              "={{ $('Code: Calcular Métricas').first().json.orden.id }}",
          },
          {
            keyName: "estado",
            condition: "eq",
            keyValue: "activa",
          },
        ],
      },
      fieldsUi: {
        fieldValues: [
          {
            fieldId: "estado",
            fieldValue: "finalizada",
          },
        ],
      },
    },
    id: crypto.randomUUID(),
    name: FINALIZAR_NAME,
    type: "n8n-nodes-base.supabase",
    typeVersion: 1,
    position: [
      (gmailNode?.position?.[0] ?? 17472) + 224,
      gmailNode?.position?.[1] ?? 16128,
    ],
    credentials: {
      supabaseApi: { ...KOMPENSA_CREDENTIALS.supabaseApi },
    },
  };

  applyKompensaCredentials(finalizarNode);
  patched.nodes.push(finalizarNode);

  patched.connections["Gmail: Send Email"] = {
    main: [[{ node: FINALIZAR_NAME, type: "main", index: 0 }]],
  };
  patched.connections[FINALIZAR_NAME] = {
    main: [[{ node: "Google Sheets: Append/Update", type: "main", index: 0 }]],
  };
}

patched.settings = {
  ...patched.settings,
  executionOrder: "v1",
  binaryMode: "separate",
};

const json = `${JSON.stringify(patched, null, 2)}\n`;
fs.writeFileSync(OUT, json, "utf8");
fs.writeFileSync(PATCHED, json, "utf8");

console.log(`OK: ${path.basename(OUT)} actualizado (${patched.nodes.length} nodos, credenciales Kompensa)`);
