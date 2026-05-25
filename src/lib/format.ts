export function formatFecha(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatPeriodo(inicio: string, fin: string): string {
  return `${formatFecha(inicio)} – ${formatFecha(fin)}`;
}
