"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { eliminarOrdenesTransmision } from "@/app/actions/ordenes";
import { OrdenesList } from "@/components/ordenes/OrdenesList";
import { BulkDeleteBar } from "@/components/ui/BulkDeleteBar";
import { CatalogHeaderActions } from "@/components/ui/CatalogHeaderActions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import type { OrdenTransmisionRow } from "@/lib/types/orden-transmision";

interface OrdenesCatalogProps {
  ordenes: OrdenTransmisionRow[];
}

export function OrdenesCatalog({ ordenes }: OrdenesCatalogProps) {
  const router = useRouter();
  const bulk = useBulkSelection();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleConfirmDelete = useCallback(async () => {
    bulk.setDeleting(true);
    setDeleteError(null);

    const result = await eliminarOrdenesTransmision([...bulk.selectedIds]);

    bulk.setDeleting(false);

    if (result.success) {
      bulk.finishDelete();
      router.refresh();
    } else {
      bulk.closeConfirm();
      setDeleteError(result.error);
    }
  }, [bulk, router]);

  return (
    <>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-display-lg text-on-surface mb-2">
            Cuñas registradas
          </h2>
          <p className="text-body-lg text-on-surface-variant">
            Consulta todas las órdenes de transmisión guardadas en el sistema.
          </p>
        </div>
        <CatalogHeaderActions
          addHref="/ordenes/nueva"
          addLabel="Nueva orden"
          selecting={bulk.selecting}
          onToggleDeleteMode={bulk.toggleSelecting}
          deleteDisabled={ordenes.length === 0}
        />
      </div>

      {bulk.selecting && ordenes.length > 0 && (
        <div className="mb-4 space-y-2">
          <BulkDeleteBar
            selectedCount={bulk.selectedCount}
            singular="orden"
            plural="órdenes"
            onCancel={bulk.cancelSelecting}
            onConfirm={bulk.requestDelete}
          />
          {deleteError && (
            <p className="text-error text-body-sm px-1">{deleteError}</p>
          )}
        </div>
      )}

      <OrdenesList ordenes={ordenes} bulk={bulk} />

      <ConfirmDialog
        open={bulk.confirmOpen}
        title="Confirmar eliminación"
        message={
          bulk.selectedCount === 1 ? (
            <>
              ¿Eliminar la orden seleccionada? Esta acción no se puede deshacer.
            </>
          ) : (
            <>
              ¿Eliminar las {bulk.selectedCount} órdenes seleccionadas? Esta
              acción no se puede deshacer.
            </>
          )
        }
        loading={bulk.deleting}
        onConfirm={handleConfirmDelete}
        onCancel={bulk.closeConfirm}
      />
    </>
  );
}
