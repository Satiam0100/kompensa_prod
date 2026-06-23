"use client";

import { useCallback, useEffect, useState } from "react";
import { resolveEstadoForSpot } from "@/lib/orden-estado-spot";
import type { EstadoOrden } from "@/lib/types/orden-transmision";

export function useOrderEstadoSpot(
  initialSpotId = "",
  initialEstado: EstadoOrden = "pausada",
) {
  const [spotId, setSpotId] = useState(initialSpotId);
  const [estado, setEstado] = useState<EstadoOrden>(() =>
    resolveEstadoForSpot(initialSpotId, initialEstado),
  );

  const resetFrom = useCallback(
    (nextSpotId: string, nextEstado: EstadoOrden = "pausada") => {
      setSpotId(nextSpotId);
      setEstado(resolveEstadoForSpot(nextSpotId, nextEstado));
    },
    [],
  );

  useEffect(() => {
    if (!spotId.trim() && estado === "activa") {
      setEstado("pausada");
    }
  }, [spotId, estado]);

  return {
    spotId,
    setSpotId,
    estado,
    setEstado,
    resetFrom,
    hasSpotId: Boolean(spotId.trim()),
  };
}
