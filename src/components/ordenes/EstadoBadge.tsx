import { StatusBadge } from "@/components/ui/StatusBadge";
import type { EstadoOrden } from "@/lib/types/orden-transmision";

const estadoVariants = {
  activa: "success",
  pausada: "neutral",
  finalizada: "primary",
} as const;

const estadoLabels: Record<EstadoOrden, string> = {
  activa: "Activa",
  pausada: "Pausada",
  finalizada: "Finalizada",
};

export function EstadoBadge({ estado }: { estado: EstadoOrden }) {
  return (
    <StatusBadge variant={estadoVariants[estado]}>
      {estadoLabels[estado]}
    </StatusBadge>
  );
}
