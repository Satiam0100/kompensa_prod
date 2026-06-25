import { listCardClass } from "@/components/ui/card-classes";
import { ActivaBadge } from "@/components/catalogos/ActivaBadge";
import { EditRowButton } from "@/components/ui/EditRowButton";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { RowSelectCheckbox } from "@/components/ui/RowSelectCheckbox";
import type { BulkSelection } from "@/hooks/useBulkSelection";
import type { AgenciaRow } from "@/lib/types/catalogo";

function Field({ value }: { value: string | null | undefined }) {
  if (!value?.trim()) return null;
  return <>{value}</>;
}

interface AgenciaCardProps {
  agencia: AgenciaRow;
  bulk: BulkSelection;
  onEdit: (agencia: AgenciaRow) => void;
}

export function AgenciaCard({ agencia, bulk, onEdit }: AgenciaCardProps) {
  const { selecting, selectedIds, toggleSelect } = bulk;
  const selected = selecting && selectedIds.has(agencia.id);

  return (
    <article className={listCardClass(selected)}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-start gap-3 min-w-0">
          {selecting && (
            <RowSelectCheckbox
              checked={selectedIds.has(agencia.id)}
              onChange={() => toggleSelect(agencia.id)}
              label={`Seleccionar ${agencia.nombre}`}
            />
          )}
          <p className="text-body-md font-medium text-on-surface truncate">
            {agencia.nombre}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ActivaBadge activa={agencia.activa} />
          {!selecting && (
            <EditRowButton
              onClick={() => onEdit(agencia)}
              label={`Editar ${agencia.nombre}`}
            />
          )}
        </div>
      </div>

      <div className="space-y-1 text-label-sm text-on-surface-variant">
        {agencia.direccion ? (
          <p>
            <MaterialIcon
              name="location_on"
              className="text-sm mr-1 text-outline-variant align-middle"
            />
            <Field value={agencia.direccion} />
          </p>
        ) : (
          <p className="text-on-surface-variant/60">Sin dirección</p>
        )}
        {agencia.clientes ? (
          <p>Clientes: {agencia.clientes}</p>
        ) : (
          <p className="text-on-surface-variant/60">Sin clientes registrados</p>
        )}
      </div>

      {(agencia.email || agencia.telefono) && (
        <div className="space-y-0.5 text-label-sm text-on-surface-variant pt-1 border-t border-outline-variant/40">
          {agencia.email && <p>{agencia.email}</p>}
          {agencia.telefono && <p>{agencia.telefono}</p>}
        </div>
      )}
    </article>
  );
}
