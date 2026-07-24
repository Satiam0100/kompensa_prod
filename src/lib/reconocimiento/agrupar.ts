import type {
  DeteccionApi,
  ReconocimientoGrupo,
} from "@/lib/reconocimiento/types";

function grupoKey(d: DeteccionApi): string {
  return [
    (d.channel_name || "").trim().toLowerCase(),
    (d.spot_id || "").trim(),
    (d.city || "").trim().toLowerCase(),
  ].join("|");
}

/** Agrupa detecciones por emisora + spot_id + ciudad. */
export function agruparDetecciones(
  detecciones: DeteccionApi[],
): ReconocimientoGrupo[] {
  const map = new Map<
    string,
    {
      channel_id: string;
      channel_name: string;
      city: string;
      spot_id: string;
      spot_name: string;
      items: DeteccionApi[];
    }
  >();

  for (const d of detecciones) {
    if (!d.spot_id || !d.channel_name) continue;
    const key = grupoKey(d);
    const existing = map.get(key);
    if (existing) {
      existing.items.push(d);
      if (!existing.spot_name && d.spot_name) {
        existing.spot_name = d.spot_name;
      }
      if (!existing.channel_id && d.channel_id) {
        existing.channel_id = d.channel_id;
      }
    } else {
      map.set(key, {
        channel_id: d.channel_id || "",
        channel_name: d.channel_name || "",
        city: d.city || "",
        spot_id: d.spot_id,
        spot_name: d.spot_name || "",
        items: [d],
      });
    }
  }

  const grupos: ReconocimientoGrupo[] = [];

  for (const [key, g] of map) {
    const sorted = [...g.items].sort((a, b) => {
      const ta = new Date(a.datetime_utc).getTime();
      const tb = new Date(b.datetime_utc).getTime();
      return ta - tb;
    });
    const durations = sorted
      .map((d) => d.duration_seg)
      .filter((n) => Number.isFinite(n) && n > 0);
    const duration_seg =
      durations.length > 0
        ? Math.round(
            durations.reduce((a, b) => a + b, 0) / durations.length,
          )
        : null;

    grupos.push({
      key,
      channel_id: g.channel_id,
      channel_name: g.channel_name,
      city: g.city,
      spot_id: g.spot_id,
      spot_name: g.spot_name,
      count: sorted.length,
      duration_seg,
      primera_deteccion: sorted[0]?.datetime_utc ?? "",
      ultima_deteccion: sorted.at(-1)?.datetime_utc ?? "",
      detecciones: sorted,
    });
  }

  return grupos.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.spot_name.localeCompare(b.spot_name, "es");
  });
}
