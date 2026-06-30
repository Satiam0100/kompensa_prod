"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EditOrdenModal } from "@/components/ordenes/EditOrdenModal";
import { ORDENES_GRID_CLASS, OrdenCard } from "@/components/ordenes/OrdenCard";
import {
  FORM_FIELD_CONTROL_PLAIN,
  FORM_FIELD_INPUT,
} from "@/components/ui/form-field-classes";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import type { BulkSelection } from "@/hooks/useBulkSelection";
import type { AgenciaRow, EmisoraRow } from "@/lib/types/catalogo";
import type { OrdenTransmisionRow } from "@/lib/types/orden-transmision";

interface OrdenesListProps {
  ordenes: OrdenTransmisionRow[];
  bulk: BulkSelection;
  emisoras: EmisoraRow[];
  agencias: AgenciaRow[];
  catalogError?: string | null;
  editing: OrdenTransmisionRow | null;
  onEdit: (orden: OrdenTransmisionRow) => void;
  onCloseModal: () => void;
}

export function OrdenesList({
  ordenes,
  bulk,
  emisoras,
  agencias,
  catalogError = null,
  editing,
  onEdit,
  onCloseModal,
}: OrdenesListProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ordenes;

    return ordenes.filter(
      (o) =>
        o.cliente.toLowerCase().includes(q) ||
        o.campaña.toLowerCase().includes(q) ||
        o.emisora.toLowerCase().includes(q) ||
        (o.ciudad?.toLowerCase().includes(q) ?? false) ||
        (o.spot_name?.toLowerCase().includes(q) ?? false) ||
        (o.numero_certificado?.toLowerCase().includes(q) ?? false),
    );
  }, [ordenes, query]);

  if (ordenes.length === 0) {
    return (
      <div className="bg-surface-container border border-outline-variant rounded-lg p-12 text-center">
        <MaterialIcon
          name="inbox"
          className="text-5xl text-outline-variant mb-4"
        />
        <h2 className="text-title-md text-on-surface mb-2">
          No hay cuñas registradas
        </h2>
        <p className="text-body-sm text-on-surface-variant mb-6 max-w-md mx-auto">
          Aún no se ha guardado ninguna orden de transmisión. Crea la primera
          desde el formulario.
        </p>
        <Link
          href="/ordenes/nueva"
          className="inline-flex items-center gap-2 px-6 py-3 bg-tertiary text-on-tertiary font-bold rounded-lg hover:brightness-110 transition-all"
        >
          <MaterialIcon name="add" />
          Nueva orden
        </Link>
      </div>
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
            placeholder="Buscar por cliente, campaña, emisora, n.º certificado..."
            className={`${FORM_FIELD_INPUT} text-body-sm`}
          />
        </div>
        <p className="text-label-sm text-on-surface-variant">
          {filtered.length} de {ordenes.length} registros
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="p-8 text-center text-body-sm text-on-surface-variant bg-surface-container border border-outline-variant rounded-lg">
          Ningún resultado para &quot;{query}&quot;
        </p>
      ) : (
        <div className={ORDENES_GRID_CLASS}>
          {filtered.map((orden) => (
            <OrdenCard key={orden.id} orden={orden} bulk={bulk} onEdit={onEdit} />
          ))}
        </div>
      )}

      <EditOrdenModal
        orden={editing}
        emisoras={emisoras}
        agencias={agencias}
        catalogError={catalogError}
        onClose={onCloseModal}
      />
    </div>
  );
}
