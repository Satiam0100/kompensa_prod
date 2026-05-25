"use client";

import { useState } from "react";
import { FormField } from "@/components/ui/FormField";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function AdvancedParamsSection() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:col-span-12 border border-outline-variant rounded-lg overflow-hidden bg-surface-container-low">
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
        className={`grid transition-all duration-300 ease-in-out border-t ${
          open
            ? "grid-rows-[1fr] border-outline-variant"
            : "grid-rows-[0fr] border-transparent"
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 bg-surface-container-lowest/50">
            <FormField
              label="Spot ID"
              name="spot_id"
              placeholder="UID-000000"
              className="font-label-mono"
            />
            <FormField
              label="Spot Name"
              name="spot_name"
              placeholder="Nombre de archivo .mp3"
            />
            <FormField
              label="Duración (seg)"
              name="duracion_seg"
              type="number"
              placeholder="20"
              min={0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
