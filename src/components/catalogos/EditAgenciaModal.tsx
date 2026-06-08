"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { actualizarAgencia, crearAgencia } from "@/app/actions/catalogos";
import { EditModal } from "@/components/ui/EditModal";
import {
  FormCheckbox,
  FormField,
  FormTextarea,
} from "@/components/ui/FormField";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import type { AgenciaRow } from "@/lib/types/catalogo";

interface EditAgenciaModalProps {
  agencia: AgenciaRow | null;
  creating?: boolean;
  onClose: () => void;
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
  onClose,
}: EditAgenciaModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const open = creating || Boolean(agencia);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!creating && !agencia) return;

      setLoading(true);
      setError(null);

      const data = readAgenciaForm(new FormData(e.currentTarget));
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

  return (
    <EditModal
      open={open}
      title={creating ? "Nueva agencia" : "Editar agencia"}
      onClose={onClose}
    >
      {open && (
        <form
          key={creating ? "create" : agencia!.id}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <FormField
            label="Nombre"
            name="nombre"
            required
            defaultValue={creating ? "" : agencia!.nombre}
          />
          <FormField
            label="Dirección"
            name="direccion"
            defaultValue={creating ? "" : (agencia!.direccion ?? "")}
          />
          <FormField
            label="Clientes"
            name="clientes"
            defaultValue={creating ? "" : (agencia!.clientes ?? "")}
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            defaultValue={creating ? "" : (agencia!.email ?? "")}
          />
          <FormField
            label="Teléfono"
            name="telefono"
            defaultValue={creating ? "" : (agencia!.telefono ?? "")}
          />
          <FormTextarea
            label="Notas"
            name="notas"
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
