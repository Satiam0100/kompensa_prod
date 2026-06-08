"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { eliminarEmisoras } from "@/app/actions/catalogos";
import { EmisorasList } from "@/components/catalogos/EmisorasList";
import { BulkDeleteBar } from "@/components/ui/BulkDeleteBar";
import { CatalogHeaderActions } from "@/components/ui/CatalogHeaderActions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import type { EmisoraRow } from "@/lib/types/catalogo";

interface EmisorasCatalogProps {
  emisoras: EmisoraRow[];
}

export function EmisorasCatalog({ emisoras }: EmisorasCatalogProps) {
  const router = useRouter();
  const bulk = useBulkSelection();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<EmisoraRow | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const closeModal = () => {
    setCreating(false);
    setEditing(null);
  };

  const handleConfirmDelete = useCallback(async () => {
    bulk.setDeleting(true);
    setDeleteError(null);

    const result = await eliminarEmisoras([...bulk.selectedIds]);

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
          <h2 className="text-display-lg text-on-surface mb-2">Emisoras</h2>
          <p className="text-body-lg text-on-surface-variant">
            Catálogo de emisoras y canales de radio disponibles en el sistema.
          </p>
        </div>
        <CatalogHeaderActions
          addLabel="Agregar emisora"
          onAdd={() => {
            setEditing(null);
            setCreating(true);
          }}
          selecting={bulk.selecting}
          onToggleDeleteMode={bulk.toggleSelecting}
          deleteDisabled={emisoras.length === 0}
        />
      </div>

      {bulk.selecting && emisoras.length > 0 && (
        <div className="mb-4 space-y-2">
          <BulkDeleteBar
            selectedCount={bulk.selectedCount}
            singular="emisora"
            plural="emisoras"
            onCancel={bulk.cancelSelecting}
            onConfirm={bulk.requestDelete}
          />
          {deleteError && (
            <p className="text-error text-body-sm px-1">{deleteError}</p>
          )}
        </div>
      )}

      <EmisorasList
        emisoras={emisoras}
        creating={creating}
        editing={editing}
        bulk={bulk}
        onCreate={() => {
          setEditing(null);
          setCreating(true);
        }}
        onEdit={(emisora) => {
          setCreating(false);
          setEditing(emisora);
        }}
        onCloseModal={closeModal}
      />

      <ConfirmDialog
        open={bulk.confirmOpen}
        title="Confirmar eliminación"
        message={
          bulk.selectedCount === 1 ? (
            <>¿Eliminar la emisora seleccionada? Esta acción no se puede deshacer.</>
          ) : (
            <>
              ¿Eliminar las {bulk.selectedCount} emisoras seleccionadas? Esta
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
