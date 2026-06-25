import type { AgenciaRow, EmisoraRow } from "@/lib/types/catalogo";
import type { SelectOption } from "@/components/ui/FormSelect";

export function getActiveEmisoras(emisoras: EmisoraRow[]): EmisoraRow[] {
  return emisoras.filter((e) => e.activa && e.nombre.trim());
}

export function getActiveAgencias(agencias: AgenciaRow[]): AgenciaRow[] {
  return agencias.filter((a) => a.activa && a.nombre.trim());
}

export function getUniqueEmisoraNames(emisoras: EmisoraRow[]): string[] {
  const names = new Set<string>();
  for (const emisora of getActiveEmisoras(emisoras)) {
    names.add(emisora.nombre.trim());
  }
  return [...names].sort((a, b) => a.localeCompare(b, "es"));
}

/** channel_id del catálogo para emisora + ciudad (si existe y es único). */
export function getChannelIdForEmisoraCiudad(
  emisoras: EmisoraRow[],
  emisoraNombre: string,
  ciudad: string,
): string | undefined {
  const nombre = emisoraNombre.trim();
  const ciudadNorm = ciudad.trim();
  if (!nombre || !ciudadNorm) return undefined;

  const ids = new Set<string>();
  for (const emisora of getActiveEmisoras(emisoras)) {
    if (emisora.nombre.trim() !== nombre) continue;
    if (emisora.ciudad?.trim() !== ciudadNorm) continue;
    const channelId = emisora.channel_id?.trim();
    if (channelId) ids.add(channelId);
  }

  if (ids.size !== 1) return undefined;
  return [...ids][0];
}

export function getCiudadesForEmisora(
  emisoras: EmisoraRow[],
  emisoraNombre: string,
): string[] {
  const normalized = emisoraNombre.trim();
  if (!normalized) return [];

  const cities = new Set<string>();
  for (const emisora of getActiveEmisoras(emisoras)) {
    if (emisora.nombre.trim() !== normalized) continue;
    const ciudad = emisora.ciudad?.trim();
    if (ciudad) cities.add(ciudad);
  }

  return [...cities].sort((a, b) => a.localeCompare(b, "es"));
}

export function getAgenciaNames(agencias: AgenciaRow[]): string[] {
  return getActiveAgencias(agencias)
    .map((a) => a.nombre.trim())
    .sort((a, b) => a.localeCompare(b, "es"));
}

export function toSelectOptions(values: string[]): SelectOption[] {
  return values.map((value) => ({ value, label: value }));
}

/** Incluye valor guardado en edición aunque ya no esté en catálogo activo. */
export function ensureSelectOption(
  options: SelectOption[],
  fallbackValue?: string | null,
  fallbackSuffix = " (fuera de catálogo)",
): SelectOption[] {
  const trimmed = fallbackValue?.trim();
  if (!trimmed || options.some((option) => option.value === trimmed)) {
    return options;
  }

  return [
    { value: trimmed, label: `${trimmed}${fallbackSuffix}` },
    ...options,
  ];
}
