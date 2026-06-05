"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AgenciaRow, EmisoraRow } from "@/lib/types/catalogo";
import { unstable_cache } from "next/cache";

const AGENCIAS_CACHE_TAG = "catalogo-agencias";
const EMISORAS_CACHE_TAG = "catalogo-emisoras";

export type ListarAgenciasResult =
  | { success: true; data: AgenciaRow[] }
  | { success: false; error: string };

export type ListarEmisorasResult =
  | { success: true; data: EmisoraRow[] }
  | { success: false; error: string };

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
