import { revalidatePath, revalidateTag } from "next/cache";
import { CAMPANAS_CACHE_TAG, ORDENES_CACHE_TAG } from "@/lib/cache-tags";

/** Invalida listados de órdenes y monitoreo tras mutaciones en ordenes_transmision. */
export function revalidateOrdenesRelatedData(campanaIds?: string | string[]) {
  revalidatePath("/ordenes/nueva");
  revalidatePath("/ordenes");
  revalidatePath("/campanas");

  const ids = campanaIds
    ? Array.isArray(campanaIds)
      ? campanaIds
      : [campanaIds]
    : [];

  for (const id of ids) {
    revalidatePath(`/campanas/${id}`);
    revalidatePath(`/ordenes/${id}/editar`);
  }

  revalidateTag(ORDENES_CACHE_TAG, "max");
  revalidateTag(CAMPANAS_CACHE_TAG, "max");
}
