"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EstadoBadge } from "@/components/ordenes/EstadoBadge";
import { EditRowButton } from "@/components/ui/EditRowButton";
import {
  FORM_FIELD_CONTROL_PLAIN,
  FORM_FIELD_INPUT,
} from "@/components/ui/form-field-classes";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { formatFecha, formatPeriodo } from "@/lib/format";
import type { OrdenTransmisionRow } from "@/lib/types/orden-transmision";

interface OrdenesListProps {
  ordenes: OrdenTransmisionRow[];
}

export function OrdenesList({ ordenes }: OrdenesListProps) {
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
        (o.spot_name?.toLowerCase().includes(q) ?? false),
    );
  }, [ordenes, query]);

  if (ordenes.length === 0) {
    return (
      <div className="bg-surface-container border border-outline-variant rounded-lg p-12 text-center">
        <MaterialIcon
          name="inbox"
          className="text-5xl text-outline-variant mb-4"
        />
        <h3 className="text-title-md text-on-surface mb-2">
          No hay cuñas registradas
        </h3>
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
          <MaterialIcon name="search" className="shrink-0 text-outline-variant text-sm transition-colors group-hover:text-tertiary" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por cliente, campaña, emisora..."
            className={`${FORM_FIELD_INPUT} text-body-sm`}
          />
        </div>
        <p className="text-label-sm text-on-surface-variant">
          {filtered.length} de {ordenes.length} registros
        </p>
      </div>

      <div className="hidden lg:block bg-surface-container border border-outline-variant rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low">
              <th className="px-4 py-3 text-label-sm text-on-surface-variant font-medium">
                Cliente / Campaña
              </th>
              <th className="px-4 py-3 text-label-sm text-on-surface-variant font-medium">
                Emisora
              </th>
              <th className="px-4 py-3 text-label-sm text-on-surface-variant font-medium">
                Cuñas
              </th>
              <th className="px-4 py-3 text-label-sm text-on-surface-variant font-medium">
                Periodo
              </th>
              <th className="px-4 py-3 text-label-sm text-on-surface-variant font-medium">
                Estado
              </th>
              <th className="px-4 py-3 text-label-sm text-on-surface-variant font-medium">
                Registro
              </th>
              <th className="px-4 py-3 text-label-sm text-on-surface-variant font-medium">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((orden) => (
              <tr
                key={orden.id}
                className="border-b border-outline-variant/60 hover:bg-surface-container-high/50 transition-colors"
              >
                <td className="px-4 py-4">
                  <p className="text-body-md text-on-surface font-medium">
                    {orden.cliente}
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    {orden.campaña}
                  </p>
                </td>
                <td className="px-4 py-4 text-body-sm text-on-surface">
                  {orden.emisora}
                  {orden.ciudad && (
                    <span className="block text-on-surface-variant text-label-sm">
                      {orden.ciudad}
                    </span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <span className="text-label-mono text-on-surface">
                    {orden.cuñas_diarias}/día
                  </span>
                  <span className="block text-label-sm text-on-surface-variant">
                    {orden.total_contratadas} total
                  </span>
                </td>
                <td className="px-4 py-4 text-body-sm text-on-surface-variant">
                  {formatPeriodo(orden.periodo_inicio, orden.periodo_fin)}
                </td>
                <td className="px-4 py-4">
                  <EstadoBadge estado={orden.estado} />
                </td>
                <td className="px-4 py-4 text-label-sm text-on-surface-variant">
                  {formatFecha(orden.created_at)}
                </td>
                <td className="px-4 py-4">
                  <EditRowButton
                    href={`/ordenes/${orden.id}/editar`}
                    label={`Editar ${orden.cliente}`}
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
        {filtered.map((orden) => (
          <article
            key={orden.id}
            className="bg-surface-container border border-outline-variant rounded-lg p-4 space-y-3"
          >
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="text-body-md font-medium text-on-surface">
                  {orden.cliente}
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  {orden.campaña}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <EstadoBadge estado={orden.estado} />
                <EditRowButton
                  href={`/ordenes/${orden.id}/editar`}
                  label={`Editar ${orden.cliente}`}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-label-sm text-on-surface-variant">
              <span>
                <MaterialIcon
                  name="radio"
                  className="text-sm mr-1 text-outline-variant"
                />
                {orden.emisora}
              </span>
              <span className="text-right text-label-mono text-on-surface">
                {orden.cuñas_diarias}/día · {orden.total_contratadas} total
              </span>
            </div>
            <p className="text-label-sm text-on-surface-variant">
              {formatPeriodo(orden.periodo_inicio, orden.periodo_fin)}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
