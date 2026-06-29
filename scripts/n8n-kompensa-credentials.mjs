/**
 * Credenciales n8n — proyecto Kompensa (prod Supabase xtjnwkojcyudewqbbrkm).
 * Supabase: credencial "Kompensa" en solwareagencia.app.n8n.cloud.
 * Google/Gmail: mismos OAuth de la instancia, renombrados a "Kompensa" en n8n.
 */
export const KOMPENSA_CREDENTIALS = {
  supabaseApi: { id: "YtOY3Vn4Tj8wsjNl", name: "Kompensa" },
  googleDriveOAuth2Api: { id: "I5TTI0A94OmVpKcF", name: "Kompensa" },
  googleDocsOAuth2Api: { id: "U7eNAyp62fel4xvM", name: "Kompensa" },
  googleSheetsOAuth2Api: { id: "H90ISEc1KVrvlcJ9", name: "Kompensa" },
  gmailOAuth2: { id: "yaf6k1RQFW6PBYAa", name: "Kompensa" },
};

/** Expresión n8n: email del formulario (campo obligatorio en el panel). */
export const EMAIL_CLIENTE_TO = `={{ String($('Code: Calcular Métricas').first().json.orden.email_cliente ?? '').trim() }}`;

export function applyKompensaCredentials(node) {
  if (!node.credentials) return;

  for (const [type, cred] of Object.entries(KOMPENSA_CREDENTIALS)) {
    if (node.credentials[type]) {
      node.credentials[type] = { ...cred };
    }
  }
}

export function applyKompensaCredentialsToWorkflow(workflow) {
  for (const node of workflow.nodes) {
    applyKompensaCredentials(node);
  }
}
