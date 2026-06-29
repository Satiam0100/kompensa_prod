"use server";

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
} from "@/lib/parse-orden-form";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

const ORDENES_CACHE_TAG = "ordenes-transmision";

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

    revalidatePath("/ordenes/nueva");
    revalidatePath("/ordenes");
    revalidateTag(ORDENES_CACHE_TAG, "max");
    return { success: true, id: row.id as string };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error desconocido al guardar";
    return { success: false, error: message };
  }
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

    revalidatePath("/ordenes/nueva");
    revalidatePath("/ordenes");
    revalidateTag(ORDENES_CACHE_TAG, "max");
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

    revalidatePath("/ordenes");
    revalidatePath(`/ordenes/${id}/editar`);
    revalidateTag(ORDENES_CACHE_TAG, "max");
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

    revalidatePath("/ordenes");
    revalidateTag(ORDENES_CACHE_TAG, "max");
    return { success: true, deleted: result.deleted };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al eliminar las órdenes";
    return { success: false, error: message };
  }
}
