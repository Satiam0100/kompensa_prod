import { MaterialIcon } from "@/components/ui/MaterialIcon";

interface BulkDeleteBarProps {
  selectedCount: number;
  singular: string;
  plural: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function BulkDeleteBar({
  selectedCount,
  singular,
  plural,
  onCancel,
  onConfirm,
}: BulkDeleteBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border border-error/40 bg-error-container/20">
      <p className="text-body-sm text-on-surface">
        {selectedCount === 0 ? (
          <>Selecciona {plural} para eliminar</>
        ) : selectedCount === 1 ? (
          <>1 {singular} seleccionada</>
        ) : (
          <>
            {selectedCount} {plural} seleccionadas
          </>
        )}
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-body-sm font-medium text-on-surface-variant hover:text-on-surface rounded-lg"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={selectedCount === 0}
          className="inline-flex items-center gap-2 px-5 py-2 bg-error text-on-error text-body-sm font-bold rounded-lg hover:brightness-110 disabled:opacity-50"
        >
          <MaterialIcon name="delete" className="text-sm" />
          Eliminar seleccionados
        </button>
      </div>
    </div>
  );
}
