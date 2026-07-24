"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { consultarReconocimiento } from "@/app/actions/reconocimiento";
import { ReconocimientoGrupoCard } from "@/components/reconocimiento/ReconocimientoGrupoCard";
import { FormDateField } from "@/components/ui/FormDateField";
import {
  FORM_FIELD_CONTROL_PLAIN,
  FORM_FIELD_INPUT,
} from "@/components/ui/form-field-classes";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { RESPONSIVE_CARD_GRID_CLASS } from "@/components/ui/responsive-card-grid";
import { RECONOCIMIENTO_MAX_DIAS } from "@/lib/reconocimiento/types";
import type { ReconocimientoGrupo } from "@/lib/reconocimiento/types";

export function ReconocimientoPanel() {
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [grupos, setGrupos] = useState<ReconocimientoGrupo[] | null>(null);
  const [totalDetecciones, setTotalDetecciones] = useState(0);
  const [rangoBuscado, setRangoBuscado] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  const handleBuscar = useCallback(() => {
    setError(null);
    setQuery("");
    startTransition(async () => {
      const result = await consultarReconocimiento(inicio, fin);
      if (!result.success) {
        setError(result.error);
        setGrupos(null);
        setRangoBuscado(null);
        return;
      }
      setGrupos(result.grupos);
      setTotalDetecciones(result.totalDetecciones);
      setRangoBuscado({ start: result.startDate, end: result.endDate });
    });
  }, [inicio, fin]);

  const handleRefrescar = useCallback(() => {
    setInicio("");
    setFin("");
    setQuery("");
    setError(null);
    setGrupos(null);
    setTotalDetecciones(0);
    setRangoBuscado(null);
  }, []);

  const filtered = useMemo(() => {
    if (!grupos) return null;
    const q = query.trim().toLowerCase();
    if (!q) return grupos;
    return grupos.filter(
      (g) =>
        g.spot_name.toLowerCase().includes(q) ||
        g.channel_name.toLowerCase().includes(q) ||
        g.city.toLowerCase().includes(q) ||
        g.spot_id.toLowerCase().includes(q) ||
        g.channel_id.toLowerCase().includes(q),
    );
  }, [grupos, query]);

  const canSearch = Boolean(inicio && fin) && !pending;

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-display-lg text-on-surface mb-2">Reconocimiento</h1>
        <p className="text-body-lg text-on-surface-variant">
          Consulta las cuñas detectadas por la API en un rango de fechas (máx.{" "}
          {RECONOCIMIENTO_MAX_DIAS} días). Cada tarjeta es una combinación de
          emisora, spot y ciudad.
        </p>
      </div>

      <div className="bg-surface-container border border-outline-variant rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <FormDateField
            label="Desde"
            required
            value={inicio}
            onISOChange={setInicio}
            max={fin || undefined}
          />
          <FormDateField
            label="Hasta"
            required
            value={fin}
            onISOChange={setFin}
            min={inicio || undefined}
          />
          <button
            type="button"
            onClick={handleBuscar}
            disabled={!canSearch}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-tertiary text-on-tertiary font-bold rounded-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {pending ? (
              <MaterialIcon name="sync" className="animate-spin" />
            ) : (
              <MaterialIcon name="search" />
            )}
            {pending ? "Buscando…" : "Buscar"}
          </button>
        </div>
        {error && (
          <p className="text-error text-body-sm" role="alert">
            {error}
          </p>
        )}
      </div>

      {grupos === null && !pending && !error && (
        <div className="bg-surface-container border border-outline-variant rounded-lg p-12 text-center">
          <MaterialIcon
            name="settings_input_antenna"
            className="text-5xl text-outline-variant mb-4"
          />
          <h2 className="text-title-md text-on-surface mb-2">
            Elige un rango y busca
          </h2>
          <p className="text-body-sm text-on-surface-variant max-w-md mx-auto">
            No se consulta la API hasta que pulses Buscar.
          </p>
        </div>
      )}

      {pending && (
        <p className="text-body-sm text-on-surface-variant px-1">
          Consultando detecciones…
        </p>
      )}

      {filtered !== null && !pending && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            {grupos && grupos.length > 0 && (
              <div className={`${FORM_FIELD_CONTROL_PLAIN} flex-1 max-w-md`}>
                <MaterialIcon
                  name="search"
                  className="shrink-0 text-outline-variant text-sm transition-colors group-hover:text-tertiary"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filtrar por spot, emisora, ciudad o ID…"
                  className={`${FORM_FIELD_INPUT} text-body-sm`}
                  aria-label="Filtrar resultados"
                />
              </div>
            )}
            <button
              type="button"
              onClick={handleRefrescar}
              className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 font-bold rounded-lg border border-outline-variant bg-surface-container-high text-on-surface hover:border-outline active:scale-[0.98] transition-all"
              aria-label="Limpiar y empezar de nuevo"
            >
              <MaterialIcon name="sync" />
              Refrescar
            </button>
          </div>

          <p className="text-label-sm text-on-surface-variant">
            {filtered.length}
            {grupos && query.trim() ? ` de ${grupos.length}` : ""} campaña
            {filtered.length === 1 ? "" : "s"} · {totalDetecciones} detección
            {totalDetecciones === 1 ? "" : "es"}
            {rangoBuscado
              ? ` · ${rangoBuscado.start} → ${rangoBuscado.end}`
              : ""}
          </p>

          {grupos && grupos.length === 0 ? (
            <p className="p-8 text-center text-body-sm text-on-surface-variant bg-surface-container border border-outline-variant rounded-lg">
              No hay detecciones en ese rango.
            </p>
          ) : filtered.length === 0 ? (
            <p className="p-8 text-center text-body-sm text-on-surface-variant bg-surface-container border border-outline-variant rounded-lg">
              Ningún resultado para &quot;{query.trim()}&quot;
            </p>
          ) : (
            <div className={RESPONSIVE_CARD_GRID_CLASS}>
              {filtered.map((g) => (
                <ReconocimientoGrupoCard key={g.key} grupo={g} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
