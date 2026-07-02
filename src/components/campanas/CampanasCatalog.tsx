import { CampanasList } from "@/components/campanas/CampanasList";
import type { CampanaConEstado } from "@/lib/types/campana-estado";

interface CampanasCatalogProps {
  campanas: CampanaConEstado[];
}

export function CampanasCatalog({ campanas }: CampanasCatalogProps) {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-display-lg text-on-surface mb-2">Monitoreo</h1>
        <p className="text-body-lg text-on-surface-variant">
          Estado de cumplimiento de las campañas. El porcentaje se calcula sobre
          el total contratado del periodo completo.
        </p>
      </div>
      <CampanasList campanas={campanas} />
    </>
  );
}
