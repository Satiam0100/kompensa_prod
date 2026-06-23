"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { actualizarOrdenTransmision } from "@/app/actions/ordenes";
import { AdvancedParamsSection } from "@/components/ordenes/AdvancedParamsSection";
import { CatalogOrderFields } from "@/components/ordenes/CatalogOrderFields";
import { EditModal } from "@/components/ui/EditModal";
import { FormDateField } from "@/components/ui/FormDateField";
import { FormField } from "@/components/ui/FormField";
import { FormSelect } from "@/components/ui/FormSelect";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import {
  parseOrdenFormData,
  validateOrdenForm,
} from "@/lib/parse-orden-form";
import type { AgenciaRow, EmisoraRow } from "@/lib/types/catalogo";
import type { OrdenTransmisionRow } from "@/lib/types/orden-transmision";

const FORM_ID = "edit-orden-form";

interface EditOrdenModalProps {
  orden: OrdenTransmisionRow | null;
  emisoras: EmisoraRow[];
  agencias: AgenciaRow[];
  catalogError?: string | null;
  onClose: () => void;
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
  emisoras,
  agencias,
  catalogError = null,
  onClose,
}: EditOrdenModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const open = Boolean(orden);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!orden) return;

      const formData = new FormData(e.currentTarget);
      const data = parseOrdenFormData(formData);
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
      title="Editar cuña"
      maxWidth="2xl"
      onClose={onClose}
    >
      {open && orden && (
        <form
          key={orden.id}
          id={FORM_ID}
          onSubmit={handleSubmit}
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
              />
            </div>
          </FormSection>

          <FormSection title="Operación">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect
                label="Estado"
                name="estado"
                defaultValue={orden.estado}
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
                defaultValue={orden.email_cliente}
              />
            </div>
          </FormSection>

          <FormSection title="Contrato">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Cuñas Diarias"
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
              />
              <FormDateField
                label="Periodo Fin"
                name="periodo_fin"
                required
                defaultValue={orden.periodo_fin}
              />
              <div className="sm:col-span-2">
                <FormField
                  label="Horario de Transmisión"
                  name="horario"
                  defaultValue={orden.horario ?? ""}
                />
              </div>
            </div>
          </FormSection>

          <AdvancedParamsSection
            defaultSpotId={orden.spot_id ?? ""}
            defaultSpotName={orden.spot_name ?? ""}
            defaultDuracionSeg={orden.duracion_seg}
            wrapperClassName=""
          />

          {error && <p className="text-error text-body-sm">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
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
