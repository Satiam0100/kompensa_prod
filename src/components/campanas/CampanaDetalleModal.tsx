"use client";

import { useEffect, useState } from "react";
import { obtenerCampanaDetalle } from "@/app/actions/campanas";
import { CampanaDetalleView } from "@/components/campanas/CampanaDetalleView";
import { EditModal } from "@/components/ui/EditModal";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import type { CampanaDetalle } from "@/lib/types/campana-estado";

interface CampanaDetalleModalProps {
  campanaId: string | null;
  onClose: () => void;
}

export function CampanaDetalleModal({
  campanaId,
  onClose,
}: CampanaDetalleModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campana, setCampana] = useState<CampanaDetalle | null>(null);

  useEffect(() => {
    if (!campanaId) {
      setCampana(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setCampana(null);

    obtenerCampanaDetalle(campanaId).then((result) => {
      if (cancelled) return;
      setLoading(false);
      if (result.success) {
        setCampana(result.data);
      } else {
        setError(result.error);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [campanaId]);

  const open = Boolean(campanaId);
  const title = campana
    ? `${campana.cliente} — ${campana.campaña}`
    : "Detalle de campaña";

  return (
    <EditModal open={open} title={title} onClose={onClose} maxWidth="6xl">
      {loading && (
        <div className="flex justify-center py-12">
          <MaterialIcon
            name="sync"
            className="animate-spin text-tertiary text-3xl"
          />
        </div>
      )}
      {error && <p className="text-error text-body-sm">{error}</p>}
      {campana && <CampanaDetalleView campana={campana} embedded />}
    </EditModal>
  );
}
