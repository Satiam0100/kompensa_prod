"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { actualizarOrdenTransmision } from "@/app/actions/ordenes";
import { AdvancedParamsSection } from "@/components/ordenes/AdvancedParamsSection";
import { CatalogOrderFields } from "@/components/ordenes/CatalogOrderFields";
import { ContractTramosSection } from "@/components/ordenes/ContractTramosSection";
import { OrderEstadoField } from "@/components/ordenes/OrderEstadoField";
import { OrdenDetalleView } from "@/components/ordenes/OrdenDetalleView";
import { EditModal } from "@/components/ui/EditModal";
import { PrivacyNotice } from "@/components/legal/PrivacyNotice";
import { FormDateField } from "@/components/ui/FormDateField";
import { normalizeDateInputValue } from "@/components/ui/date-picker-utils";
import { FormField } from "@/components/ui/FormField";
import { FormPhoneField } from "@/components/ui/FormPhoneField";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { useOrderEstadoSpot } from "@/hooks/useOrderEstadoSpot";
import { useOrderChannelId } from "@/hooks/useOrderChannelId";
import {
  applyEstadoSpotRules,
  parseOrdenFormData,
  validateOrdenForm,
} from "@/lib/parse-orden-form";
import {
  TELEFONO_CLIENTE_HINT,
  TELEFONO_CLIENTE_PLACEHOLDER,
} from "@/lib/normalize-telefono";
import { sanitizePhoneInput } from "@/lib/validate-phone";
import type { AgenciaRow, EmisoraRow } from "@/lib/types/catalogo";
import type { OrdenTransmisionRow } from "@/lib/types/orden-transmision";

const FORM_ID = "edit-orden-form";

interface EditOrdenModalProps {
  orden: OrdenTransmisionRow | null;
  editMode?: boolean;
  emisoras: EmisoraRow[];
  agencias: AgenciaRow[];
  catalogError?: string | null;
  onClose: () => void;
  onStartEdit?: () => void;
  onCancelEdit?: () => void;
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h4 className="text-label-sm uppercase tracking-[0.12em] text-on-surface-variant px-1">
        {title}
      </h4>
      {children}
    </section>
  );
}

export function EditOrdenModal({
  orden,
  editMode = false,
  emisoras,
  agencias,
  catalogError = null,
  onClose,
  onStartEdit,
  onCancelEdit,
}: EditOrdenModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [periodoInicio, setPeriodoInicio] = useState("");
  const [periodoFin, setPeriodoFin] = useState("");
  const [cuniasDiarias, setCuniasDiarias] = useState(1);
  const [totalContratadas, setTotalContratadas] = useState(0);
  const open = Boolean(orden);
  const {
    spotId,
    setSpotId,
    estado,
    setEstado,
    resetFrom,
  } = useOrderEstadoSpot("", "pausada");
  const {
    channelId,
    setChannelIdManual,
    syncFromCatalog,
  } = useOrderChannelId(emisoras, orden?.channel_id ?? "");

  useEffect(() => {
    if (!orden) return;
    resetFrom(orden.spot_id ?? "", orden.estado);
    setPeriodoInicio(orden.periodo_inicio);
    setPeriodoFin(orden.periodo_fin);
    setCuniasDiarias(orden.cuñas_diarias);
    setTotalContratadas(orden.total_contratadas);
  }, [orden, resetFrom]);

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
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!orden) return;

      const formData = new FormData(e.currentTarget);
      const data = applyEstadoSpotRules(parseOrdenFormData(formData));
      const validationError = validateOrdenForm(data, formData);

      if (validationError) {
        setError(validationError);
        return;
      }

      setLoading(true);
      setError(null);

      const result = await actualizarOrdenTransmision(orden.id, data);

      setLoading(false);

      if (result.success) {
        onClose();
        router.refresh();
      } else {
        setError(result.error);
      }
    },
    [onClose, orden, router],
  );

  return (
    <EditModal
      open={open}
      title={
        editMode
          ? "Editar cuña"
          : orden
            ? `${orden.cliente} — ${orden.campaña}`
            : "Detalle de cuña"
      }
      maxWidth={editMode ? "2xl" : "6xl"}
      onClose={onClose}
    >
      {open && orden && !editMode && (
        <>
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={onStartEdit}
              className="inline-flex items-center gap-2 px-5 py-2 bg-tertiary text-on-tertiary text-body-sm font-bold rounded-lg hover:brightness-110"
            >
              <MaterialIcon name="edit" className="text-sm" />
              Editar
            </button>
          </div>
          <OrdenDetalleView orden={orden} />
        </>
      )}
      {open && orden && editMode && (
        <form
          key={orden.id}
          id={FORM_ID}
          onSubmit={handleSubmit}
          onChange={handleFormChange}
          className="space-y-6"
        >
          <p className="text-body-sm text-on-surface-variant -mt-1">
            {orden.cliente} — {orden.campaña}
          </p>

          <FormSection title="Identificación">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Cliente"
                name="cliente"
                required
                defaultValue={orden.cliente}
              />
              <FormField
                label="Campaña"
                name="campana"
                required
                defaultValue={orden.campaña}
              />
              <CatalogOrderFields
                emisoras={emisoras}
                agencias={agencias}
                defaultEmisora={orden.emisora}
                defaultCiudad={orden.ciudad ?? ""}
                defaultAgencia={orden.agencia ?? ""}
                catalogError={catalogError}
                formId={FORM_ID}
                catalogErrorClassName="sm:col-span-2"
                onEmisoraCiudadChange={syncFromCatalog}
              />
              <FormField
                label="Email Cliente"
                name="email_cliente"
                type="email"
                required
                defaultValue={orden.email_cliente}
              />
              <FormPhoneField
                label="Teléfono Cliente"
                name="telefono_cliente"
                required
                defaultValue={sanitizePhoneInput(orden.telefono_cliente ?? "")}
                placeholder={TELEFONO_CLIENTE_PLACEHOLDER}
                hint={TELEFONO_CLIENTE_HINT}
              />
            </div>
          </FormSection>

          <FormSection title="Operación">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <OrderEstadoField
                spotId={spotId}
                estado={estado}
                onEstadoChange={setEstado}
              />
              <FormField
                label="N.º de certificado"
                name="numero_certificado"
                defaultValue={orden.numero_certificado ?? ""}
                placeholder="Ej. CERT-2026-001"
                className="font-label-mono"
              />
            </div>
          </FormSection>

          <FormSection title="Contrato">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Cuñas por día (referencia)"
                name="cunias_diarias"
                type="number"
                required
                min={1}
                defaultValue={orden.cuñas_diarias}
              />
              <FormField
                label="Total Contratadas"
                name="total_contratadas"
                type="number"
                required
                min={1}
                defaultValue={orden.total_contratadas}
              />
              <FormDateField
                label="Periodo Inicio"
                name="periodo_inicio"
                required
                defaultValue={orden.periodo_inicio}
                onISOChange={setPeriodoInicio}
              />
              <FormDateField
                label="Periodo Fin"
                name="periodo_fin"
                required
                defaultValue={orden.periodo_fin}
                onISOChange={setPeriodoFin}
              />
              <div className="sm:col-span-2">
                <FormField
                  label="Horario de Transmisión"
                  name="horario"
                  defaultValue={orden.horario ?? ""}
                />
              </div>
            </div>
            <ContractTramosSection
              key={orden.id}
              periodoInicio={periodoInicio || orden.periodo_inicio}
              periodoFin={periodoFin || orden.periodo_fin}
              cuniasDiarias={
                cuniasDiarias > 0 ? cuniasDiarias : orden.cuñas_diarias
              }
              totalContratadas={
                totalContratadas > 0
                  ? totalContratadas
                  : orden.total_contratadas
              }
              initialTramos={orden.tramos_cuotas}
            />
          </FormSection>

          <AdvancedParamsSection
            key={orden.id}
            defaultSpotId={orden.spot_id ?? ""}
            defaultSpotName={orden.spot_name ?? ""}
            defaultDuracionSeg={orden.duracion_seg}
            channelId={channelId}
            onChannelIdChange={setChannelIdManual}
            wrapperClassName=""
            onSpotIdChange={setSpotId}
          />

          {error && <p className="text-error text-body-sm">{error}</p>}

          <PrivacyNotice className="pt-2" />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancelEdit ?? onClose}
              className="px-4 py-2 text-body-sm font-medium text-on-surface-variant hover:text-on-surface rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 bg-tertiary text-on-tertiary text-body-sm font-bold rounded-lg hover:brightness-110 disabled:opacity-70"
            >
              {loading ? (
                <MaterialIcon name="sync" className="animate-spin text-sm" />
              ) : (
                <MaterialIcon name="save" className="text-sm" />
              )}
              Guardar
            </button>
          </div>
        </form>
      )}
    </EditModal>
  );
}
