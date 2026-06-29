import { listarAgencias } from "@/app/actions/catalogos";
import { AgenciasCatalog } from "@/components/catalogos/AgenciasCatalog";
import { CatalogError } from "@/components/catalogos/CatalogError";

export async function AgenciasData() {
  const result = await listarAgencias();

  if (!result.success) {
    return (
      <CatalogError
        title="No se pudieron cargar las agencias"
        error={result.error}
      />
    );
  }

  return <AgenciasCatalog agencias={result.data} />;
}
