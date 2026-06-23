"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FormCombobox } from "@/components/ui/FormCombobox";
import {
  ensureSelectOption,
  getAgenciaNames,
  getCiudadesForEmisora,
  getUniqueEmisoraNames,
  toSelectOptions,
} from "@/lib/catalog-form-utils";
import type { AgenciaRow, EmisoraRow } from "@/lib/types/catalogo";

interface CatalogOrderFieldsProps {
  emisoras: EmisoraRow[];
  agencias: AgenciaRow[];
  defaultEmisora?: string;
  defaultCiudad?: string;
  defaultAgencia?: string;
  catalogError?: string | null;
  formId?: string;
  catalogErrorClassName?: string;
}

export function CatalogOrderFields({
  emisoras,
  agencias,
  defaultEmisora = "",
  defaultCiudad = "",
  defaultAgencia = "",
  catalogError,
  formId = "transmission-form",
  catalogErrorClassName = "sm:col-span-2",
}: CatalogOrderFieldsProps) {
  const [emisora, setEmisora] = useState(defaultEmisora);
  const [ciudad, setCiudad] = useState(defaultCiudad);
  const [agencia, setAgencia] = useState(defaultAgencia);

  useEffect(() => {
    setEmisora(defaultEmisora);
    setCiudad(defaultCiudad);
    setAgencia(defaultAgencia);
  }, [defaultEmisora, defaultCiudad, defaultAgencia]);

  const emisoraOptions = useMemo(
    () =>
      ensureSelectOption(
        toSelectOptions(getUniqueEmisoraNames(emisoras)),
        defaultEmisora,
      ),
    [emisoras, defaultEmisora],
  );

  const ciudadOptions = useMemo(() => {
    const cities = getCiudadesForEmisora(emisoras, emisora);
    const options = toSelectOptions(cities);
    const fallbackCiudad =
      emisora.trim() === defaultEmisora.trim() ? defaultCiudad : undefined;
    return ensureSelectOption(options, fallbackCiudad);
  }, [emisoras, emisora, defaultEmisora, defaultCiudad]);

  const agenciaOptions = useMemo(
    () =>
      ensureSelectOption(
        toSelectOptions(getAgenciaNames(agencias)),
        defaultAgencia,
      ),
    [agencias, defaultAgencia],
  );

  const handleEmisoraChange = useCallback(
    (nextEmisora: string) => {
      setEmisora(nextEmisora);
      const cities = getCiudadesForEmisora(emisoras, nextEmisora);
      setCiudad((current) => {
        if (current && cities.includes(current)) return current;
        return cities.length === 1 ? cities[0] : "";
      });
    },
    [emisoras],
  );

  useEffect(() => {
    const form = document.getElementById(formId);
    if (!form) return;

    const handleReset = () => {
      setEmisora("");
      setCiudad("");
      setAgencia("");
    };

    form.addEventListener("reset", handleReset);
    return () => form.removeEventListener("reset", handleReset);
  }, [formId]);

  const ciudadDisabled = !emisora.trim() || ciudadOptions.length === 0;

  return (
    <>
      {catalogError && (
        <p
          className={`${catalogErrorClassName} text-body-sm text-on-surface-variant bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2`}
        >
          {catalogError}
        </p>
      )}

      <FormCombobox
        label="Emisora"
        name="emisora"
        value={emisora}
        onChange={handleEmisoraChange}
        options={emisoraOptions}
        required
        placeholder="Buscar emisora…"
        emptyMessage="No hay emisoras que coincidan"
      />

      <FormCombobox
        label="Ciudad"
        name="ciudad"
        value={ciudad}
        onChange={setCiudad}
        options={ciudadOptions}
        required
        disabled={ciudadDisabled}
        placeholder={
          emisora.trim()
            ? "Buscar ciudad…"
            : "Elige una emisora primero"
        }
        emptyMessage={
          emisora.trim()
            ? "No hay ciudades para esta emisora"
            : "Elige una emisora primero"
        }
      />

      <FormCombobox
        label="Agencia"
        name="agencia"
        value={agencia}
        onChange={setAgencia}
        options={agenciaOptions}
        placeholder="Buscar agencia (opcional)…"
        emptyMessage="No hay agencias que coincidan"
      />
    </>
  );
}
