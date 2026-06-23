import type { SelectOption } from "@/components/ui/FormSelect";
import type { EstadoOrden, OrdenTransmisionForm } from "@/lib/types/orden-transmision";

export const ESTADO_SIN_SPOT_MENSAJE =
  "La orden quedará pausada hasta tener Spot ID.";

export function hasSpotId(spotId?: string | null): boolean {
  return Boolean(spotId?.trim());
}

/** Sin Spot ID no puede quedar activa; finalizada y pausada sí. */
export function resolveEstadoForSpot(
  spotId: string,
  preferred: EstadoOrden,
): EstadoOrden {
  if (!hasSpotId(spotId) && preferred === "activa") {
    return "pausada";
  }
  return preferred;
}

export function applyEstadoSpotRules(
  data: OrdenTransmisionForm,
): OrdenTransmisionForm {
  return {
    ...data,
    estado: resolveEstadoForSpot(data.spot_id ?? "", data.estado),
  };
}

export function validateEstadoSpotRule(data: OrdenTransmisionForm): string | null {
  if (!hasSpotId(data.spot_id) && data.estado === "activa") {
    return "Sin Spot ID la orden debe estar en pausada.";
  }
  return null;
}

export function getEstadoSelectOptions(hasSpot: boolean): SelectOption[] {
  return [
    {
      value: "activa",
      label: "Activa",
      disabled: !hasSpot,
    },
    { value: "pausada", label: "Pausada" },
    { value: "finalizada", label: "Finalizada" },
  ];
}
