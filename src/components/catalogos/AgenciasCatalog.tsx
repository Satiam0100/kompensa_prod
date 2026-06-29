"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { eliminarAgencias } from "@/app/actions/catalogos";
import { AgenciasList } from "@/components/catalogos/AgenciasList";
import { BulkDeleteBar } from "@/components/ui/BulkDeleteBar";
import { CatalogHeaderActions } from "@/components/ui/CatalogHeaderActions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import type { AgenciaRow } from "@/lib/types/catalogo";

interface AgenciasCatalogProps {
  agencias: AgenciaRow[];
}

export function AgenciasCatalog({ agencias }: AgenciasCatalogProps) {
  const router = useRouter();
  const bulk = useBulkSelection();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AgenciaRow | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const closeModal = () => {
    setCreating(false);
    setEditing(null);
  };

  const handleConfirmDelete = useCallback(async () => {
    bulk.setDeleting(true);
    setDeleteError(null);

    const result = await eliminarAgencias([...bulk.selectedIds]);

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
          <h2 className="text-display-lg text-on-surface mb-2">Agencias</h2>
          <p className="text-body-lg text-on-surface-variant">
            Catálogo de agencias de publicidad importado desde la base de datos.
          </p>
        </div>
        <CatalogHeaderActions
          addLabel="Agregar agencia"
          onAdd={() => {
            setEditing(null);
            setCreating(true);
          }}
          selecting={bulk.selecting}
          onToggleDeleteMode={bulk.toggleSelecting}
          deleteDisabled={agencias.length === 0}
        />
      </div>

      {bulk.selecting && agencias.length > 0 && (
        <div className="mb-4 space-y-2">
          <BulkDeleteBar
            selectedCount={bulk.selectedCount}
            singular="agencia"
            plural="agencias"
            onCancel={bulk.cancelSelecting}
            onConfirm={bulk.requestDelete}
          />
          {deleteError && (
            <p className="text-error text-body-sm px-1">{deleteError}</p>
          )}
        </div>
      )}

      <AgenciasList
        agencias={agencias}
        creating={creating}
        editing={editing}
        bulk={bulk}
        onCreate={() => {
          setEditing(null);
          setCreating(true);
        }}
        onEdit={(agencia) => {
          setCreating(false);
          setEditing(agencia);
        }}
        onCloseModal={closeModal}
      />

      <ConfirmDialog
        open={bulk.confirmOpen}
        title="Confirmar eliminación"
        message={
          bulk.selectedCount === 1 ? (
            <>¿Eliminar la agencia seleccionada? Esta acción no se puede deshacer.</>
          ) : (
            <>
              ¿Eliminar las {bulk.selectedCount} agencias seleccionadas? Esta
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
