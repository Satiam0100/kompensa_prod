import { listarAgencias } from "@/app/actions/catalogos";
import { AgenciasList } from "@/components/catalogos/AgenciasList";
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

  return <AgenciasList agencias={result.data} />;
}
