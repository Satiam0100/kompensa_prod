"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { actualizarAgencia, crearAgencia } from "@/app/actions/catalogos";
import { AgenciaDetalleView } from "@/components/catalogos/AgenciaDetalleView";
import { EditModal } from "@/components/ui/EditModal";
import {
  FormCheckbox,
  FormField,
  FormTextarea,
} from "@/components/ui/FormField";
import { FormPhoneField } from "@/components/ui/FormPhoneField";
import { FormTagInput } from "@/components/ui/FormTagInput";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { validateOptionalEmail } from "@/lib/validate-email";
import { sanitizePhoneInput, validateOptionalPhone } from "@/lib/validate-phone";
import type { AgenciaRow } from "@/lib/types/catalogo";

interface EditAgenciaModalProps {
  agencia: AgenciaRow | null;
  creating?: boolean;
  editMode?: boolean;
  onClose: () => void;
  onStartEdit?: () => void;
  onCancelEdit?: () => void;
}

function readAgenciaForm(formData: FormData) {
  const get = (key: string) => (formData.get(key) as string)?.trim() ?? "";
  return {
    nombre: get("nombre"),
    email: get("email") || undefined,
    telefono: get("telefono") || undefined,
    direccion: get("direccion") || undefined,
    clientes: get("clientes") || undefined,
    activa: formData.get("activa") === "true",
    notas: get("notas") || undefined,
  };
}

export function EditAgenciaModal({
  agencia,
  creating = false,
  editMode = false,
  onClose,
  onStartEdit,
  onCancelEdit,
}: EditAgenciaModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const open = creating || Boolean(agencia);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!creating && !agencia) return;

      setError(null);

      const data = readAgenciaForm(new FormData(e.currentTarget));
      const emailError = validateOptionalEmail(data.email ?? "");
      if (emailError) {
        setError(emailError);
        return;
      }
      const phoneError = validateOptionalPhone(data.telefono ?? "");
      if (phoneError) {
        setError(phoneError);
        return;
      }

      setLoading(true);

      const result = creating
        ? await crearAgencia(data)
        : await actualizarAgencia(agencia!.id, data);

      setLoading(false);

      if (result.success) {
        onClose();
        router.refresh();
      } else {
        setError(result.error);
      }
    },
    [agencia, creating, onClose, router],
  );

  const showDetail = open && agencia && !creating && !editMode;
  const showForm = creating || (Boolean(agencia) && editMode);

  const title = creating
    ? "Nueva agencia"
    : editMode
      ? "Editar agencia"
      : agencia?.nombre ?? "Detalle de agencia";

  return (
    <EditModal
      open={open}
      title={title}
      maxWidth={showDetail ? "4xl" : "lg"}
      onClose={onClose}
    >
      {showDetail && agencia && (
        <>
          <AgenciaDetalleView agencia={agencia} />
          <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-outline-variant/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-body-sm font-medium text-on-surface-variant hover:text-on-surface rounded-lg"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={onStartEdit}
              className="inline-flex items-center gap-2 px-5 py-2 bg-tertiary text-on-tertiary text-body-sm font-bold rounded-lg hover:brightness-110"
            >
              <MaterialIcon name="edit" className="text-sm" />
              Editar
            </button>
          </div>
        </>
      )}
      {showForm && (
        <form
          key={creating ? "create" : agencia!.id}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <FormField
            label="Nombre"
            name="nombre"
            required
            placeholder="Ej. Agencia Creativa"
            defaultValue={creating ? "" : agencia!.nombre}
          />
          <FormField
            label="Dirección"
            name="direccion"
            placeholder="Ej. Av. Principal, Caracas"
            defaultValue={creating ? "" : (agencia!.direccion ?? "")}
          />
          <FormTagInput
            label="Clientes"
            name="clientes"
            placeholder="Nombre del cliente"
            defaultValue={creating ? "" : (agencia!.clientes ?? "")}
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            placeholder="agencia@dominio.com"
            defaultValue={creating ? "" : (agencia!.email ?? "")}
          />
          <FormPhoneField
            label="Teléfono"
            name="telefono"
            placeholder="04141234567"
            defaultValue={
              creating ? "" : sanitizePhoneInput(agencia!.telefono ?? "")
            }
          />
          <FormTextarea
            label="Notas"
            name="notas"
            placeholder="Observaciones internas…"
            defaultValue={creating ? "" : (agencia!.notas ?? "")}
          />
          <FormCheckbox
            label="Agencia activa"
            name="activa"
            defaultChecked={creating ? true : agencia!.activa}
          />

          {error && <p className="text-error text-body-sm">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={creating ? onClose : (onCancelEdit ?? onClose)}
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
              {creating ? "Crear" : "Guardar"}
            </button>
          </div>
        </form>
      )}
    </EditModal>
  );
}
