/** Formatea datetime de la API (UTC) para mostrar en UI. */
export function formatDeteccionDateTime(datetimeUtc: string): string {
  const d = new Date(datetimeUtc);
  if (Number.isNaN(d.getTime())) return datetimeUtc;
  return new Intl.DateTimeFormat("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
    hour12: false,
  }).format(d);
}
