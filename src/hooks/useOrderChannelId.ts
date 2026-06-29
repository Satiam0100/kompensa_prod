"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getChannelIdForEmisoraCiudad } from "@/lib/catalog-form-utils";
import type { EmisoraRow } from "@/lib/types/catalogo";

export function useOrderChannelId(
  emisoras: EmisoraRow[],
  initialChannelId = "",
) {
  const [channelId, setChannelId] = useState(initialChannelId);
  const touchedRef = useRef(false);

  useEffect(() => {
    setChannelId(initialChannelId);
    touchedRef.current = false;
  }, [initialChannelId]);

  const setChannelIdManual = useCallback((value: string) => {
    touchedRef.current = true;
    setChannelId(value);
  }, []);

  const syncFromCatalog = useCallback(
    (emisora: string, ciudad: string) => {
      if (touchedRef.current) return;
      const fromCatalog = getChannelIdForEmisoraCiudad(
        emisoras,
        emisora,
        ciudad,
      );
      if (fromCatalog) setChannelId(fromCatalog);
    },
    [emisoras],
  );

  const reset = useCallback(() => {
    setChannelId("");
    touchedRef.current = false;
  }, []);

  return { channelId, setChannelIdManual, syncFromCatalog, reset };
}
