"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  OrdenTransmisionForm,
  OrdenTransmisionRow,
} from "@/lib/types/orden-transmision";
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

export type ListarOrdenesResult =
  | { success: true; data: OrdenTransmisionRow[] }
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

export async function crearOrdenTransmision(
  data: OrdenTransmisionForm,
): Promise<CrearOrdenResult> {
  try {
    const supabase = createSupabaseServerClient();

    const payload = {
      cliente: data.cliente.trim(),
      campaña: data.campaña.trim(),
      emisora: data.emisora.trim(),
      ciudad: data.ciudad?.trim() || null,
      estado: data.estado,
      agencia: data.agencia?.trim() || null,
      email_cliente: data.email_cliente.trim(),
      cuñas_diarias: data.cuñas_diarias,
      total_contratadas: data.total_contratadas,
      periodo_inicio: data.periodo_inicio,
      periodo_fin: data.periodo_fin,
      horario: data.horario?.trim() || null,
      spot_id: data.spot_id?.trim() || null,
      spot_name: data.spot_name?.trim() || null,
      duracion_seg: data.duracion_seg ?? null,
    };

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
