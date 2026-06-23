"use client";

import { useState } from "react";
import { FormField } from "@/components/ui/FormField";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

interface AdvancedParamsSectionProps {
  defaultSpotId?: string;
  defaultSpotName?: string;
  defaultDuracionSeg?: number | null;
  wrapperClassName?: string;
}

export function AdvancedParamsSection({
  defaultSpotId = "",
  defaultSpotName = "",
  defaultDuracionSeg,
  wrapperClassName = "md:col-span-12",
}: AdvancedParamsSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`${wrapperClassName} border border-outline-variant rounded-lg overflow-hidden bg-surface-container-low transition-colors hover:border-outline hover:bg-surface-container`}
    >
      <button
        type="button"
        className="w-full flex items-center justify-between p-4 hover:bg-surface-variant transition-colors group"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <MaterialIcon
            name="terminal"
            className="text-outline-variant group-hover:text-primary transition-colors"
          />
          <span className="text-title-md">
            Parámetros Técnicos (Avanzado)
          </span>
        </div>
        <MaterialIcon
          name="expand_more"
          className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`border-t transition-all duration-300 ease-in-out ${
          open ? "border-outline-variant" : "border-transparent"
        }`}
        hidden={!open}
      >
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 bg-surface-container-lowest/50">
            <FormField
              label="Spot ID"
              name="spot_id"
              placeholder="UID-000000"
              className="font-label-mono"
              defaultValue={defaultSpotId}
            />
            <FormField
              label="Spot Name"
              name="spot_name"
              placeholder="Nombre de archivo .mp3"
              defaultValue={defaultSpotName}
            />
            <FormField
              label="Duración (seg)"
              name="duracion_seg"
              type="number"
              placeholder="20"
              min={0}
              defaultValue={
                defaultDuracionSeg != null ? String(defaultDuracionSeg) : ""
              }
            />
          </div>
      </div>
    </div>
  );
}
