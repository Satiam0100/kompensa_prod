"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { crearOrdenesTransmision } from "@/app/actions/ordenes";
import { FormDateField } from "@/components/ui/FormDateField";
import { FormCombobox } from "@/components/ui/FormCombobox";
import {
  FormField,
  SectionCard,
} from "@/components/ui/FormField";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { useOrderEstadoSpot } from "@/hooks/useOrderEstadoSpot";
import {
  getAgenciaNames,
  toSelectOptions,
} from "@/lib/catalog-form-utils";
import {
  applyEstadoSpotRules,
  parseEmisoraLineas,
  parseOrdenFormDataCompartido,
  validateOrdenFormMulti,
} from "@/lib/parse-orden-form";
import type { AgenciaRow, EmisoraRow } from "@/lib/types/catalogo";
import { AdvancedParamsSection } from "./AdvancedParamsSection";
import { EmisorasOrderLines } from "./EmisorasOrderLines";
import { OrderEstadoField } from "./OrderEstadoField";

type SubmitState = "idle" | "loading" | "success" | "error";

interface TransmissionOrderFormProps {
  emisoras?: EmisoraRow[];
  agencias?: AgenciaRow[];
  catalogError?: string | null;
}

export function TransmissionOrderForm({
  emisoras = [],
  agencias = [],
  catalogError = null,
}: TransmissionOrderFormProps) {
  const router = useRouter();
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [agencia, setAgencia] = useState("");
  const {
    spotId,
    setSpotId,
    estado,
    setEstado,
    resetFrom,
  } = useOrderEstadoSpot("", "pausada");

  const agenciaOptions = useMemo(
    () => toSelectOptions(getAgenciaNames(agencias)),
    [agencias],
  );

  useEffect(() => {
    const form = document.getElementById("transmission-form");
    if (!form) return;

    const handleReset = () => {
      setAgencia("");
    };

    form.addEventListener("reset", handleReset);
    return () => form.removeEventListener("reset", handleReset);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      const form = e.currentTarget;

      if (!form.checkValidity()) {
        e.preventDefault();
        form.reportValidity();
        return;
      }

      e.preventDefault();

      const formData = new FormData(form);
      const compartido = applyEstadoSpotRules(
        parseOrdenFormDataCompartido(formData),
      );
      const lineas = parseEmisoraLineas(formData);
      const validationError = validateOrdenFormMulti(
        compartido,
        lineas,
        formData,
      );

      if (validationError) {
        setSubmitState("error");
        setErrorMessage(validationError);
        return;
      }

      setSubmitState("loading");
      setErrorMessage(null);

      const result = await crearOrdenesTransmision(compartido, lineas);

      if (result.success) {
        setSubmitState("success");
        setTimeout(() => {
          router.push("/ordenes");
          router.refresh();
        }, 1200);
      } else {
        setSubmitState("error");
        setErrorMessage(result.error);
      }
    },
    [router],
  );

  const handleReset = useCallback(() => {
    const form = document.getElementById(
      "transmission-form",
    ) as HTMLFormElement | null;
    form?.reset();
    setAgencia("");
    resetFrom("", "pausada");
    setSubmitState("idle");
    setErrorMessage(null);
  }, [resetFrom]);

  return (
    <>
      <form
        className="grid grid-cols-1 md:grid-cols-12 gap-6"
        id="transmission-form"
        onSubmit={handleSubmit}
      >
        <SectionCard
          title="Identificación de Campaña"
          icon="badge"
          colSpan="md:col-span-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {catalogError && (
              <p className="sm:col-span-2 text-body-sm text-on-surface-variant bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2">
                {catalogError}
              </p>
            )}

            <FormField
              label="Cliente"
              name="cliente"
              required
              placeholder="Ej. Corporación Global"
            />
            <FormField
              label="Campaña"
              name="campana"
              required
              placeholder="Nombre del proyecto"
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
            <FormField
              label="Email Cliente"
              name="email_cliente"
              type="email"
              required
              placeholder="email@dominio.com"
            />
            <FormField
              label="Teléfono Cliente (WhatsApp)"
              name="telefono_cliente"
              type="tel"
              required
              icon="phone"
              placeholder="58"
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Operación"
          icon="settings_input_component"
          iconVariant="tertiary"
          colSpan="md:col-span-4"
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col gap-4">
            <OrderEstadoField
              spotId={spotId}
              estado={estado}
              onEstadoChange={setEstado}
            />
            <FormField
              label="N.º de certificado"
              name="numero_certificado"
              icon="verified"
              placeholder="Ej. CERT-2026-001"
              className="font-label-mono"
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Detalles del Contrato"
          icon="history_edu"
          colSpan="md:col-span-12"
          decorationIcon="description"
          className="mb-0"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FormField
              label="Cuñas Diarias"
              name="cunias_diarias"
              type="number"
              required
              min={1}
              icon="repeat"
              placeholder="0"
            />
            <FormField
              label="Total Contratadas"
              name="total_contratadas"
              type="number"
              required
              min={1}
              icon="functions"
              placeholder="0"
            />
            <FormDateField
              label="Periodo Inicio"
              name="periodo_inicio"
              required
            />
            <FormDateField
              label="Periodo Fin"
              name="periodo_fin"
              required
            />
          </div>
          <div className="mt-6">
            <FormField
              label="Horario de Transmisión"
              name="horario"
              icon="schedule"
              placeholder="Ej. 06:00 - 12:00, 18:00 - 22:00"
            />
          </div>
          <p className="mt-4 text-body-sm text-on-surface-variant">
            El certificado PDF se envía al email del cliente cuando termina el
            periodo (fecha fin) y se ejecuta el Flujo B en n8n.
          </p>
        </SectionCard>

        <SectionCard
          title="Emisoras"
          icon="radio"
          colSpan="md:col-span-12"
          className="mb-0"
        >
          <p className="text-body-sm text-on-surface-variant mb-4">
            Añade una o más emisoras. Se creará una orden por cada fila con los
            mismos datos de campaña.
          </p>
          <EmisorasOrderLines emisoras={emisoras} />
        </SectionCard>

        <AdvancedParamsSection
          showChannelId={false}
          onSpotIdChange={setSpotId}
        />

        {errorMessage && (
          <p className="md:col-span-12 text-error text-body-sm px-2">
            {errorMessage}
          </p>
        )}

        <div className="md:col-span-12 flex flex-col sm:flex-row items-center justify-end gap-4 mt-4 mb-20">
          <button
            type="button"
            className="w-full sm:w-auto px-8 py-3 text-body-md font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-all rounded-lg"
            onClick={handleReset}
          >
            Cancelar
          </button>
          <SubmitButton state={submitState} />
        </div>
      </form>
    </>
  );
}

function SubmitButton({ state }: { state: SubmitState }) {
  if (state === "loading") {
    return (
      <button
        type="submit"
        disabled
        className="w-full sm:w-auto px-10 py-3 bg-tertiary text-on-tertiary text-body-md font-bold rounded-lg flex items-center justify-center gap-2 opacity-80"
      >
        <MaterialIcon name="sync" className="animate-spin" />
        Procesando...
      </button>
    );
  }

  if (state === "success") {
    return (
      <button
        type="button"
        disabled
        className="w-full sm:w-auto px-10 py-3 bg-green-600 text-white text-body-md font-bold rounded-lg flex items-center justify-center gap-2"
      >
        <MaterialIcon name="check_circle" />
        Órdenes creadas
      </button>
    );
  }

  return (
    <button
      type="submit"
      className="w-full sm:w-auto px-10 py-3 bg-tertiary text-on-tertiary text-body-md font-bold rounded-lg shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
    >
      <MaterialIcon name="save" filled />
      Guardar órdenes
    </button>
  );
}
