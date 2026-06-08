"use client";

import { useMemo, useState } from "react";
import { ActivaBadge } from "@/components/catalogos/ActivaBadge";
import { EditEmisoraModal } from "@/components/catalogos/EditEmisoraModal";
import { EditRowButton } from "@/components/ui/EditRowButton";
import {
  FORM_FIELD_CONTROL_PLAIN,
  FORM_FIELD_INPUT,
} from "@/components/ui/form-field-classes";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { RowSelectCheckbox } from "@/components/ui/RowSelectCheckbox";
import type { BulkSelection } from "@/hooks/useBulkSelection";
import type { EmisoraRow } from "@/lib/types/catalogo";

interface EmisorasListProps {
  emisoras: EmisoraRow[];
  creating: boolean;
  editing: EmisoraRow | null;
  bulk: BulkSelection;
  onCreate: () => void;
  onEdit: (emisora: EmisoraRow) => void;
  onCloseModal: () => void;
}

function Cell({ value }: { value: string | null | undefined }) {
  if (!value?.trim()) {
    return <span className="text-on-surface-variant/60">—</span>;
  }
  return <>{value}</>;
}

export function EmisorasList({
  emisoras,
  creating,
  editing,
  bulk,
  onCreate,
  onEdit,
  onCloseModal,
}: EmisorasListProps) {
  const [query, setQuery] = useState("");
  const { selecting, selectedIds, toggleSelect } = bulk;

  const rowHighlight = (id: string) =>
    selecting && selectedIds.has(id)
      ? "bg-error-container/20 ring-1 ring-inset ring-error/30"
      : "";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return emisoras;

    return emisoras.filter(
      (e) =>
        e.nombre.toLowerCase().includes(q) ||
        (e.ciudad?.toLowerCase().includes(q) ?? false) ||
        (e.circuito?.toLowerCase().includes(q) ?? false) ||
        (e.contacto?.toLowerCase().includes(q) ?? false) ||
        (e.email?.toLowerCase().includes(q) ?? false) ||
        (e.whatsapp?.includes(q) ?? false),
    );
  }, [emisoras, query]);

  if (emisoras.length === 0) {
    return (
      <>
        <div className="bg-surface-container border border-outline-variant rounded-lg p-12 text-center">
          <MaterialIcon
            name="radio"
            className="text-5xl text-outline-variant mb-4"
          />
          <h3 className="text-title-md text-on-surface mb-2">
            No hay emisoras registradas
          </h3>
          <p className="text-body-sm text-on-surface-variant mb-6 max-w-md mx-auto">
            Aún no hay emisoras en el catálogo. Agrega la primera desde el
            formulario.
          </p>
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center gap-2 px-6 py-3 bg-tertiary text-on-tertiary font-bold rounded-lg hover:brightness-110 transition-all"
          >
            <MaterialIcon name="add" />
            Agregar emisora
          </button>
        </div>
        <EditEmisoraModal
          creating={creating}
          emisora={editing}
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
            placeholder="Buscar por nombre, ciudad, circuito..."
            className={`${FORM_FIELD_INPUT} text-body-sm`}
          />
        </div>
        <p className="text-label-sm text-on-surface-variant">
          {filtered.length} de {emisoras.length} emisoras
        </p>
      </div>

      <div className="hidden lg:block bg-surface-container border border-outline-variant rounded-lg overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[880px]">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low">
              {selecting && (
                <th className="w-12 px-4 py-3">
                  <span className="sr-only">Seleccionar</span>
                </th>
              )}
              <th className="px-4 py-3 text-label-sm text-on-surface-variant font-medium">
                Emisora
              </th>
              <th className="px-4 py-3 text-label-sm text-on-surface-variant font-medium">
                Ciudad
              </th>
              <th className="px-4 py-3 text-label-sm text-on-surface-variant font-medium">
                Circuito / Tipo
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
            {filtered.map((emisora) => (
              <tr
                key={emisora.id}
                className={`border-b border-outline-variant/60 hover:bg-surface-container-high/50 transition-colors ${rowHighlight(emisora.id)}`}
              >
                {selecting && (
                  <td className="px-4 py-4">
                    <RowSelectCheckbox
                      checked={selectedIds.has(emisora.id)}
                      onChange={() => toggleSelect(emisora.id)}
                      label={`Seleccionar ${emisora.nombre}`}
                    />
                  </td>
                )}
                <td className="px-4 py-4">
                  <p className="text-body-md text-on-surface font-medium">
                    {emisora.nombre}
                  </p>
                  {emisora.channel_id && (
                    <p className="text-label-sm text-on-surface-variant font-label-mono">
                      ID: {emisora.channel_id}
                    </p>
                  )}
                </td>
                <td className="px-4 py-4 text-body-sm text-on-surface-variant">
                  <Cell value={emisora.ciudad} />
                </td>
                <td className="px-4 py-4 text-body-sm text-on-surface-variant">
                  <Cell value={emisora.circuito} />
                  {emisora.tipo && (
                    <span className="block text-label-sm mt-0.5">
                      Tipo: {emisora.tipo}
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 text-body-sm text-on-surface-variant">
                  <Cell value={emisora.contacto} />
                  {emisora.email && (
                    <span className="block text-label-sm mt-0.5">
                      {emisora.email}
                    </span>
                  )}
                  {emisora.whatsapp && (
                    <span className="block text-label-sm mt-0.5 font-label-mono">
                      WA: {emisora.whatsapp}
                    </span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <ActivaBadge activa={emisora.activa} />
                </td>
                {!selecting && (
                  <td className="px-4 py-4">
                    <EditRowButton
                      onClick={() => onEdit(emisora)}
                      label={`Editar ${emisora.nombre}`}
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
        {filtered.map((emisora) => (
          <article
            key={emisora.id}
            className={`bg-surface-container border border-outline-variant rounded-lg p-4 space-y-2 ${rowHighlight(emisora.id)}`}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-start gap-3 min-w-0">
                {selecting && (
                  <RowSelectCheckbox
                    checked={selectedIds.has(emisora.id)}
                    onChange={() => toggleSelect(emisora.id)}
                    label={`Seleccionar ${emisora.nombre}`}
                  />
                )}
                <p className="text-body-md font-medium text-on-surface">
                  {emisora.nombre}
                </p>
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
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-label-sm text-on-surface-variant">
              {emisora.ciudad && <span>{emisora.ciudad}</span>}
              {emisora.circuito && <span>Circuito: {emisora.circuito}</span>}
            </div>
            {emisora.contacto && (
              <p className="text-label-sm text-on-surface-variant">
                {emisora.contacto}
              </p>
            )}
          </article>
        ))}
      </div>

      <EditEmisoraModal
        creating={creating}
        emisora={editing}
        onClose={onCloseModal}
      />
    </div>
  );
}
