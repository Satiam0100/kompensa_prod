import { CampanasList } from "@/components/campanas/CampanasList";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import type { CampanaConEstado } from "@/lib/types/campana-estado";

interface CampanasCatalogProps {
  campanas: CampanaConEstado[];
}

export function CampanasCatalog({ campanas }: CampanasCatalogProps) {
  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <MaterialIcon
            name="search"
            className="text-tertiary shrink-0"
            fontSize="large"
          />
          <h2 className="text-display-lg text-on-surface">Monitoreo</h2>
        </div>
        <p className="text-body-lg text-on-surface-variant">
          Estado de cumplimiento de las campañas. El porcentaje se calcula sobre
          el total contratado del periodo completo.
        </p>
      </div>
      <CampanasList campanas={campanas} />
    </>
  );
}
