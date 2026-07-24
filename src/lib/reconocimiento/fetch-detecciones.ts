import type { DeteccionApi } from "@/lib/reconocimiento/types";

const API_URL =
  "https://monitoreodigital.net/nueva_app_flask/api/v1/detections";

function getApiKey(): string {
  const key = process.env.API_DETECCIONES_KEY?.trim();
  if (!key) {
    throw new Error(
      "Falta API_DETECCIONES_KEY en las variables de entorno del servidor.",
    );
  }
  return key;
}

export async function fetchDeteccionesRango(
  startDate: string,
  endDate: string,
): Promise<DeteccionApi[]> {
  const apiKey = getApiKey();
  const all: DeteccionApi[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const url = new URL(API_URL);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("start_date", startDate);
    url.searchParams.set("end_date", endDate);
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", "10000");

    const res = await fetch(url.toString(), {
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
    });

    if (!res.ok) {
      throw new Error(`API detecciones HTTP ${res.status}`);
    }

    const json = (await res.json()) as {
      status?: string;
      data?: DeteccionApi[];
      meta?: { total_pages?: number };
      message?: string;
    };

    if (json.status !== "success") {
      throw new Error(
        json.message || "La API de detecciones no respondió con éxito.",
      );
    }

    totalPages = json.meta?.total_pages || 1;
    all.push(...(json.data || []));
    page += 1;
  }

  return all;
}
