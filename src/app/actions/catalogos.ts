"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AgenciaForm,
  AgenciaRow,
  EmisoraForm,
  EmisoraRow,
} from "@/lib/types/catalogo";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

const AGENCIAS_CACHE_TAG = "catalogo-agencias";
const EMISORAS_CACHE_TAG = "catalogo-emisoras";

export type ListarAgenciasResult =
  | { success: true; data: AgenciaRow[] }
  | { success: false; error: string };

export type ListarEmisorasResult =
  | { success: true; data: EmisoraRow[] }
  | { success: false; error: string };

export type ActualizarCatalogoResult =
  | { success: true }
  | { success: false; error: string };

function agenciaToPayload(data: AgenciaForm) {
  return {
    nombre: data.nombre.trim(),
    email: data.email?.trim() || null,
    telefono: data.telefono?.trim() || null,
    direccion: data.direccion?.trim() || null,
    clientes: data.clientes?.trim() || null,
    activa: data.activa,
    notas: data.notas?.trim() || null,
  };
}

function emisoraToPayload(data: EmisoraForm) {
  return {
    nombre: data.nombre.trim(),
    ciudad: data.ciudad?.trim() || null,
    channel_id: data.channel_id?.trim() || null,
    contacto: data.contacto?.trim() || null,
    email: data.email?.trim() || null,
    whatsapp: data.whatsapp?.trim() || null,
    circuito: data.circuito?.trim() || null,
    tipo: data.tipo?.trim() || null,
    activa: data.activa,
    notas: data.notas?.trim() || null,
  };
}

async function fetchAgenciasFromSupabase(): Promise<ListarAgenciasResult> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("agencias")
    .select("*")
    .order("nombre", { ascending: true });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: (data ?? []) as AgenciaRow[] };
}

async function fetchEmisorasFromSupabase(): Promise<ListarEmisorasResult> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("emisoras")
    .select("*")
    .order("nombre", { ascending: true });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: (data ?? []) as EmisoraRow[] };
}

const getAgenciasCached = unstable_cache(
  fetchAgenciasFromSupabase,
  [AGENCIAS_CACHE_TAG],
  { revalidate: 60, tags: [AGENCIAS_CACHE_TAG] },
);

const getEmisorasCached = unstable_cache(
  fetchEmisorasFromSupabase,
  [EMISORAS_CACHE_TAG],
  { revalidate: 60, tags: [EMISORAS_CACHE_TAG] },
);

export async function listarAgencias(): Promise<ListarAgenciasResult> {
  try {
    return await getAgenciasCached();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al cargar las agencias";
    return { success: false, error: message };
  }
}

export async function listarEmisoras(): Promise<ListarEmisorasResult> {
  try {
    return await getEmisorasCached();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al cargar las emisoras";
    return { success: false, error: message };
  }
}

export async function actualizarAgencia(
  id: string,
  data: AgenciaForm,
): Promise<ActualizarCatalogoResult> {
  if (!data.nombre.trim()) {
    return { success: false, error: "El nombre es obligatorio." };
  }

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from("agencias")
      .update(agenciaToPayload(data))
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/agencias");
    revalidateTag(AGENCIAS_CACHE_TAG, "max");
    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al actualizar la agencia";
    return { success: false, error: message };
  }
}

export async function actualizarEmisora(
  id: string,
  data: EmisoraForm,
): Promise<ActualizarCatalogoResult> {
  if (!data.nombre.trim()) {
    return { success: false, error: "El nombre es obligatorio." };
  }

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from("emisoras")
      .update(emisoraToPayload(data))
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/emisoras");
    revalidateTag(EMISORAS_CACHE_TAG, "max");
    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al actualizar la emisora";
    return { success: false, error: message };
  }
}
