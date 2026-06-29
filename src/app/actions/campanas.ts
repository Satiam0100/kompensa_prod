"use server";

import {
  calcularMetricasCampana,
  hoyCalendario,
} from "@/lib/calcular-metricas-campana";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  CampanaConEstado,
  CampanaDetalle,
  ResumenCampanaRow,
} from "@/lib/types/campana-estado";
import type { OrdenTransmisionRow } from "@/lib/types/orden-transmision";
import { unstable_cache } from "next/cache";

const CAMPANAS_CACHE_TAG = "campanas-estado";

function mapLatestResumen(
  rows: ResumenCampanaRow[],
): Map<string, ResumenCampanaRow> {
  const map = new Map<string, ResumenCampanaRow>();
  for (const row of rows) {
    if (!map.has(row.campaña_id)) {
      map.set(row.campaña_id, row);
    }
  }
  return map;
}

function buildCampanaConEstado(
  orden: OrdenTransmisionRow,
  resumen: ResumenCampanaRow | null,
): CampanaConEstado {
  const metricas = calcularMetricasCampana(orden, resumen);
  return {
    ...orden,
    resumen,
    metricas,
    estado_cumplimiento: metricas.sin_monitoreo ? null : (resumen?.estado ?? null),
  };
}

async function fetchCampanasEstado(): Promise<ListarCampanasResult> {
  const supabase = createSupabaseServerClient();

  const { data: ordenes, error: ordenesError } = await supabase
    .from("ordenes_transmision")
    .select("*")
    .in("estado", ["activa", "pausada", "finalizada"])
    .order("updated_at", { ascending: false });

  if (ordenesError) {
    return { success: false, error: ordenesError.message };
  }

  const ordenRows = (ordenes ?? []) as OrdenTransmisionRow[];
  if (ordenRows.length === 0) {
    return { success: true, data: [] };
  }

  const ids = ordenRows.map((o) => o.id);
  const { data: resumenes, error: resumenError } = await supabase
    .from("resumen_campaña")
    .select("*")
    .in("campaña_id", ids)
    .order("fecha", { ascending: false });

  if (resumenError) {
    return { success: false, error: resumenError.message };
  }

  const latest = mapLatestResumen((resumenes ?? []) as ResumenCampanaRow[]);

  const data = ordenRows.map((orden) =>
    buildCampanaConEstado(orden, latest.get(orden.id) ?? null),
  );

  return { success: true, data };
}

const getCampanasCached = unstable_cache(
  fetchCampanasEstado,
  [CAMPANAS_CACHE_TAG, hoyCalendario()],
  { revalidate: 60, tags: [CAMPANAS_CACHE_TAG] },
);

export type ListarCampanasResult =
  | { success: true; data: CampanaConEstado[] }
  | { success: false; error: string };

export type ObtenerCampanaResult =
  | { success: true; data: CampanaDetalle }
  | { success: false; error: string };

export async function listarCampanasConEstado(): Promise<ListarCampanasResult> {
  try {
    return await getCampanasCached();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al cargar las campañas";
    return { success: false, error: message };
  }
}

export async function obtenerCampanaDetalle(
  id: string,
): Promise<ObtenerCampanaResult> {
  try {
    const supabase = createSupabaseServerClient();

    const { data: orden, error: ordenError } = await supabase
      .from("ordenes_transmision")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (ordenError) {
      return { success: false, error: ordenError.message };
    }

    if (!orden) {
      return { success: false, error: "Campaña no encontrada" };
    }

    const [resumenesResult, certificadoResult] = await Promise.all([
      supabase
        .from("resumen_campaña")
        .select("*")
        .eq("campaña_id", id)
        .order("fecha", { ascending: true }),
      supabase
        .from("certificados_emitidos")
        .select("pdf_url, numero_certificado, codigo_certificado")
        .eq("campaña_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (resumenesResult.error) {
      return { success: false, error: resumenesResult.error.message };
    }

    const historial = (resumenesResult.data ?? []) as ResumenCampanaRow[];
    const ultimo =
      historial.length > 0 ? historial[historial.length - 1] : null;

    const base = buildCampanaConEstado(orden as OrdenTransmisionRow, ultimo);

    return {
      success: true,
      data: {
        ...base,
        historial,
        certificado_pdf_url: certificadoResult.data?.pdf_url ?? null,
        certificado_numero: certificadoResult.data?.numero_certificado ?? null,
        certificado_codigo: certificadoResult.data?.codigo_certificado ?? null,
      },
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al cargar el detalle";
    return { success: false, error: message };
  }
}
