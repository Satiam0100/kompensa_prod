import { listCardClass } from "@/components/ui/card-classes";
import { EstadoBadge } from "@/components/ordenes/EstadoBadge";
import { EditRowButton } from "@/components/ui/EditRowButton";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { RowSelectCheckbox } from "@/components/ui/RowSelectCheckbox";
import type { BulkSelection } from "@/hooks/useBulkSelection";
import { formatFecha, formatPeriodo } from "@/lib/format";
import type { OrdenTransmisionRow } from "@/lib/types/orden-transmision";

export { RESPONSIVE_CARD_GRID_CLASS as ORDENES_GRID_CLASS } from "@/components/ui/responsive-card-grid";

interface OrdenCardProps {
  orden: OrdenTransmisionRow;
  bulk: BulkSelection;
  onEdit: (orden: OrdenTransmisionRow) => void;
}

export function OrdenCard({ orden, bulk, onEdit }: OrdenCardProps) {
  const { selecting, selectedIds, toggleSelect } = bulk;
  const selected = selecting && selectedIds.has(orden.id);

  return (
    <article className={listCardClass(selected)}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-start gap-3 min-w-0">
          {selecting && (
            <RowSelectCheckbox
              checked={selectedIds.has(orden.id)}
              onChange={() => toggleSelect(orden.id)}
              label={`Seleccionar ${orden.cliente}`}
            />
          )}
          <div className="min-w-0">
            <p className="text-body-md font-medium text-on-surface truncate">
              {orden.cliente}
            </p>
            <p className="text-body-sm text-on-surface-variant truncate">
              {orden.campaña}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <EstadoBadge estado={orden.estado} />
          {!selecting && (
            <EditRowButton
              onClick={() => onEdit(orden)}
              label={`Editar ${orden.cliente}`}
            />
          )}
        </div>
      </div>

      <div className="space-y-1 text-label-sm text-on-surface-variant">
        <p>
          <MaterialIcon
            name="radio"
            className="text-sm mr-1 text-outline-variant align-middle"
          />
          {orden.emisora}
          {orden.ciudad && (
            <span className="text-on-surface-variant"> · {orden.ciudad}</span>
          )}
        </p>
        <p className="text-label-mono text-on-surface">
          {orden.cuñas_diarias}/día · {orden.total_contratadas} total
        </p>
        <p>{formatPeriodo(orden.periodo_inicio, orden.periodo_fin)}</p>
      </div>

      <p className="text-label-sm text-on-surface-variant pt-1 border-t border-outline-variant/40">
        Registro: {formatFecha(orden.created_at)}
      </p>
    </article>
  );
}
