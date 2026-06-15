"use client";

import { useMemo, useState } from "react";
import { AgenciaCard } from "@/components/catalogos/AgenciaCard";
import { EditAgenciaModal } from "@/components/catalogos/EditAgenciaModal";
import {
  FORM_FIELD_CONTROL_PLAIN,
  FORM_FIELD_INPUT,
} from "@/components/ui/form-field-classes";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { RESPONSIVE_CARD_GRID_CLASS } from "@/components/ui/responsive-card-grid";
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
          <MaterialIcon
            name="search"
            className="shrink-0 text-outline-variant text-sm transition-colors group-hover:text-tertiary"
          />
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

      {filtered.length === 0 ? (
        <p className="p-8 text-center text-body-sm text-on-surface-variant bg-surface-container border border-outline-variant rounded-lg">
          Ningún resultado para &quot;{query}&quot;
        </p>
      ) : (
        <div className={RESPONSIVE_CARD_GRID_CLASS}>
          {filtered.map((agencia) => (
            <AgenciaCard
              key={agencia.id}
              agencia={agencia}
              bulk={bulk}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}

      <EditAgenciaModal
        creating={creating}
        agencia={editing}
        onClose={onCloseModal}
      />
    </div>
  );
}
