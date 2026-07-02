"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { actualizarEmisora, crearEmisora } from "@/app/actions/catalogos";
import { EditModal } from "@/components/ui/EditModal";
import {
  FormCheckbox,
  FormField,
  FormTextarea,
} from "@/components/ui/FormField";
import { FormPhoneField } from "@/components/ui/FormPhoneField";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { validateOptionalEmail } from "@/lib/validate-email";
import { sanitizePhoneInput, validateOptionalPhone } from "@/lib/validate-phone";
import type { EmisoraRow } from "@/lib/types/catalogo";

interface EditEmisoraModalProps {
  emisora: EmisoraRow | null;
  creating?: boolean;
  onClose: () => void;
}

function readEmisoraForm(formData: FormData) {
  const get = (key: string) => (formData.get(key) as string)?.trim() ?? "";
  return {
    nombre: get("nombre"),
    ciudad: get("ciudad") || undefined,
    channel_id: get("channel_id") || undefined,
    contacto: get("contacto") || undefined,
    email: get("email") || undefined,
    whatsapp: get("whatsapp") || undefined,
    circuito: get("circuito") || undefined,
    tipo: get("tipo") || undefined,
    activa: formData.get("activa") === "true",
    notas: get("notas") || undefined,
  };
}

export function EditEmisoraModal({
  emisora,
  creating = false,
  onClose,
}: EditEmisoraModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const open = creating || Boolean(emisora);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!creating && !emisora) return;

      setError(null);

      const data = readEmisoraForm(new FormData(e.currentTarget));
      const emailError = validateOptionalEmail(data.email ?? "");
      if (emailError) {
        setError(emailError);
        return;
      }
      const phoneError = validateOptionalPhone(data.whatsapp ?? "");
      if (phoneError) {
        setError(phoneError);
        return;
      }

      setLoading(true);

      const result = creating
        ? await crearEmisora(data)
        : await actualizarEmisora(emisora!.id, data);

      setLoading(false);

      if (result.success) {
        onClose();
        router.refresh();
      } else {
        setError(result.error);
      }
    },
    [creating, emisora, onClose, router],
  );

  return (
    <EditModal
      open={open}
      title={creating ? "Nueva emisora" : "Editar emisora"}
      onClose={onClose}
    >
      {open && (
        <form
          key={creating ? "create" : emisora!.id}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <FormField
            label="Nombre"
            name="nombre"
            required
            placeholder="Ej. Radio Nacional"
            defaultValue={creating ? "" : emisora!.nombre}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Ciudad"
              name="ciudad"
              placeholder="Ej. Caracas"
              defaultValue={creating ? "" : (emisora!.ciudad ?? "")}
            />
            <FormField
              label="Channel ID"
              name="channel_id"
              placeholder="Ej. CH-001"
              defaultValue={creating ? "" : (emisora!.channel_id ?? "")}
              className="font-label-mono"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Circuito"
              name="circuito"
              placeholder="Ej. Circuito Centro"
              defaultValue={creating ? "" : (emisora!.circuito ?? "")}
            />
            <FormField
              label="Tipo"
              name="tipo"
              placeholder="Ej. AM / FM"
              defaultValue={creating ? "" : (emisora!.tipo ?? "")}
            />
          </div>
          <FormField
            label="Contacto"
            name="contacto"
            placeholder="Nombre del contacto"
            defaultValue={creating ? "" : (emisora!.contacto ?? "")}
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            placeholder="emisora@dominio.com"
            defaultValue={creating ? "" : (emisora!.email ?? "")}
          />
          <FormPhoneField
            label="Teléfono"
            name="whatsapp"
            placeholder="04141234567"
            defaultValue={
              creating ? "" : sanitizePhoneInput(emisora!.whatsapp ?? "")
            }
            className="font-label-mono"
          />
          <FormTextarea
            label="Notas"
            name="notas"
            placeholder="Observaciones internas…"
            defaultValue={creating ? "" : (emisora!.notas ?? "")}
          />
          <FormCheckbox
            label="Emisora activa"
            name="activa"
            defaultChecked={creating ? true : emisora!.activa}
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
              {creating ? "Crear" : "Guardar"}
            </button>
          </div>
        </form>
      )}
    </EditModal>
  );
}
