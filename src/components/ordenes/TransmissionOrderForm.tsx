"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { crearOrdenTransmision } from "@/app/actions/ordenes";
import {
  FormField,
  FormSelect,
  SectionCard,
} from "@/components/ui/FormField";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import type { EstadoOrden, OrdenTransmisionForm } from "@/lib/types/orden-transmision";
import { AdvancedParamsSection } from "./AdvancedParamsSection";

type SubmitState = "idle" | "loading" | "success" | "error";

function parseFormData(formData: FormData): OrdenTransmisionForm {
  const get = (key: string) => (formData.get(key) as string)?.trim() ?? "";
  const getNum = (key: string) => Number(formData.get(key));

  return {
    cliente: get("cliente"),
    campaña: get("campaña"),
    emisora: get("emisora"),
    ciudad: get("ciudad") || undefined,
    estado: (get("estado") || "activa") as EstadoOrden,
    agencia: get("agencia") || undefined,
    email_cliente: get("email_cliente"),
    cuñas_diarias: getNum("cuñas_diarias"),
    total_contratadas: getNum("total_contratadas"),
    periodo_inicio: get("periodo_inicio"),
    periodo_fin: get("periodo_fin"),
    horario: get("horario") || undefined,
    spot_id: get("spot_id") || undefined,
    spot_name: get("spot_name") || undefined,
    duracion_seg: get("duracion_seg")
      ? getNum("duracion_seg")
      : undefined,
  };
}

export function TransmissionOrderForm() {
  const router = useRouter();
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      const form = e.currentTarget;

      if (!form.checkValidity()) {
        e.preventDefault();
        form.reportValidity();
        return;
      }

      e.preventDefault();
      setSubmitState("loading");
      setErrorMessage(null);

      const formData = new FormData(form);
      const data = parseFormData(formData);

      const result = await crearOrdenTransmision(data);

      if (result.success) {
        setSubmitState("success");
        setTimeout(() => {
          setSubmitState("idle");
          form.reset();
          router.refresh();
        }, 2000);
      } else {
        setSubmitState("error");
        setErrorMessage(result.error);
      }
    },
    [router],
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
          colSpan="md:col-span-8 group"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <FormField
              label="Cliente"
              name="cliente"
              required
              placeholder="Ej. Corporación Global"
            />
            <FormField
              label="Campaña"
              name="campaña"
              required
              placeholder="Nombre del proyecto"
            />
            <FormField
              label="Emisora"
              name="emisora"
              required
              placeholder="Frecuencia / Nombre"
            />
            <FormField
              label="Ciudad"
              name="ciudad"
              placeholder="Ubicación geográfica"
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
              defaultValue="activa"
              options={[
                { value: "activa", label: "Activa" },
                { value: "pausada", label: "Pausada" },
                { value: "finalizada", label: "Finalizada" },
              ]}
            />
            <FormField
              label="Agencia"
              name="agencia"
              placeholder="Agencia aliada"
            />
            <FormField
              label="Email Cliente"
              name="email_cliente"
              type="email"
              required
              placeholder="email@dominio.com"
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
              name="cuñas_diarias"
              type="number"
              required
              min={0}
              icon="repeat"
              placeholder="0"
            />
            <FormField
              label="Total Contratadas"
              name="total_contratadas"
              type="number"
              required
              min={0}
              icon="functions"
              placeholder="0"
            />
            <FormField
              label="Periodo Inicio"
              name="periodo_inicio"
              type="date"
              required
              icon="calendar_today"
              className="[color-scheme:dark]"
            />
            <FormField
              label="Periodo Fin"
              name="periodo_fin"
              type="date"
              required
              icon="event_available"
              className="[color-scheme:dark]"
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
        </SectionCard>

        <AdvancedParamsSection />

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
      Guardar Orden
    </button>
  );
}
