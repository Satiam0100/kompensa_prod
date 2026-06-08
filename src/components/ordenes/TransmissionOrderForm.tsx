"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  actualizarOrdenTransmision,
  crearOrdenTransmision,
} from "@/app/actions/ordenes";
import { FormDateField } from "@/components/ui/FormDateField";
import {
  FormField,
  SectionCard,
} from "@/components/ui/FormField";
import { FormSelect } from "@/components/ui/FormSelect";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import {
  parseOrdenFormData,
  validateOrdenForm,
} from "@/lib/parse-orden-form";
import type { OrdenTransmisionRow } from "@/lib/types/orden-transmision";
import { AdvancedParamsSection } from "./AdvancedParamsSection";

type SubmitState = "idle" | "loading" | "success" | "error";

interface TransmissionOrderFormProps {
  orden?: OrdenTransmisionRow;
}

export function TransmissionOrderForm({ orden }: TransmissionOrderFormProps) {
  const router = useRouter();
  const isEdit = Boolean(orden);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const formData = new FormData(form);
      const data = parseOrdenFormData(formData);
      const validationError = validateOrdenForm(data, formData);

      if (validationError) {
        setSubmitState("error");
        setErrorMessage(validationError);
        return;
      }

      setSubmitState("loading");
      setErrorMessage(null);

      const result = isEdit
        ? await actualizarOrdenTransmision(orden!.id, data)
        : await crearOrdenTransmision(data);

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
    [isEdit, orden, router],
  );

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
            <FormField
              label="Cliente"
              name="cliente"
              required
              placeholder="Ej. Corporación Global"
              defaultValue={orden?.cliente}
            />
            <FormField
              label="Campaña"
              name="campana"
              required
              placeholder="Nombre del proyecto"
              defaultValue={orden?.campaña}
            />
            <FormField
              label="Emisora"
              name="emisora"
              required
              placeholder="Frecuencia / Nombre"
              defaultValue={orden?.emisora}
            />
            <FormField
              label="Ciudad"
              name="ciudad"
              placeholder="Ubicación geográfica"
              defaultValue={orden?.ciudad ?? ""}
            />
            <FormField
              label="Agencia"
              name="agencia"
              placeholder="Agencia aliada"
              defaultValue={orden?.agencia ?? ""}
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
            <FormSelect
              label="Estado"
              name="estado"
              defaultValue={orden?.estado ?? "activa"}
              options={[
                { value: "activa", label: "Activa" },
                { value: "pausada", label: "Pausada" },
                { value: "finalizada", label: "Finalizada" },
              ]}
            />
            <FormField
              label="Email Cliente"
              name="email_cliente"
              type="email"
              required
              placeholder="email@dominio.com"
              defaultValue={orden?.email_cliente}
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
              defaultValue={orden?.cuñas_diarias}
            />
            <FormField
              label="Total Contratadas"
              name="total_contratadas"
              type="number"
              required
              min={1}
              icon="functions"
              placeholder="0"
              defaultValue={orden?.total_contratadas}
            />
            <FormDateField
              label="Periodo Inicio"
              name="periodo_inicio"
              required
              defaultValue={orden?.periodo_inicio}
            />
            <FormDateField
              label="Periodo Fin"
              name="periodo_fin"
              required
              defaultValue={orden?.periodo_fin}
            />
          </div>
          <div className="mt-6">
            <FormField
              label="Horario de Transmisión"
              name="horario"
              icon="schedule"
              placeholder="Ej. 06:00 - 12:00, 18:00 - 22:00"
              defaultValue={orden?.horario ?? ""}
            />
          </div>
          <p className="mt-4 text-body-sm text-on-surface-variant">
            El certificado PDF se envía al email del cliente cuando termina el
            periodo (fecha fin) y se ejecuta el Flujo B en n8n.
          </p>
        </SectionCard>

        <AdvancedParamsSection
          defaultSpotId={orden?.spot_id ?? ""}
          defaultSpotName={orden?.spot_name ?? ""}
          defaultDuracionSeg={orden?.duracion_seg}
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
            onClick={() => {
              if (isEdit) {
                router.push("/ordenes");
                return;
              }
              const form = document.getElementById(
                "transmission-form",
              ) as HTMLFormElement | null;
              form?.reset();
              setSubmitState("idle");
              setErrorMessage(null);
            }}
          >
            Cancelar
          </button>
          <SubmitButton state={submitState} isEdit={isEdit} />
        </div>
      </form>
    </>
  );
}

function SubmitButton({
  state,
  isEdit,
}: {
  state: SubmitState;
  isEdit: boolean;
}) {
  const label = isEdit ? "Guardar cambios" : "Guardar Orden";

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
        Éxito
      </button>
    );
  }

  return (
    <button
      type="submit"
      className="w-full sm:w-auto px-10 py-3 bg-tertiary text-on-tertiary text-body-md font-bold rounded-lg shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
    >
      <MaterialIcon name="save" filled />
      {label}
    </button>
  );
}
