const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Fechas calendario (YYYY-MM-DD) sin desfase UTC; timestamps con zona local. */
function toLocalDate(value: string): Date {
  if (DATE_ONLY.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
}

export function formatFecha(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(toLocalDate(iso));
}

export function formatPeriodo(inicio: string, fin: string): string {
  return `${formatFecha(inicio)} – ${formatFecha(fin)}`;
}
