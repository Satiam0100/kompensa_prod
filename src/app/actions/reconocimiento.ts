"use server";

import { agruparDetecciones } from "@/lib/reconocimiento/agrupar";
import { fetchDeteccionesRango } from "@/lib/reconocimiento/fetch-detecciones";
import {
  RECONOCIMIENTO_MAX_DIAS,
  type ReconocimientoGrupo,
} from "@/lib/reconocimiento/types";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export type ConsultarReconocimientoResult =
  | {
      success: true;
      grupos: ReconocimientoGrupo[];
      totalDetecciones: number;
      startDate: string;
      endDate: string;
    }
  | { success: false; error: string };

function daysInclusive(start: string, end: string): number {
  const a = new Date(`${start}T00:00:00Z`);
  const b = new Date(`${end}T00:00:00Z`);
  return Math.floor((b.getTime() - a.getTime()) / 86_400_000) + 1;
}

export async function consultarReconocimiento(
  startDate: string,
  endDate: string,
): Promise<ConsultarReconocimientoResult> {
  const start = startDate.trim();
  const end = endDate.trim();

  if (!DATE_ONLY.test(start) || !DATE_ONLY.test(end)) {
    return {
      success: false,
      error: "Fechas inválidas. Usa el formato dd/mm/aaaa.",
    };
  }

  if (end < start) {
    return {
      success: false,
      error: "La fecha fin no puede ser anterior al inicio.",
    };
  }

  const dias = daysInclusive(start, end);
  if (dias > RECONOCIMIENTO_MAX_DIAS) {
    return {
      success: false,
      error: `El rango máximo es de ${RECONOCIMIENTO_MAX_DIAS} días (seleccionaste ${dias}).`,
    };
  }

  try {
    const detecciones = await fetchDeteccionesRango(start, end);
    const grupos = agruparDetecciones(detecciones);
    return {
      success: true,
      grupos,
      totalDetecciones: detecciones.length,
      startDate: start,
      endDate: end,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al consultar la API.";
    return { success: false, error: message };
  }
}
