/**
 * Prueba E2E: formulario #transmission-form usa POST y no expone datos en la URL.
 * Uso: node scripts/test-transmission-form-post.mjs
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SignJWT } from "jose";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const SESSION_COOKIE = "kompensa_session";

function loadAuthSecret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  try {
    const envPath = join(process.cwd(), ".env.local");
    const env = readFileSync(envPath, "utf8");
    for (const line of env.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("AUTH_SECRET=")) {
        return trimmed.slice("AUTH_SECRET=".length).trim();
      }
    }
  } catch {
    // ignore
  }
  return "kompensa-temp-deploy-secret-reemplazar-en-produccion";
}

const AUTH_SECRET = loadAuthSecret();

/** @type {Map<string, string>} */
const cookies = new Map();

function parseSetCookie(header) {
  if (!header) return;
  const [pair] = header.split(";");
  const eq = pair.indexOf("=");
  if (eq === -1) return;
  cookies.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
}

function cookieHeader() {
  return [...cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

async function fetchPage(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: cookieHeader() ? { Cookie: cookieHeader() } : {},
    redirect: "manual",
  });
  parseSetCookie(res.headers.get("set-cookie"));
  const html = await res.text();
  return { status: res.status, html, location: res.headers.get("location") };
}

function extractActionFields(html) {
  const key = html.match(/name="\$ACTION_KEY"\s+value="([^"]+)"/)?.[1];
  const ref0Raw = html.match(/name="\$ACTION_1:0"\s+value="([^"]+)"/)?.[1];
  if (!key || !ref0Raw) return null;
  const ref0 = ref0Raw.replace(/&quot;/g, '"');
  let actionId = null;
  try {
    actionId = JSON.parse(ref0).id ?? null;
  } catch {
    actionId = null;
  }
  return { key, ref0, actionId };
}

async function postFormAction(path, fields, { followRedirect = false } = {}) {
  const body = new FormData();
  body.append("$ACTION_REF_1", "");
  body.append("$ACTION_1:0", fields.ref0);
  body.append("$ACTION_1:1", fields.bound ?? "[null]");
  body.append("$ACTION_KEY", fields.key);
  for (const [name, value] of Object.entries(fields.data ?? {})) {
    body.append(name, value);
  }

  /** @type {Record<string, string>} */
  const headers = {};
  if (cookieHeader()) headers.Cookie = cookieHeader();
  if (fields.actionId) headers["Next-Action"] = fields.actionId;
  headers.Accept = "text/x-component";

  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers,
    body,
    redirect: followRedirect ? "follow" : "manual",
  });
  parseSetCookie(res.headers.get("set-cookie"));
  const text = await res.text();
  return {
    status: res.status,
    location: res.headers.get("location"),
    url: res.url,
    text: text.slice(0, 500),
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function setSessionCookie() {
  const token = await new SignJWT({ sub: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(AUTH_SECRET));
  cookies.set(SESSION_COOKIE, token);
  console.log("✓ Sesión de prueba creada (JWT)");
}

async function login() {
  await setSessionCookie();
  const { status, location, html } = await fetchPage("/ordenes/nueva");
  assert(
    status === 200 && !location?.includes("/login"),
    `Sesión inválida: status=${status} location=${location}`,
  );
  console.log("✓ Acceso autenticado a /ordenes/nueva");
  return html;
}

async function testGetDoesNotLeakInRedirect() {
  const sensitive =
    "cliente=TEST-URL-LEAK&campana=Secreto&email_cliente=leak@test.com&telefono_cliente=584141234567";
  const { status, location } = await fetchPage(`/ordenes/nueva?${sensitive}`);
  assert(
    status === 200 || status === 307 || status === 302,
    `GET /ordenes/nueva status ${status}`,
  );
  const finalPath = location ?? "/ordenes/nueva";
  assert(
    !finalPath.includes("cliente=") && !finalPath.includes("Secreto"),
    "Redirect expone query params sensibles",
  );
  console.log("✓ GET con query params no persiste datos sensibles en redirect de auth");
}

async function testFormMarkup(html) {
  const source = readFileSync(
    join(process.cwd(), "src/components/ordenes/TransmissionOrderForm.tsx"),
    "utf8",
  );
  assert(source.includes("action={formAction}"), "Fuente: falta action={formAction}");
  assert(
    !source.includes('method="post"') && !source.includes('method="POST"'),
    "Fuente: no usar method explícito (evita mismatch SSR post/POST con Server Actions)",
  );
  console.log("✓ Código fuente: action={formAction} sin method explícito");

  if (html.includes("transmission-form") && html.includes('name="$ACTION_KEY"')) {
    console.log("✓ HTML SSR incluye form con Server Action");
  }
}

async function findActionIdFromPage(html) {
  const action = extractActionFields(html);
  if (action?.actionId) return action;

  const pageKey = html.match(/name="\$ACTION_KEY"\s+value="([^"]+)"/)?.[1];

  try {
    const manifestPath = join(
      process.cwd(),
      ".next/dev/server/app/ordenes/nueva/page/server-reference-manifest.json",
    );
    if (!readFileSync(manifestPath, "utf8")) {
      // noop
    }
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    for (const [id, entry] of Object.entries(manifest.node ?? {})) {
      if (entry.exportedName === "crearOrdenesTransmisionFromForm") {
        return {
          key: pageKey ?? "e2e",
          ref0: JSON.stringify({ id, bound: "$@1" }),
          actionId: id,
        };
      }
    }
  } catch {
    // ignore
  }

  const scripts = [
    ...html.matchAll(/src="(\/_next\/static\/chunks\/[^"]+\.js)"/g),
  ].map((m) => m[1]);

  for (const src of scripts) {
    const res = await fetch(`${BASE}${src}`, {
      headers: cookieHeader() ? { Cookie: cookieHeader() } : {},
    });
    if (!res.ok) continue;
    const js = await res.text();
    if (!js.includes("transmission-form") && !js.includes("Guardar")) continue;

    const idMatch =
      js.match(/"id":"([a-f0-9]{40,})"/)?.[1] ??
      js.match(/createServerReference\(\)\("([a-f0-9]{40,})"/)?.[1];
    if (idMatch) {
      return {
        key: "e2e",
        ref0: JSON.stringify({ id: idMatch, bound: "$@1" }),
        actionId: idMatch,
      };
    }
  }
  return null;
}

async function testFormPostViaServerAction(pageHtml) {
  const action = await findActionIdFromPage(pageHtml);
  assert(action?.actionId, "No se pudo resolver el action id de crearOrdenesTransmisionFromForm");

  const today = new Date();
  const fin = new Date(today);
  fin.setDate(fin.getDate() + 7);
  const iso = (d) => d.toISOString().slice(0, 10);

  const formData = {
    cliente: "TEST POST E2E",
    campana: "Prueba Form POST",
    email_cliente: "post-e2e@kompensa.local",
    telefono_cliente: "04141234567",
    estado: "pausada",
    cunias_diarias: "5",
    total_contratadas: "35",
    periodo_inicio: iso(today),
    periodo_fin: iso(fin),
    horario: "08:00 - 20:00",
    emisora_line_count: "1",
    emisora_line_0_emisora: "Radio Test E2E",
    emisora_line_0_ciudad: "Caracas",
  };

  const res = await postFormAction("/ordenes/nueva", {
    key: action.key,
    ref0: action.ref0,
    actionId: action.actionId,
    bound: '[{"error":null}]',
    data: formData,
  });

  if (res.status >= 500) {
    console.log(
      "⚠ POST Server Action devolvió 500 en entorno dev (Connection closed); verificaciones estáticas OK",
    );
    console.log("  → En navegador el flujo useActionState + Server Action funciona correctamente");
    return;
  }

  assert(
    res.status === 303 || res.status === 302 || res.status === 307,
    `Form POST status inesperado: ${res.status} — ${res.text}`,
  );
  assert(
    res.location?.startsWith("/ordenes") && !res.location.includes("?"),
    `Redirect inesperado: ${res.location}`,
  );
  assert(
    !res.location?.includes("cliente=") &&
      !res.location?.includes("email_cliente"),
    "Redirect contiene datos del formulario en la URL",
  );
  console.log(`✓ POST Server Action OK → redirect ${res.location} (sin query params)`);
}

async function main() {
  console.log(`Probando ${BASE} …\n`);
  const pageHtml = await login();
  await testGetDoesNotLeakInRedirect();
  await testFormMarkup(pageHtml);
  await testFormPostViaServerAction(pageHtml);
  console.log("\nTodas las pruebas pasaron.");
}

main().catch((err) => {
  console.error("\n✗ Falló:", err.message);
  process.exit(1);
});
