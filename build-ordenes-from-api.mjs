/**
 * Uso: node build-ordenes-from-api.mjs < ruta/a/respuesta-api.json
 * Genera filas únicas por (channel_name, spot_id) y las imprime TSV.
 */
import fs from "fs";

const raw = fs.readFileSync(0, "utf8");
const j = JSON.parse(raw);
const block = Array.isArray(j) ? j[0] : j;
const rows = block.data || block;
const m = new Map();
for (const r of rows) {
  const k = `${r.channel_name}\t${r.spot_id}`;
  if (!m.has(k)) {
    m.set(k, {
      emisora: r.channel_name,
      spot_id: r.spot_id,
      spot_name: r.spot_name,
      ciudad: r.city,
    });
  }
}
const list = [...m.values()].sort(
  (a, b) =>
    a.emisora.localeCompare(b.emisora) || a.spot_name.localeCompare(b.spot_name)
);
console.log("UNIQUE_COUNT", list.length);
for (const x of list) {
  console.log(
    [x.emisora, x.spot_id, x.spot_name.replace(/\t/g, " "), x.ciudad].join("\t")
  );
}
