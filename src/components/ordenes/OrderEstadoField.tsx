"use client";

import { FormSelect } from "@/components/ui/FormSelect";
import {
  ESTADO_SIN_SPOT_MENSAJE,
  getEstadoSelectOptions,
} from "@/lib/orden-estado-spot";
import type { EstadoOrden } from "@/lib/types/orden-transmision";

interface OrderEstadoFieldProps {
  spotId: string;
  estado: EstadoOrden;
  onEstadoChange: (estado: EstadoOrden) => void;
  className?: string;
}

export function OrderEstadoField({
  spotId,
  estado,
  onEstadoChange,
  className = "",
}: OrderEstadoFieldProps) {
  const hasSpot = Boolean(spotId.trim());

  return (
    <div className={className}>
      <FormSelect
        label="Estado"
        name="estado"
        value={estado}
        onChange={(value) => onEstadoChange(value as EstadoOrden)}
        options={getEstadoSelectOptions(hasSpot)}
      />
      {!hasSpot && (
        <p className="text-body-sm text-on-surface-variant px-1 mt-1.5">
          {ESTADO_SIN_SPOT_MENSAJE}
        </p>
      )}
    </div>
  );
}
