import { StatusBadge } from "@/components/ui/StatusBadge";

interface ActivaBadgeProps {
  activa: boolean;
}

export function ActivaBadge({ activa }: ActivaBadgeProps) {
  return (
    <StatusBadge variant={activa ? "success" : "neutral"}>
      {activa ? "Activa" : "Inactiva"}
    </StatusBadge>
  );
}
