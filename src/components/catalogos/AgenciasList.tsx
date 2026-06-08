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
import type { AgenciaRow } from "@/lib/types/catalogo";

interface AgenciasListProps {
  agencias: AgenciaRow[];
}

function Cell({ value }: { value: string | null | undefined }) {
  if (!value?.trim()) {
    return <span className="text-on-surface-variant/60">—</span>;
  }
  return <>{value}</>;
}

export function AgenciasList({ agencias }: AgenciasListProps) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<AgenciaRow | null>(null);

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
      <div className="bg-surface-container border border-outline-variant rounded-lg p-12 text-center">
        <MaterialIcon
          name="business"
          className="text-5xl text-outline-variant mb-4"
        />
        <h3 className="text-title-md text-on-surface mb-2">
          No hay agencias registradas
        </h3>
        <p className="text-body-sm text-on-surface-variant max-w-md mx-auto">
          El catálogo de agencias está vacío. Importa los datos desde Supabase o
          el Excel de referencia.
        </p>
      </div>
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
              <th className="px-4 py-3 text-label-sm text-on-surface-variant font-medium">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((agencia) => (
              <tr
                key={agencia.id}
                className="border-b border-outline-variant/60 hover:bg-surface-container-high/50 transition-colors"
              >
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
                <td className="px-4 py-4">
                  <EditRowButton
                    onClick={() => setEditing(agencia)}
                    label={`Editar ${agencia.nombre}`}
                  />
                </td>
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
            className="bg-surface-container border border-outline-variant rounded-lg p-4 space-y-2"
          >
            <div className="flex justify-between items-start gap-2">
              <p className="text-body-md font-medium text-on-surface">
                {agencia.nombre}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <ActivaBadge activa={agencia.activa} />
                <EditRowButton
                  onClick={() => setEditing(agencia)}
                  label={`Editar ${agencia.nombre}`}
                />
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
        agencia={editing}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}
