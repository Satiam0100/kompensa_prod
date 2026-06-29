import fs from "node:fs";
import path from "node:path";

const workflow = JSON.parse(
  fs.readFileSync(
    path.join(import.meta.dirname, "..", "flujo-b-ejecucion-automatica.json"),
    "utf8",
  ),
);
const setNode = workflow.nodes.find((n) => n.name === "Set: API Key");
const API_KEY = String(setNode?.parameters?.assignments?.assignments?.[0]?.value ?? "")
  .replace(/^=/, "")
  .trim();

const START = "2026-06-01";
const END = new Date().toISOString().slice(0, 10);
const SPOT = "6fc9fdfbf54571c7c2b455f5b14dac7c";

const ordenes = [
  { emisora: "CUYUNI 106.5 FM", ciudad: "Puerto Ordaz", cunias: 6, total: 114 },
  { emisora: "OK 101.3 FM", ciudad: "Maracaibo", cunias: 6, total: 114 },
];

function parseDate(rfc) {
  const d = new Date(rfc);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function matchCiudad(ordenCiudad, detCity) {
  if (!ordenCiudad || !detCity) return true;
  const a = ordenCiudad.toLowerCase();
  const b = detCity.toLowerCase();
  return b.includes(a) || a.includes(b);
}

function matchEmisora(ordenEmisora, channelName) {
  if (!ordenEmisora || !channelName) return false;
  const a = ordenEmisora.toLowerCase();
  const b = channelName.toLowerCase();
  return b.includes(a) || a.includes(b);
}

let page = 1;
let totalPages = 1;
const all = [];

while (page <= totalPages) {
  const url = new URL(
    "https://monitoreodigital.net/nueva_app_flask/api/v1/detections",
  );
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("start_date", START);
  url.searchParams.set("end_date", END);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", "1000");
  const res = await fetch(url);
  const json = await res.json();
  if (json.status !== "success") throw new Error(JSON.stringify(json));
  totalPages = json.meta?.total_pages || 1;
  all.push(...(json.data || []));
  page++;
}

const inicio = new Date(`${START}T00:00:00Z`);
const fin = new Date(`${END}T00:00:00Z`);
const diasTranscurridos =
  Math.floor((fin - inicio) / (24 * 60 * 60 * 1000)) + 1;

const spotAll = all.filter((d) => d.spot_id === SPOT);

console.log(`Periodo: ${START} → ${END} (${diasTranscurridos} días)`);
console.log(`Registros API (todos los spots): ${all.length}`);
console.log(`Registros spot Mavesa (${SPOT.slice(0, 8)}…): ${spotAll.length}\n`);

for (const o of ordenes) {
  const filtradas = spotAll.filter(
    (d) =>
      matchEmisora(o.emisora, d.channel_name) &&
      matchCiudad(o.ciudad, d.city),
  );
  const acum = filtradas.length;
  const meta = Math.min(o.cunias * diasTranscurridos, o.total);
  const faltantes = Math.max(0, meta - acum);
  console.log(`--- ${o.emisora} (${o.ciudad}) ---`);
  console.log(`Transmitidas: ${acum}`);
  console.log(`Meta a hoy: ${meta}`);
  console.log(`Faltantes: ${faltantes}`);
  console.log(
    `Estado: ${acum >= meta ? (acum > meta ? "en_compensacion" : "cumple") : "atrasado"} (${((acum / meta) * 100).toFixed(1)}%)`,
  );
  const canales = [
    ...new Set(filtradas.map((d) => `${d.channel_name} / ${d.city}`)),
  ];
  console.log(`Canales: ${canales.join("; ") || "(ninguno)"}\n`);
}

const byChannel = {};
for (const d of spotAll) {
  const k = `${d.channel_name} | ${d.city}`;
  byChannel[k] = (byChannel[k] || 0) + 1;
}
console.log("Desglose spot Mavesa por canal (sin filtro emisora orden):");
for (const [k, n] of Object.entries(byChannel).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${n}× ${k}`);
}
