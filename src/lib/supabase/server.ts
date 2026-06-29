import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL");
  }
  return url;
}

export function createSupabaseServerClient(): SupabaseClient {
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!key) {
    throw new Error(
      "Faltan variables de entorno Supabase (NEXT_PUBLIC_SUPABASE_URL y clave)",
    );
  }

  return createClient(getSupabaseUrl(), key);
}

/** Cliente con service role: bypass RLS. Obligatorio para DELETE si no hay políticas RLS. */
export function createSupabaseAdminClient(): SupabaseClient | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createClient(getSupabaseUrl(), key);
}

export type DeleteRowsResult =
  | { success: true; deleted: number }
  | { success: false; error: string };

const DELETE_PERMISSION_HINT =
  "Configura SUPABASE_SERVICE_ROLE_KEY en el servidor o ejecuta supabase-delete-policies.sql en Supabase.";

export async function deleteRowsByIds(
  table: "agencias" | "emisoras" | "ordenes_transmision",
  ids: string[],
): Promise<DeleteRowsResult> {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return { success: false, error: "No hay registros seleccionados." };
  }

  const supabase = createSupabaseAdminClient() ?? createSupabaseServerClient();

  const { data, error } = await supabase
    .from(table)
    .delete()
    .in("id", uniqueIds)
    .select("id");

  if (error) {
    return { success: false, error: error.message };
  }

  const deleted = data?.length ?? 0;
  if (deleted === 0) {
    return {
      success: false,
      error: `No se eliminó ningún registro. ${DELETE_PERMISSION_HINT}`,
    };
  }

  return { success: true, deleted };
}
