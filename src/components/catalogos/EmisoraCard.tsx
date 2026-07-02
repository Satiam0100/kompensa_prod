import { listCardClass } from "@/components/ui/card-classes";
import { ActivaBadge } from "@/components/catalogos/ActivaBadge";
import { EditRowButton } from "@/components/ui/EditRowButton";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { RowSelectCheckbox } from "@/components/ui/RowSelectCheckbox";
import type { BulkSelection } from "@/hooks/useBulkSelection";
import type { EmisoraRow } from "@/lib/types/catalogo";

interface EmisoraCardProps {
  emisora: EmisoraRow;
  bulk: BulkSelection;
  onEdit: (emisora: EmisoraRow) => void;
}

export function EmisoraCard({ emisora, bulk, onEdit }: EmisoraCardProps) {
  const { selecting, selectedIds, toggleSelect } = bulk;
  const selected = selecting && selectedIds.has(emisora.id);

  return (
    <article className={listCardClass(selected)}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-start gap-3 min-w-0">
          {selecting && (
            <RowSelectCheckbox
              checked={selectedIds.has(emisora.id)}
              onChange={() => toggleSelect(emisora.id)}
              label={`Seleccionar ${emisora.nombre}`}
            />
          )}
          <div className="min-w-0">
            <p className="text-body-md font-medium text-on-surface truncate">
              {emisora.nombre}
            </p>
            {emisora.channel_id && (
              <p className="text-label-sm text-on-surface-variant font-label-mono truncate">
                ID: {emisora.channel_id}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ActivaBadge activa={emisora.activa} />
          {!selecting && (
            <EditRowButton
              onClick={() => onEdit(emisora)}
              label={`Editar ${emisora.nombre}`}
            />
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-label-sm text-on-surface-variant">
        {emisora.ciudad ? (
          <span>
            <MaterialIcon
              name="location_on"
              className="text-sm mr-1 text-outline-variant align-middle"
            />
            {emisora.ciudad}
          </span>
        ) : (
          <span className="text-on-surface-variant/60">Sin ciudad</span>
        )}
        {emisora.circuito && <span>Circuito: {emisora.circuito}</span>}
        {emisora.tipo && <span>Tipo: {emisora.tipo}</span>}
      </div>

      {(emisora.contacto || emisora.email || emisora.whatsapp) && (
        <div className="space-y-0.5 text-label-sm text-on-surface-variant pt-1 border-t border-outline-variant/40">
          {emisora.contacto && <p>{emisora.contacto}</p>}
          {emisora.email && <p>{emisora.email}</p>}
          {emisora.whatsapp && <p className="font-label-mono">{emisora.whatsapp}</p>}
        </div>
      )}
    </article>
  );
}
