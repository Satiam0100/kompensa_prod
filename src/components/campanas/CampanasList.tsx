"use client";

import { useMemo, useState } from "react";
import {
  CAMPANAS_GRID_CLASS,
  CampanaCard,
} from "@/components/campanas/CampanaCard";
import {
  FORM_FIELD_CONTROL_PLAIN,
  FORM_FIELD_INPUT,
} from "@/components/ui/form-field-classes";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import type { CampanaConEstado, EstadoCumplimiento } from "@/lib/types/campana-estado";

const ESTADO_ORDER: Record<string, number> = {
  atrasado: 0,
  sin_monitoreo: 1,
  en_compensacion: 2,
  cumple: 3,
};

type FiltroEstado = "todos" | EstadoCumplimiento | "sin_monitoreo";

interface CampanasListProps {
  campanas: CampanaConEstado[];
}

export function CampanasList({ campanas }: CampanasListProps) {
  const [query, setQuery] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = campanas.filter((c) => {
      if (filtroEstado === "todos") return true;
      if (filtroEstado === "sin_monitoreo") return c.metricas.sin_monitoreo;
      return c.estado_cumplimiento === filtroEstado;
    });

    if (q) {
      list = list.filter(
        (c) =>
          c.cliente.toLowerCase().includes(q) ||
          c.campaña.toLowerCase().includes(q) ||
          c.emisora.toLowerCase().includes(q) ||
          (c.ciudad?.toLowerCase().includes(q) ?? false),
      );
    }

    return [...list].sort((a, b) => {
      const keyA = a.metricas.sin_monitoreo
        ? "sin_monitoreo"
        : (a.estado_cumplimiento ?? "sin_monitoreo");
      const keyB = b.metricas.sin_monitoreo
        ? "sin_monitoreo"
        : (b.estado_cumplimiento ?? "sin_monitoreo");
      const orderDiff = (ESTADO_ORDER[keyA] ?? 9) - (ESTADO_ORDER[keyB] ?? 9);
      if (orderDiff !== 0) return orderDiff;
      return b.metricas.porcentaje_cumplimiento - a.metricas.porcentaje_cumplimiento;
    });
  }, [campanas, query, filtroEstado]);

  if (campanas.length === 0) {
    return (
      <div className="bg-surface-container border border-outline-variant rounded-lg p-12 text-center">
        <MaterialIcon
          name="search"
          className="text-5xl text-outline-variant mb-4"
        />
        <h3 className="text-title-md text-on-surface mb-2">
          No hay campañas para monitorear
        </h3>
        <p className="text-body-sm text-on-surface-variant max-w-md mx-auto">
          Registra órdenes de transmisión y ejecuta el Flujo B para ver el
          cumplimiento aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div className={`${FORM_FIELD_CONTROL_PLAIN} flex-1 max-w-md`}>
          <MaterialIcon
            name="search"
            className="shrink-0 text-outline-variant text-sm"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por cliente, campaña, emisora..."
            className={`${FORM_FIELD_INPUT} text-body-sm`}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["todos", "Todas"],
              ["atrasado", "Atrasadas"],
              ["cumple", "Cumplen"],
              ["en_compensacion", "Compensación"],
              ["sin_monitoreo", "Sin datos"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFiltroEstado(value)}
              className={`px-3 py-1.5 rounded-full text-label-sm transition-colors ${
                filtroEstado === value
                  ? "bg-tertiary text-on-tertiary font-medium"
                  : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-label-sm text-on-surface-variant">
        {filtered.length} de {campanas.length} campañas
      </p>

      {filtered.length === 0 ? (
        <p className="p-8 text-center text-body-sm text-on-surface-variant bg-surface-container border border-outline-variant rounded-lg">
          Ningún resultado con los filtros actuales
        </p>
      ) : (
        <div className={CAMPANAS_GRID_CLASS}>
          {filtered.map((campana) => (
            <CampanaCard key={campana.id} campana={campana} />
          ))}
        </div>
      )}
    </div>
  );
}
