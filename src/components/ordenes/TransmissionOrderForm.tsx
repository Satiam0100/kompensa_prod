"use client";

import { useActionState, useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { crearOrdenesTransmisionFromForm } from "@/app/actions/ordenes";
import { CREAR_ORDENES_FORM_INITIAL_STATE } from "@/lib/crear-ordenes-form-state";
import { FormDateField } from "@/components/ui/FormDateField";
import { normalizeDateInputValue } from "@/components/ui/date-picker-utils";
import { FormCombobox } from "@/components/ui/FormCombobox";
import {
  FormField,
  SectionCard,
} from "@/components/ui/FormField";
import { FormPhoneField } from "@/components/ui/FormPhoneField";
import { FormLiveRegions } from "@/components/ui/FormLiveRegions";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { FormStatusMessage } from "@/components/ui/FormStatusMessage";
import { PrivacyNotice } from "@/components/legal/PrivacyNotice";
import { REQUIRED_FIELDS_LEGEND_ID } from "@/components/ui/RequiredFieldsLegend";
import { getFirstInvalidFieldMessage } from "@/lib/form-a11y";
import { useOrderEstadoSpot } from "@/hooks/useOrderEstadoSpot";
import {
  getAgenciaNames,
  toSelectOptions,
} from "@/lib/catalog-form-utils";
import {
  TELEFONO_CLIENTE_HINT,
  TELEFONO_CLIENTE_PLACEHOLDER,
} from "@/lib/normalize-telefono";
import {
  applyEstadoSpotRules,
  parseEmisoraLineas,
  parseOrdenFormDataCompartido,
  validateOrdenFormMulti,
} from "@/lib/parse-orden-form";
import type { AgenciaRow, EmisoraRow } from "@/lib/types/catalogo";
import { AdvancedParamsSection } from "./AdvancedParamsSection";
import { ContractTramosSection } from "./ContractTramosSection";
import { EmisorasOrderLines } from "./EmisorasOrderLines";
import { OrderEstadoField } from "./OrderEstadoField";

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
  const [actionState, formAction, isPending] = useActionState(
    crearOrdenesTransmisionFromForm,
    CREAR_ORDENES_FORM_INITIAL_STATE,
  );
  const [clientError, setClientError] = useState<string | null>(null);
  const errorMessage = clientError ?? actionState.error;
  const [agencia, setAgencia] = useState("");
  const [periodoInicio, setPeriodoInicio] = useState("");
  const [periodoFin, setPeriodoFin] = useState("");
  const [cuniasDiarias, setCuniasDiarias] = useState(1);
  const [totalContratadas, setTotalContratadas] = useState(0);
  const errorRef = useRef<HTMLParagraphElement>(null);
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

  const handleFormChange = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const pi = normalizeDateInputValue(
      (form.elements.namedItem("periodo_inicio") as HTMLInputElement | null)
        ?.value ?? "",
    );
    const pf = normalizeDateInputValue(
      (form.elements.namedItem("periodo_fin") as HTMLInputElement | null)
        ?.value ?? "",
    );
    const cd = Number(
      (form.elements.namedItem("cunias_diarias") as HTMLInputElement | null)
        ?.value || 0,
    );
    const tc = Number(
      (form.elements.namedItem("total_contratadas") as HTMLInputElement | null)
        ?.value || 0,
    );
    setPeriodoInicio(pi);
    setPeriodoFin(pf);
    if (Number.isFinite(cd) && cd > 0) setCuniasDiarias(cd);
    if (Number.isFinite(tc) && tc > 0) setTotalContratadas(tc);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      const form = e.currentTarget;

      if (!form.checkValidity()) {
        e.preventDefault();
        form.reportValidity();
        setClientError(getFirstInvalidFieldMessage(form));
        return;
      }

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
        e.preventDefault();
        setClientError(validationError);
        return;
      }

      setClientError(null);
    },
    [],
  );

  const handleReset = useCallback(() => {
    const form = document.getElementById(
      "transmission-form",
    ) as HTMLFormElement | null;
    form?.reset();
    setAgencia("");
    resetFrom("", "pausada");
    setClientError(null);
  }, [resetFrom]);

  useEffect(() => {
    if (!errorMessage) return;
    errorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [errorMessage]);

  return (
    <>
      <form
        className="grid grid-cols-1 md:grid-cols-12 gap-6"
        id="transmission-form"
        method="POST"
        action={formAction}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
        aria-busy={isPending}
        aria-describedby={REQUIRED_FIELDS_LEGEND_ID}
      >
        <SectionCard
          title="Identificación de Campaña"
          icon="badge"
          colSpan="md:col-span-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {catalogError && (
              <FormStatusMessage
                message={catalogError}
                variant="error"
                className="sm:col-span-2 text-body-sm text-on-surface-variant bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2"
              />
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
              label="Correo del coordinador"
              name="email_cliente"
              type="email"
              required
              placeholder="email@dominio.com"
            />
            <FormPhoneField
              label="Teléfono del coordinador"
              name="telefono_cliente"
              required
              icon="phone"
              placeholder={TELEFONO_CLIENTE_PLACEHOLDER}
              hint={TELEFONO_CLIENTE_HINT}
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
              label="Cuñas por día (referencia)"
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
              onISOChange={setPeriodoInicio}
            />
            <FormDateField
              label="Periodo Fin"
              name="periodo_fin"
              required
              onISOChange={setPeriodoFin}
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
            Indica las franjas horarias de transmisión. Al finalizar la fecha de
            fin del contrato, el certificado PDF se enviará automáticamente al
            email del coordinador.
          </p>
          <ContractTramosSection
            periodoInicio={periodoInicio}
            periodoFin={periodoFin}
            cuniasDiarias={cuniasDiarias}
            totalContratadas={totalContratadas}
          />
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

        <FormLiveRegions
          className="md:col-span-12"
          error={errorMessage}
        />

        <FormActionsBar
          isPending={isPending}
          errorMessage={errorMessage}
          errorRef={errorRef}
          onCancel={handleReset}
        />
      </form>
    </>
  );
}

const FORM_ACTIONS_BAR =
  "md:col-span-12 mt-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-outline-variant md:mt-4 md:mb-20 md:pt-0 md:pb-0 md:border-0";

function FormActionsBar({
  isPending,
  errorMessage,
  errorRef,
  onCancel,
}: {
  isPending: boolean;
  errorMessage: string | null;
  errorRef: RefObject<HTMLParagraphElement | null>;
  onCancel: () => void;
}) {
  return (
    <div className={FORM_ACTIONS_BAR}>
      <FormStatusMessage
        ref={errorRef}
        message={errorMessage}
        variant="error"
        className="text-error text-label-sm mb-3 px-1 w-full max-w-5xl mx-auto md:max-w-none"
      />
      {isPending && (
        <FormStatusMessage
          message="Guardando órdenes, por favor espera."
          variant="status"
          className="sr-only"
        />
      )}
      <PrivacyNotice className="mb-3 px-1 w-full max-w-5xl mx-auto md:max-w-none" />
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-4 max-w-5xl mx-auto md:max-w-none">
        <button
          type="button"
          className="w-full sm:w-auto px-6 py-2.5 text-body-sm font-medium text-on-surface-variant border border-outline-variant/70 bg-transparent rounded-lg hover:bg-surface-container-high hover:text-on-surface hover:border-outline transition-all disabled:opacity-60"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancelar
        </button>
        <SubmitButton isPending={isPending} />
      </div>
    </div>
  );
}

function SubmitButton({ isPending }: { isPending: boolean }) {
  if (isPending) {
    return (
      <button
        type="submit"
        disabled
        className="w-full sm:w-auto sm:min-w-[12.5rem] px-10 py-3.5 bg-tertiary text-on-tertiary text-body-lg font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 opacity-80"
      >
        <MaterialIcon name="sync" className="animate-spin" />
        Procesando...
      </button>
    );
  }

  return (
    <button
      type="submit"
      className="w-full sm:w-auto sm:min-w-[12.5rem] px-10 py-3.5 bg-tertiary text-on-tertiary text-body-lg font-bold rounded-lg shadow-lg hover:brightness-110 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
    >
      <MaterialIcon name="save" filled />
      Guardar órdenes
    </button>
  );
}
