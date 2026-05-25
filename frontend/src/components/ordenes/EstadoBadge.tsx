import type { EstadoOrden } from "@/lib/types/orden-transmision";

const estadoStyles: Record<EstadoOrden, string> = {
  activa: "bg-tertiary-container text-tertiary border-on-tertiary-container",
  pausada: "bg-surface-container-high text-on-surface-variant border-outline-variant",
  finalizada: "bg-primary-container text-on-primary-container border-outline-variant",
};

const estadoLabels: Record<EstadoOrden, string> = {
  activa: "Activa",
  pausada: "Pausada",
  finalizada: "Finalizada",
};

export function EstadoBadge({ estado }: { estado: EstadoOrden }) {
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded text-label-sm font-medium border capitalize ${estadoStyles[estado]}`}
    >
      {estadoLabels[estado]}
    </span>
  );
}
