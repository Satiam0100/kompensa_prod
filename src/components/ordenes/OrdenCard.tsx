import { listCardClass } from "@/components/ui/card-classes";
import { EstadoBadge } from "@/components/ordenes/EstadoBadge";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { RowSelectCheckbox } from "@/components/ui/RowSelectCheckbox";
import type { BulkSelection } from "@/hooks/useBulkSelection";
import { formatFecha, formatPeriodo } from "@/lib/format";
import type { OrdenTransmisionRow } from "@/lib/types/orden-transmision";

export { RESPONSIVE_CARD_GRID_CLASS as ORDENES_GRID_CLASS } from "@/components/ui/responsive-card-grid";

interface OrdenCardProps {
  orden: OrdenTransmisionRow;
  bulk: BulkSelection;
  onSelect: (orden: OrdenTransmisionRow) => void;
}

function OrdenCardContent({ orden }: { orden: OrdenTransmisionRow }) {
  return (
    <>
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <p className="text-body-md font-medium text-on-surface truncate">
            {orden.cliente}
          </p>
          <p className="text-body-sm text-on-surface-variant truncate">
            {orden.campaña}
          </p>
        </div>
        <EstadoBadge estado={orden.estado} />
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
        {orden.numero_certificado && (
          <p className="text-label-mono text-on-surface">
            Cert. {orden.numero_certificado}
          </p>
        )}
      </div>

      <p className="text-label-sm text-on-surface-variant pt-1 border-t border-outline-variant/40">
        Registro: {formatFecha(orden.created_at)}
      </p>
    </>
  );
}

export function OrdenCard({ orden, bulk, onSelect }: OrdenCardProps) {
  const { selecting, selectedIds, toggleSelect } = bulk;
  const selected = selecting && selectedIds.has(orden.id);

  if (selecting) {
    return (
      <article className={listCardClass(selected)}>
        <div className="flex items-start gap-3">
          <RowSelectCheckbox
            checked={selectedIds.has(orden.id)}
            onChange={() => toggleSelect(orden.id)}
            label={`Seleccionar ${orden.cliente}`}
          />
          <div className="min-w-0 flex-1">
            <OrdenCardContent orden={orden} />
          </div>
        </div>
      </article>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(orden)}
      className={`w-full text-left block ${listCardClass()} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary`}
    >
      <OrdenCardContent orden={orden} />
    </button>
  );
}
