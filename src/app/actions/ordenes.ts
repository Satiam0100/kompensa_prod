"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient, deleteRowsByIds } from "@/lib/supabase/server";
import type {
  OrdenEmisoraLinea,
  OrdenTransmisionForm,
  OrdenTransmisionFormCompartido,
  OrdenTransmisionRow,
} from "@/lib/types/orden-transmision";
import {
  applyEstadoSpotRules,
  mergeOrdenForm,
  ordenFormToPayload,
  parseEmisoraLineas,
  parseOrdenFormDataCompartido,
  validateOrdenFormMulti,
} from "@/lib/parse-orden-form";
import type { CrearOrdenesFormState } from "@/lib/crear-ordenes-form-state";
import { ORDENES_CACHE_TAG } from "@/lib/cache-tags";
import { revalidateOrdenesRelatedData } from "@/lib/revalidate-ordenes-data";
import { unstable_cache } from "next/cache";

async function fetchOrdenesFromSupabase(): Promise<ListarOrdenesResult> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("ordenes_transmision")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: (data ?? []) as OrdenTransmisionRow[] };
}

const getOrdenesCached = unstable_cache(
  fetchOrdenesFromSupabase,
  [ORDENES_CACHE_TAG],
  { revalidate: 30, tags: [ORDENES_CACHE_TAG] },
);

export type CrearOrdenResult =
  | { success: true; id: string }
  | { success: false; error: string };

export type CrearOrdenesResult =
  | { success: true; ids: string[]; count: number }
  | { success: false; error: string };

export type ListarOrdenesResult =
  | { success: true; data: OrdenTransmisionRow[] }
  | { success: false; error: string };

export type ObtenerOrdenResult =
  | { success: true; data: OrdenTransmisionRow }
  | { success: false; error: string };

export type ActualizarOrdenResult =
  | { success: true }
  | { success: false; error: string };

export type EliminarOrdenesResult =
  | { success: true; deleted: number }
  | { success: false; error: string };

export async function listarOrdenesTransmision(): Promise<ListarOrdenesResult> {
  try {
    return await getOrdenesCached();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al cargar las órdenes";
    return { success: false, error: message };
  }
}

export async function obtenerOrdenTransmision(
  id: string,
): Promise<ObtenerOrdenResult> {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("ordenes_transmision")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: "Orden no encontrada" };
    }

    return { success: true, data: data as OrdenTransmisionRow };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al cargar la orden";
    return { success: false, error: message };
  }
}

export async function crearOrdenTransmision(
  data: OrdenTransmisionForm,
): Promise<CrearOrdenResult> {
  try {
    const supabase = createSupabaseServerClient();

    const payload = ordenFormToPayload(applyEstadoSpotRules(data));

    const { data: row, error } = await supabase
      .from("ordenes_transmision")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidateOrdenesRelatedData(row.id as string);
    return { success: true, id: row.id as string };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error desconocido al guardar";
    return { success: false, error: message };
  }
}

export async function crearOrdenesTransmisionFromForm(
  _prevState: CrearOrdenesFormState,
  formData: FormData,
): Promise<CrearOrdenesFormState> {
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
    return { error: validationError };
  }

  const result = await crearOrdenesTransmision(compartido, lineas);

  if (!result.success) {
    return { error: result.error };
  }

  redirect(`/ordenes?created=${result.count}`);
}

export async function crearOrdenesTransmision(
  compartido: OrdenTransmisionFormCompartido,
  lineas: OrdenEmisoraLinea[],
): Promise<CrearOrdenesResult> {
  try {
    if (lineas.length === 0) {
      return { success: false, error: "Añade al menos una emisora." };
    }

    const supabase = createSupabaseServerClient();
    const payloads = lineas.map((linea) =>
      ordenFormToPayload(
        applyEstadoSpotRules(mergeOrdenForm(compartido, linea)),
      ),
    );

    const { data, error } = await supabase
      .from("ordenes_transmision")
      .insert(payloads)
      .select("id");

    if (error) {
      return { success: false, error: error.message };
    }

    const ids = (data ?? []).map((row) => row.id as string);

    revalidateOrdenesRelatedData(ids);
    return { success: true, ids, count: ids.length };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error desconocido al guardar";
    return { success: false, error: message };
  }
}

export async function actualizarOrdenTransmision(
  id: string,
  data: OrdenTransmisionForm,
): Promise<ActualizarOrdenResult> {
  try {
    const supabase = createSupabaseServerClient();
    const payload = ordenFormToPayload(applyEstadoSpotRules(data));

    const { error } = await supabase
      .from("ordenes_transmision")
      .update(payload)
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidateOrdenesRelatedData(id);
    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error desconocido al actualizar";
    return { success: false, error: message };
  }
}

export async function eliminarOrdenesTransmision(
  ids: string[],
): Promise<EliminarOrdenesResult> {
  try {
    const result = await deleteRowsByIds("ordenes_transmision", ids);
    if (!result.success) return result;

    revalidateOrdenesRelatedData(ids);
    return { success: true, deleted: result.deleted };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al eliminar las órdenes";
    return { success: false, error: message };
  }
}
