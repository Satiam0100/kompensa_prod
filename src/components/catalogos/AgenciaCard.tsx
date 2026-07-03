import { listCardClass } from "@/components/ui/card-classes";
import { ActivaBadge } from "@/components/catalogos/ActivaBadge";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { RowSelectCheckbox } from "@/components/ui/RowSelectCheckbox";
import type { BulkSelection } from "@/hooks/useBulkSelection";
import type { AgenciaRow } from "@/lib/types/catalogo";

interface AgenciaCardProps {
  agencia: AgenciaRow;
  bulk: BulkSelection;
  onSelect: (agencia: AgenciaRow) => void;
}

function AgenciaCardContent({ agencia }: { agencia: AgenciaRow }) {
  return (
    <>
      <div className="flex justify-between items-start gap-2">
        <p className="text-body-md font-medium text-on-surface truncate min-w-0">
          {agencia.nombre}
        </p>
        <ActivaBadge activa={agencia.activa} />
      </div>

      <div className="space-y-1 text-label-sm text-on-surface-variant">
        {agencia.direccion ? (
          <p>
            <MaterialIcon
              name="location_on"
              className="text-sm mr-1 text-outline-variant align-middle"
            />
            {agencia.direccion}
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
    </>
  );
}

export function AgenciaCard({ agencia, bulk, onSelect }: AgenciaCardProps) {
  const { selecting, selectedIds, toggleSelect } = bulk;
  const selected = selecting && selectedIds.has(agencia.id);

  if (selecting) {
    return (
      <article className={listCardClass(selected)}>
        <div className="flex items-start gap-3">
          <RowSelectCheckbox
            checked={selectedIds.has(agencia.id)}
            onChange={() => toggleSelect(agencia.id)}
            label={`Seleccionar ${agencia.nombre}`}
          />
          <div className="min-w-0 flex-1">
            <AgenciaCardContent agencia={agencia} />
          </div>
        </div>
      </article>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(agencia)}
      className={`w-full text-left block ${listCardClass()} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary`}
    >
      <AgenciaCardContent agencia={agencia} />
    </button>
  );
}
