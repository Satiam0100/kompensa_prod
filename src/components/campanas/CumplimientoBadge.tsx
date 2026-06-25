import { StatusBadge } from "@/components/ui/StatusBadge";
import type { EstadoCumplimiento } from "@/lib/types/campana-estado";

const estadoVariants = {
  cumple: "success",
  atrasado: "warning",
  en_compensacion: "primary",
} as const;

const estadoLabels: Record<EstadoCumplimiento, string> = {
  cumple: "Cumple",
  atrasado: "Atrasado",
  en_compensacion: "En compensación",
};

interface CumplimientoBadgeProps {
  estado: EstadoCumplimiento | null;
  sinMonitoreo?: boolean;
}

export function CumplimientoBadge({
  estado,
  sinMonitoreo = false,
}: CumplimientoBadgeProps) {
  if (sinMonitoreo || !estado) {
    return <StatusBadge variant="neutral">Sin monitoreo</StatusBadge>;
  }

  return (
    <StatusBadge variant={estadoVariants[estado]}>
      {estadoLabels[estado]}
    </StatusBadge>
  );
}
