"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { actualizarEmisora } from "@/app/actions/catalogos";
import { EditModal } from "@/components/ui/EditModal";
import {
  FormCheckbox,
  FormField,
  FormTextarea,
} from "@/components/ui/FormField";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import type { EmisoraRow } from "@/lib/types/catalogo";

interface EditEmisoraModalProps {
  emisora: EmisoraRow | null;
  onClose: () => void;
}

export function EditEmisoraModal({
  emisora,
  onClose,
}: EditEmisoraModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!emisora) return;

      setLoading(true);
      setError(null);

      const formData = new FormData(e.currentTarget);
      const get = (key: string) => (formData.get(key) as string)?.trim() ?? "";

      const result = await actualizarEmisora(emisora.id, {
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
      });

      setLoading(false);

      if (result.success) {
        onClose();
        router.refresh();
      } else {
        setError(result.error);
      }
    },
    [emisora, onClose, router],
  );

  return (
    <EditModal
      open={Boolean(emisora)}
      title="Editar emisora"
      onClose={onClose}
    >
      {emisora && (
        <form key={emisora.id} onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Nombre"
            name="nombre"
            required
            defaultValue={emisora.nombre}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Ciudad"
              name="ciudad"
              defaultValue={emisora.ciudad ?? ""}
            />
            <FormField
              label="Channel ID"
              name="channel_id"
              defaultValue={emisora.channel_id ?? ""}
              className="font-label-mono"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Circuito"
              name="circuito"
              defaultValue={emisora.circuito ?? ""}
            />
            <FormField
              label="Tipo"
              name="tipo"
              defaultValue={emisora.tipo ?? ""}
            />
          </div>
          <FormField
            label="Contacto"
            name="contacto"
            defaultValue={emisora.contacto ?? ""}
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            defaultValue={emisora.email ?? ""}
          />
          <FormField
            label="WhatsApp"
            name="whatsapp"
            defaultValue={emisora.whatsapp ?? ""}
            className="font-label-mono"
          />
          <FormTextarea
            label="Notas"
            name="notas"
            defaultValue={emisora.notas ?? ""}
          />
          <FormCheckbox
            label="Emisora activa"
            name="activa"
            defaultChecked={emisora.activa}
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
