"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ajustarTramoAlPeriodo,
  ajustarTramosAlPeriodo,
  crearTramoLunesAViernes,
  crearTramoTodosLosDias,
  isValidDateOnly,
  parseTramosCuotas,
  totalContratadasCalculado,
  tramosCuotasPorDefecto,
} from "@/lib/meta-campana";
import type { TramoCuota } from "@/lib/types/tramo-cuota";
import {
  DIAS_SEMANA_LABELS,
  DIAS_SEMANA_LV,
  DIAS_SEMANA_TODOS,
  type DiaSemanaIso,
} from "@/lib/types/tramo-cuota";
import {
  FORM_FIELD_CONTROL_PLAIN,
  FORM_FIELD_INPUT,
} from "@/components/ui/form-field-classes";
import { FormDateField } from "@/components/ui/FormDateField";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

interface ContractTramosSectionProps {
  periodoInicio: string;
  periodoFin: string;
  cuniasDiarias: number;
  totalContratadas: number;
  initialTramos?: TramoCuota[] | null;
  /** Subsección bajo H2 (formulario) = 3; bajo H3 (modal editar) = 4. */
  headingLevel?: 3 | 4;
}

const TRAMOS_TITLE_CLASS =
  "text-label-sm text-on-surface font-medium";

function TramosHeading({
  level,
  children,
}: {
  level: 3 | 4;
  children: ReactNode;
}) {
  if (level === 4) {
    return <h4 className={TRAMOS_TITLE_CLASS}>{children}</h4>;
  }
  return <h3 className={TRAMOS_TITLE_CLASS}>{children}</h3>;
}

const ALL_DIAS: DiaSemanaIso[] = [...DIAS_SEMANA_TODOS];

type TramoPresetId = "lv-only" | "lv-periodo" | "todos-periodo";

const PRESET_CHIP_BASE =
  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-sm font-medium transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-40 disabled:pointer-events-none";

const PRESET_CHIP_ACTIVE =
  "bg-tertiary text-on-tertiary shadow-sm ring-1 ring-tertiary/30";

const PRESET_CHIP_IDLE =
  "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface border border-outline-variant/50";

const ADD_TRAMO_BTN =
  "inline-flex items-center gap-2 px-4 py-2 text-label-sm font-medium text-tertiary hover:bg-tertiary/10 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary";

function defaultTramos(
  periodoInicio: string,
  periodoFin: string,
  cuniasDiarias: number,
  initialTramos?: TramoCuota[] | null,
): TramoCuota[] {
  const parsed = parseTramosCuotas(initialTramos) ?? [];
  if (parsed.length > 0) {
    if (isValidDateOnly(periodoInicio) && isValidDateOnly(periodoFin)) {
      return ajustarTramosAlPeriodo(parsed, periodoInicio, periodoFin);
    }
    return parsed;
  }
  if (isValidDateOnly(periodoInicio) && isValidDateOnly(periodoFin)) {
    return tramosCuotasPorDefecto(periodoInicio, periodoFin, cuniasDiarias || 1);
  }
  return [];
}

function tramosIguales(a: TramoCuota[], b: TramoCuota[]): boolean {
  if (a.length !== b.length) return false;
  return a.every(
    (t, i) =>
      t.desde === b[i].desde &&
      t.hasta === b[i].hasta &&
      t.cuñas_por_dia === b[i].cuñas_por_dia &&
      t.dias_semana.length === b[i].dias_semana.length &&
      t.dias_semana.every((d, j) => d === b[i].dias_semana[j]),
  );
}

function diasCoinciden(a: DiaSemanaIso[], b: DiaSemanaIso[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) => x - y);
  const sortedB = [...b].sort((x, y) => x - y);
  return sortedA.every((d, i) => d === sortedB[i]);
}

function tramoPresetActivo(
  tramo: TramoCuota,
  periodoInicio: string,
  periodoFin: string,
  preset: TramoPresetId,
): boolean {
  if (!isValidDateOnly(periodoInicio) || !isValidDateOnly(periodoFin)) {
    return false;
  }
  const periodoCompleto =
    tramo.desde === periodoInicio && tramo.hasta === periodoFin;
  const diasLv = diasCoinciden(tramo.dias_semana, DIAS_SEMANA_LV);
  const diasTodos = diasCoinciden(tramo.dias_semana, DIAS_SEMANA_TODOS);

  switch (preset) {
    case "lv-only":
      return diasLv && !periodoCompleto;
    case "lv-periodo":
      return periodoCompleto && diasLv;
    case "todos-periodo":
      return periodoCompleto && diasTodos;
  }
}

export function ContractTramosSection({
  periodoInicio,
  periodoFin,
  cuniasDiarias,
  totalContratadas,
  initialTramos,
  headingLevel = 3,
}: ContractTramosSectionProps) {
  const [tramos, setTramos] = useState<TramoCuota[]>(() =>
    defaultTramos(periodoInicio, periodoFin, cuniasDiarias, initialTramos),
  );

  const periodoValido =
    isValidDateOnly(periodoInicio) &&
    isValidDateOnly(periodoFin) &&
    periodoFin >= periodoInicio;

  useEffect(() => {
    if (!periodoValido) return;
    setTramos((prev) => {
      if (prev.length === 0) {
        return tramosCuotasPorDefecto(
          periodoInicio,
          periodoFin,
          cuniasDiarias || 1,
        );
      }
      const ajustados = ajustarTramosAlPeriodo(
        prev,
        periodoInicio,
        periodoFin,
      );
      return tramosIguales(prev, ajustados) ? prev : ajustados;
    });
  }, [periodoInicio, periodoFin, cuniasDiarias, periodoValido]);

  const ordenPreview = useMemo(
    () => ({
      periodo_inicio: periodoInicio,
      periodo_fin: periodoFin,
      cuñas_diarias: cuniasDiarias,
      total_contratadas: totalContratadas,
      tramos_cuotas: tramos,
    }),
    [periodoInicio, periodoFin, cuniasDiarias, totalContratadas, tramos],
  );

  const totalCalculado = useMemo(() => {
    if (
      !isValidDateOnly(periodoInicio) ||
      !isValidDateOnly(periodoFin) ||
      periodoFin < periodoInicio
    ) {
      return 0;
    }
    return totalContratadasCalculado(ordenPreview);
  }, [ordenPreview, periodoInicio, periodoFin]);

  const updateTramoFecha = useCallback(
    (index: number, field: "desde" | "hasta", value: string) => {
      if (!periodoValido) return;
      setTramos((prev) =>
        prev.map((t, i) => {
          if (i !== index) return t;
          const merged = { ...t, [field]: value };
          return ajustarTramoAlPeriodo(merged, periodoInicio, periodoFin);
        }),
      );
    },
    [periodoInicio, periodoFin, periodoValido],
  );

  const updateTramo = useCallback(
    (index: number, patch: Partial<TramoCuota>) => {
      setTramos((prev) =>
        prev.map((t, i) => (i === index ? { ...t, ...patch } : t)),
      );
    },
    [],
  );

  const toggleDia = useCallback((index: number, dia: DiaSemanaIso) => {
    setTramos((prev) =>
      prev.map((t, i) => {
        if (i !== index) return t;
        const has = t.dias_semana.includes(dia);
        const dias = has
          ? t.dias_semana.filter((d) => d !== dia)
          : [...t.dias_semana, dia].sort((a, b) => a - b);
        return { ...t, dias_semana: dias as TramoCuota["dias_semana"] };
      }),
    );
  }, []);

  const addTramo = useCallback(() => {
    if (!periodoValido) return;
    const desde = periodoInicio || tramos.at(-1)?.hasta || periodoInicio;
    const hasta = periodoFin || desde;
    const nuevo = ajustarTramoAlPeriodo(
      crearTramoLunesAViernes(desde, hasta, cuniasDiarias || 1),
      periodoInicio,
      periodoFin,
    );
    setTramos((prev) => [...prev, nuevo]);
  }, [periodoInicio, periodoFin, tramos, cuniasDiarias, periodoValido]);

  const removeTramo = useCallback((index: number) => {
    setTramos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const applyTramoLvPeriodoCompleto = useCallback(
    (index: number) => {
      if (!periodoValido) return;
      setTramos((prev) =>
        prev.map((t, i) => {
          if (i !== index) return t;
          return crearTramoLunesAViernes(
            periodoInicio,
            periodoFin,
            t.cuñas_por_dia || cuniasDiarias || 1,
          );
        }),
      );
    },
    [periodoInicio, periodoFin, cuniasDiarias, periodoValido],
  );

  const applyTramoTodosLosDiasPeriodo = useCallback(
    (index: number) => {
      if (!periodoValido) return;
      setTramos((prev) =>
        prev.map((t, i) => {
          if (i !== index) return t;
          return crearTramoTodosLosDias(
            periodoInicio,
            periodoFin,
            t.cuñas_por_dia || cuniasDiarias || 1,
          );
        }),
      );
    },
    [periodoInicio, periodoFin, cuniasDiarias, periodoValido],
  );

  const hiddenValue = tramos.length > 0 ? JSON.stringify(tramos) : "";

  return (
    <div className="mt-6 border-t border-outline-variant pt-6 space-y-5">
      <input type="hidden" name="tramos_cuotas" value={hiddenValue} />

      <div className="flex items-start gap-3">
        <div className="hidden sm:flex size-9 shrink-0 items-center justify-center rounded-lg bg-tertiary/15 text-tertiary">
          <MaterialIcon name="event_available" className="text-lg" />
        </div>
        <div className="min-w-0 flex-1">
          <TramosHeading level={headingLevel}>Tramos de cuota</TramosHeading>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Cuántas cuñas aplican por día y en qué días de la semana. Las
            transmisiones fuera de esos días cuentan como compensación en el
            reporte semanal.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {tramos.map((tramo, index) => {
          const presetLvOnly = tramoPresetActivo(
            tramo,
            periodoInicio,
            periodoFin,
            "lv-only",
          );
          const presetLvPeriodo = tramoPresetActivo(
            tramo,
            periodoInicio,
            periodoFin,
            "lv-periodo",
          );
          const presetTodosPeriodo = tramoPresetActivo(
            tramo,
            periodoInicio,
            periodoFin,
            "todos-periodo",
          );

          return (
          <article
            key={index}
            className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest/40 overflow-hidden"
          >
            <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-outline-variant/40 bg-surface-container-low/80">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-tertiary/15 text-tertiary text-label-sm font-bold tabular-nums">
                  {index + 1}
                </span>
                <span className="text-label-sm font-medium text-on-surface truncate">
                  Tramo {index + 1}
                </span>
              </div>
              {tramos.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTramo(index)}
                  className="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors shrink-0"
                  aria-label={`Quitar tramo ${index + 1}`}
                >
                  <MaterialIcon name="delete" className="text-lg" />
                </button>
              )}
            </header>

            <div className="p-4 space-y-4">
              {periodoValido && (
                <p className="text-label-sm text-on-surface-variant px-1">
                  Fechas limitadas al periodo del contrato:{" "}
                  <span className="text-on-surface tabular-nums">
                    {periodoInicio} – {periodoFin}
                  </span>
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormDateField
                  label="Desde"
                  value={tramo.desde}
                  min={periodoValido ? periodoInicio : undefined}
                  max={
                    periodoValido
                      ? tramo.hasta < periodoFin
                        ? tramo.hasta
                        : periodoFin
                      : undefined
                  }
                  disabled={!periodoValido}
                  onISOChange={(iso) => updateTramoFecha(index, "desde", iso)}
                />
                <FormDateField
                  label="Hasta"
                  value={tramo.hasta}
                  min={
                    periodoValido
                      ? tramo.desde > periodoInicio
                        ? tramo.desde
                        : periodoInicio
                      : undefined
                  }
                  max={periodoValido ? periodoFin : undefined}
                  disabled={!periodoValido}
                  onISOChange={(iso) => updateTramoFecha(index, "hasta", iso)}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-sm text-on-surface-variant px-1">
                    Cuñas / día
                  </label>
                  <div className={FORM_FIELD_CONTROL_PLAIN}>
                    <MaterialIcon
                      name="repeat"
                      className="shrink-0 text-outline-variant text-sm"
                    />
                    <input
                      type="number"
                      min={0}
                      value={tramo.cuñas_por_dia}
                      onChange={(e) =>
                        updateTramo(index, {
                          cuñas_por_dia: Number(e.target.value) || 0,
                        })
                      }
                      className={`${FORM_FIELD_INPUT} text-body-sm`}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-label-sm text-on-surface-variant px-1">
                  Días de transmisión
                </p>
                <div
                  className="flex flex-wrap gap-2 px-0.5"
                  role="group"
                  aria-label={`Plantillas del tramo ${index + 1}`}
                >
                  <button
                    type="button"
                    disabled={!periodoValido}
                    aria-pressed={presetLvOnly}
                    onClick={() =>
                      updateTramo(index, {
                        dias_semana: [...DIAS_SEMANA_LV],
                      })
                    }
                    className={`${PRESET_CHIP_BASE} ${
                      presetLvOnly ? PRESET_CHIP_ACTIVE : PRESET_CHIP_IDLE
                    }`}
                  >
                    <MaterialIcon name="schedule" className="text-base shrink-0" />
                    Solo L–V
                  </button>
                  <button
                    type="button"
                    disabled={!periodoValido}
                    aria-pressed={presetLvPeriodo}
                    onClick={() => applyTramoLvPeriodoCompleto(index)}
                    className={`${PRESET_CHIP_BASE} ${
                      presetLvPeriodo ? PRESET_CHIP_ACTIVE : PRESET_CHIP_IDLE
                    }`}
                  >
                    <MaterialIcon
                      name="event_available"
                      className="text-base shrink-0"
                    />
                    <span className="hidden sm:inline">L–V · periodo completo</span>
                    <span className="sm:hidden">L–V periodo</span>
                  </button>
                  <button
                    type="button"
                    disabled={!periodoValido}
                    aria-pressed={presetTodosPeriodo}
                    onClick={() => applyTramoTodosLosDiasPeriodo(index)}
                    className={`${PRESET_CHIP_BASE} ${
                      presetTodosPeriodo ? PRESET_CHIP_ACTIVE : PRESET_CHIP_IDLE
                    }`}
                  >
                    <MaterialIcon
                      name="calendar_today"
                      className="text-base shrink-0"
                    />
                    Todos los días
                  </button>
                </div>
                <div
                  className="grid grid-cols-7 gap-1 sm:gap-1.5"
                  role="group"
                  aria-label={`Días del tramo ${index + 1}`}
                >
                  {ALL_DIAS.map((dia) => {
                    const active = tramo.dias_semana.includes(dia);
                    return (
                      <button
                        key={dia}
                        type="button"
                        onClick={() => toggleDia(index, dia)}
                        aria-pressed={active}
                        className={`flex items-center justify-center py-2.5 rounded-lg text-label-sm font-medium transition-all active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary ${
                          active
                            ? "bg-tertiary text-on-tertiary shadow-sm"
                            : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/40"
                        }`}
                      >
                        {DIAS_SEMANA_LABELS[dia]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </article>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addTramo}
        disabled={!periodoValido}
        className={`${ADD_TRAMO_BTN} disabled:opacity-40 disabled:pointer-events-none`}
      >
        <MaterialIcon name="add" className="text-base" />
        Añadir tramo
      </button>

      {periodoValido && (
        <div className="flex items-center gap-3 rounded-lg border border-outline-variant/60 bg-surface-container-low px-4 py-3">
          <MaterialIcon
            name="functions"
            className="text-tertiary text-lg shrink-0"
          />
          <p className="text-body-sm text-on-surface-variant">
            Total calculado desde tramos:{" "}
            <strong className="text-on-surface font-semibold tabular-nums">
              {totalCalculado}
            </strong>
            {totalContratadas > 0 && totalCalculado !== totalContratadas && (
              <span className="text-tertiary ml-1.5">
                · total contratadas en contrato: {totalContratadas}
                {totalCalculado > totalContratadas &&
                  " (el acumulado de campaña se limita a ese tope)"}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
