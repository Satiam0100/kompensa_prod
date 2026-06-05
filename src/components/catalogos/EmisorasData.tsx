import { listarEmisoras } from "@/app/actions/catalogos";
import { CatalogError } from "@/components/catalogos/CatalogError";
import { EmisorasList } from "@/components/catalogos/EmisorasList";

export async function EmisorasData() {
  const result = await listarEmisoras();

  if (!result.success) {
    return (
      <CatalogError
        title="No se pudieron cargar las emisoras"
        error={result.error}
      />
    );
  }

  return <EmisorasList emisoras={result.data} />;
}
