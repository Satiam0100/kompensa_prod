"use client";

import { useMemo, useState } from "react";
import { EditEmisoraModal } from "@/components/catalogos/EditEmisoraModal";
import { EmisoraCard } from "@/components/catalogos/EmisoraCard";
import {
  FORM_FIELD_CONTROL_PLAIN,
  FORM_FIELD_INPUT,
} from "@/components/ui/form-field-classes";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { RESPONSIVE_CARD_GRID_CLASS } from "@/components/ui/responsive-card-grid";
import type { BulkSelection } from "@/hooks/useBulkSelection";
import type { EmisoraRow } from "@/lib/types/catalogo";

interface EmisorasListProps {
  emisoras: EmisoraRow[];
  creating: boolean;
  selected: EmisoraRow | null;
  editMode: boolean;
  bulk: BulkSelection;
  onCreate: () => void;
  onSelect: (emisora: EmisoraRow) => void;
  onCloseModal: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
}

export function EmisorasList({
  emisoras,
  creating,
  selected,
  editMode,
  bulk,
  onCreate,
  onSelect,
  onCloseModal,
  onStartEdit,
  onCancelEdit,
}: EmisorasListProps) {
  const [query, setQuery] = useState("");

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
          <h2 className="text-title-md text-on-surface mb-2">
            No hay emisoras registradas
          </h2>
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
          emisora={selected}
          editMode={editMode}
          onClose={onCloseModal}
          onStartEdit={onStartEdit}
          onCancelEdit={onCancelEdit}
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className={`${FORM_FIELD_CONTROL_PLAIN} flex-1 max-w-md`}>
          <MaterialIcon
            name="search"
            className="shrink-0 text-outline-variant text-sm transition-colors group-hover:text-tertiary"
          />
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

      {filtered.length === 0 ? (
        <p className="p-8 text-center text-body-sm text-on-surface-variant bg-surface-container border border-outline-variant rounded-lg">
          Ningún resultado para &quot;{query}&quot;
        </p>
      ) : (
        <div className={RESPONSIVE_CARD_GRID_CLASS}>
          {filtered.map((emisora) => (
            <EmisoraCard
              key={emisora.id}
              emisora={emisora}
              bulk={bulk}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}

      <EditEmisoraModal
        creating={creating}
        emisora={selected}
        editMode={editMode}
        onClose={onCloseModal}
        onStartEdit={onStartEdit}
        onCancelEdit={onCancelEdit}
      />
    </div>
  );
}
