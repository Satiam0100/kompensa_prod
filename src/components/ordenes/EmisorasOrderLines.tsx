"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FormCombobox } from "@/components/ui/FormCombobox";
import { FormField } from "@/components/ui/FormField";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import {
  getChannelIdForEmisoraCiudad,
  getCiudadesForEmisora,
  getUniqueEmisoraNames,
  toSelectOptions,
} from "@/lib/catalog-form-utils";
import {
  emisoraLineFieldName,
  ORDEN_FORM_NAMES,
} from "@/lib/parse-orden-form";
import type { EmisoraRow } from "@/lib/types/catalogo";

interface EmisoraLineState {
  key: string;
  emisora: string;
  ciudad: string;
  channelId: string;
  channelTouched: boolean;
}

const INITIAL_EMISORA_LINE_KEY = "emisora-line-initial";

function createLine(key?: string): EmisoraLineState {
  return {
    key: key ?? crypto.randomUUID(),
    emisora: "",
    ciudad: "",
    channelId: "",
    channelTouched: false,
  };
}

interface EmisorasOrderLinesProps {
  emisoras: EmisoraRow[];
  formId?: string;
}

export function EmisorasOrderLines({
  emisoras,
  formId = "transmission-form",
}: EmisorasOrderLinesProps) {
  const [lines, setLines] = useState<EmisoraLineState[]>(() => [
    createLine(INITIAL_EMISORA_LINE_KEY),
  ]);

  const emisoraOptions = useMemo(
    () => toSelectOptions(getUniqueEmisoraNames(emisoras)),
    [emisoras],
  );

  const syncChannelFromCatalog = useCallback(
    (line: EmisoraLineState): EmisoraLineState => {
      if (line.channelTouched) return line;
      const fromCatalog = getChannelIdForEmisoraCiudad(
        emisoras,
        line.emisora,
        line.ciudad,
      );
      return {
        ...line,
        channelId: fromCatalog ?? "",
      };
    },
    [emisoras],
  );

  const updateLine = useCallback(
    (key: string, patch: Partial<EmisoraLineState>) => {
      setLines((prev) =>
        prev.map((line) => {
          if (line.key !== key) return line;
          const next = { ...line, ...patch };
          return syncChannelFromCatalog(next);
        }),
      );
    },
    [syncChannelFromCatalog],
  );

  const handleEmisoraChange = useCallback(
    (key: string, emisora: string) => {
      setLines((prev) =>
        prev.map((line) => {
          if (line.key !== key) return line;
          const cities = getCiudadesForEmisora(emisoras, emisora);
          const ciudad =
            line.ciudad && cities.includes(line.ciudad)
              ? line.ciudad
              : cities.length === 1
                ? cities[0]
                : "";
          return syncChannelFromCatalog({
            ...line,
            emisora,
            ciudad,
          });
        }),
      );
    },
    [emisoras, syncChannelFromCatalog],
  );

  const addLine = useCallback(() => {
    setLines((prev) => [...prev, createLine()]);
  }, []);

  const removeLine = useCallback((key: string) => {
    setLines((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((line) => line.key !== key);
    });
  }, []);

  useEffect(() => {
    const form = document.getElementById(formId);
    if (!form) return;

    const handleReset = () => {
      setLines([createLine(INITIAL_EMISORA_LINE_KEY)]);
    };

    form.addEventListener("reset", handleReset);
    return () => form.removeEventListener("reset", handleReset);
  }, [formId]);

  return (
    <div className="space-y-4">
      <input
        type="hidden"
        name={ORDEN_FORM_NAMES.emisora_line_count}
        value={String(lines.length)}
      />

      {lines.map((line, index) => {
        const ciudadOptions = toSelectOptions(
          getCiudadesForEmisora(emisoras, line.emisora),
        );
        const ciudadDisabled =
          !line.emisora.trim() || ciudadOptions.length === 0;

        return (
          <div
            key={line.key}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-lg border border-outline-variant/60 bg-surface-container-lowest/40"
          >
            <div className="flex items-center justify-between md:hidden">
              <span className="text-label-sm text-on-surface-variant font-medium tabular-nums">
                Emisora {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeLine(line.key)}
                disabled={lines.length <= 1}
                className="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-surface-variant disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label={`Quitar emisora ${index + 1}`}
              >
                <MaterialIcon name="delete" className="text-lg" />
              </button>
            </div>

            <div className="hidden md:flex md:col-span-1 items-end pb-1">
              <span className="text-label-sm text-on-surface-variant font-medium tabular-nums">
                {index + 1}
              </span>
            </div>

            <div className="md:col-span-4 min-w-0">
              <FormCombobox
                label="Emisora"
                name={emisoraLineFieldName(index, "emisora")}
                value={line.emisora}
                onChange={(value) => handleEmisoraChange(line.key, value)}
                options={emisoraOptions}
                required
                placeholder="Buscar emisora…"
                emptyMessage="No hay emisoras que coincidan"
              />
            </div>

            <div className="md:col-span-4 min-w-0">
              <FormCombobox
                label="Ciudad"
                name={emisoraLineFieldName(index, "ciudad")}
                value={line.ciudad}
                onChange={(value) => updateLine(line.key, { ciudad: value })}
                options={ciudadOptions}
                required
                disabled={ciudadDisabled}
                placeholder={
                  line.emisora.trim()
                    ? "Buscar ciudad…"
                    : "Elige emisora primero"
                }
                emptyMessage={
                  line.emisora.trim()
                    ? "No hay ciudades para esta emisora"
                    : "Elige emisora primero"
                }
              />
            </div>

            <div className="md:col-span-2 min-w-0">
              <FormField
                label="Channel ID"
                name={emisoraLineFieldName(index, "channel_id")}
                value={line.channelId}
                onChange={(event) =>
                  updateLine(line.key, {
                    channelId: event.target.value,
                    channelTouched: true,
                  })
                }
                placeholder="Auto"
                className="font-label-mono"
              />
            </div>

            <div className="hidden md:flex md:col-span-1 items-end justify-end pb-1">
              <button
                type="button"
                onClick={() => removeLine(line.key)}
                disabled={lines.length <= 1}
                className="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-surface-variant disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label={`Quitar emisora ${index + 1}`}
              >
                <MaterialIcon name="delete" className="text-lg" />
              </button>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addLine}
        className="inline-flex items-center gap-2 px-4 py-2 text-label-sm font-medium text-tertiary hover:bg-tertiary/10 rounded-lg transition-colors"
      >
        <MaterialIcon name="add" className="text-base" />
        Añadir emisora
      </button>
    </div>
  );
}
