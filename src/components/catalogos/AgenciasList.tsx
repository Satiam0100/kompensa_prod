"use client";

import { useMemo, useState } from "react";
import { ActivaBadge } from "@/components/catalogos/ActivaBadge";
import { EditAgenciaModal } from "@/components/catalogos/EditAgenciaModal";
import { EditRowButton } from "@/components/ui/EditRowButton";
import {
  FORM_FIELD_CONTROL_PLAIN,
  FORM_FIELD_INPUT,
} from "@/components/ui/form-field-classes";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { RowSelectCheckbox } from "@/components/ui/RowSelectCheckbox";
import type { BulkSelection } from "@/hooks/useBulkSelection";
import type { AgenciaRow } from "@/lib/types/catalogo";

interface AgenciasListProps {
  agencias: AgenciaRow[];
  creating: boolean;
  editing: AgenciaRow | null;
  bulk: BulkSelection;
  onCreate: () => void;
  onEdit: (agencia: AgenciaRow) => void;
  onCloseModal: () => void;
}

function Cell({ value }: { value: string | null | undefined }) {
  if (!value?.trim()) {
    return <span className="text-on-surface-variant/60">—</span>;
  }
  return <>{value}</>;
}

export function AgenciasList({
  agencias,
  creating,
  editing,
  bulk,
  onCreate,
  onEdit,
  onCloseModal,
}: AgenciasListProps) {
  const [query, setQuery] = useState("");
  const { selecting, selectedIds, toggleSelect } = bulk;

  const rowHighlight = (id: string) =>
    selecting && selectedIds.has(id)
      ? "bg-error-container/20 ring-1 ring-inset ring-error/30"
      : "";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return agencias;

    return agencias.filter(
      (a) =>
        a.nombre.toLowerCase().includes(q) ||
        (a.direccion?.toLowerCase().includes(q) ?? false) ||
        (a.clientes?.toLowerCase().includes(q) ?? false) ||
        (a.email?.toLowerCase().includes(q) ?? false) ||
        (a.telefono?.toLowerCase().includes(q) ?? false),
    );
  }, [agencias, query]);

  if (agencias.length === 0) {
    return (
      <>
        <div className="bg-surface-container border border-outline-variant rounded-lg p-12 text-center">
          <MaterialIcon
            name="business"
            className="text-5xl text-outline-variant mb-4"
          />
          <h3 className="text-title-md text-on-surface mb-2">
            No hay agencias registradas
          </h3>
          <p className="text-body-sm text-on-surface-variant mb-6 max-w-md mx-auto">
            Aún no hay agencias en el catálogo. Agrega la primera desde el
            formulario.
          </p>
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center gap-2 px-6 py-3 bg-tertiary text-on-tertiary font-bold rounded-lg hover:brightness-110 transition-all"
          >
            <MaterialIcon name="add" />
            Agregar agencia
          </button>
        </div>
        <EditAgenciaModal
          creating={creating}
          agencia={editing}
          onClose={onCloseModal}
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className={`${FORM_FIELD_CONTROL_PLAIN} flex-1 max-w-md`}>
          <MaterialIcon name="search" className="shrink-0 text-outline-variant text-sm transition-colors group-hover:text-tertiary" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, dirección, clientes..."
            className={`${FORM_FIELD_INPUT} text-body-sm`}
          />
        </div>
        <p className="text-label-sm text-on-surface-variant">
          {filtered.length} de {agencias.length} agencias
        </p>
      </div>

      <div className="hidden lg:block bg-surface-container border border-outline-variant rounded-lg overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[720px]">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low">
              {selecting && (
                <th className="w-12 px-4 py-3">
                  <span className="sr-only">Seleccionar</span>
                </th>
              )}
              <th className="px-4 py-3 text-label-sm text-on-surface-variant font-medium">
                Agencia
              </th>
              <th className="px-4 py-3 text-label-sm text-on-surface-variant font-medium">
                Dirección
              </th>
              <th className="px-4 py-3 text-label-sm text-on-surface-variant font-medium">
                Clientes
              </th>
              <th className="px-4 py-3 text-label-sm text-on-surface-variant font-medium">
                Contacto
              </th>
              <th className="px-4 py-3 text-label-sm text-on-surface-variant font-medium">
                Estado
              </th>
              {!selecting && (
                <th className="px-4 py-3 text-label-sm text-on-surface-variant font-medium">
                  <span className="sr-only">Acciones</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((agencia) => (
              <tr
                key={agencia.id}
                className={`border-b border-outline-variant/60 hover:bg-surface-container-high/50 transition-colors ${rowHighlight(agencia.id)}`}
              >
                {selecting && (
                  <td className="px-4 py-4">
                    <RowSelectCheckbox
                      checked={selectedIds.has(agencia.id)}
                      onChange={() => toggleSelect(agencia.id)}
                      label={`Seleccionar ${agencia.nombre}`}
                    />
                  </td>
                )}
                <td className="px-4 py-4">
                  <p className="text-body-md text-on-surface font-medium">
                    {agencia.nombre}
                  </p>
                </td>
                <td className="px-4 py-4 text-body-sm text-on-surface-variant">
                  <Cell value={agencia.direccion} />
                </td>
                <td className="px-4 py-4 text-body-sm text-on-surface-variant max-w-xs">
                  <Cell value={agencia.clientes} />
                </td>
                <td className="px-4 py-4 text-body-sm text-on-surface-variant">
                  <Cell value={agencia.email} />
                  {agencia.telefono && (
                    <span className="block text-label-sm mt-0.5">
                      {agencia.telefono}
                    </span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <ActivaBadge activa={agencia.activa} />
                </td>
                {!selecting && (
                  <td className="px-4 py-4">
                    <EditRowButton
                      onClick={() => onEdit(agencia)}
                      label={`Editar ${agencia.nombre}`}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="p-8 text-center text-body-sm text-on-surface-variant">
            Ningún resultado para &quot;{query}&quot;
          </p>
        )}
      </div>

      <div className="lg:hidden grid gap-3">
        {filtered.map((agencia) => (
          <article
            key={agencia.id}
            className={`bg-surface-container border border-outline-variant rounded-lg p-4 space-y-2 ${rowHighlight(agencia.id)}`}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-start gap-3 min-w-0">
                {selecting && (
                  <RowSelectCheckbox
                    checked={selectedIds.has(agencia.id)}
                    onChange={() => toggleSelect(agencia.id)}
                    label={`Seleccionar ${agencia.nombre}`}
                  />
                )}
                <p className="text-body-md font-medium text-on-surface">
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
            {agencia.direccion && (
              <p className="text-body-sm text-on-surface-variant">
                <MaterialIcon
                  name="location_on"
                  className="text-sm mr-1 text-outline-variant align-middle"
                />
                {agencia.direccion}
              </p>
            )}
            {agencia.clientes && (
              <p className="text-label-sm text-on-surface-variant">
                Clientes: {agencia.clientes}
              </p>
            )}
          </article>
        ))}
      </div>

      <EditAgenciaModal
        creating={creating}
        agencia={editing}
        onClose={onCloseModal}
      />
    </div>
  );
}
