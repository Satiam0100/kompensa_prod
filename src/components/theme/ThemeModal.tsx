"use client";

import { useEffect, useId, useRef } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import type { ThemeMode } from "@/lib/theme/types";
import { useTheme } from "./ThemeProvider";

const options: {
  mode: ThemeMode;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    mode: "system",
    label: "Sistema",
    description: "Sigue la configuración del navegador",
    icon: "brightness_auto",
  },
  {
    mode: "light",
    label: "Claro",
    description: "Tema claro fijo",
    icon: "light_mode",
  },
  {
    mode: "dark",
    label: "Oscuro",
    description: "Tema oscuro fijo",
    icon: "dark_mode",
  },
];

interface ThemeModalProps {
  open: boolean;
  onClose: () => void;
}

export function ThemeModal({ open, onClose }: ThemeModalProps) {
  const { mode, setMode } = useTheme();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby={titleId}
      className="backdrop:bg-black/60 bg-surface-container text-on-surface border border-outline-variant rounded-xl p-0 w-[calc(100%-2rem)] max-w-md shadow-2xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0"
    >
      <div className="p-6 border-b border-outline-variant flex items-center justify-between">
        <div>
          <h2 id={titleId} className="text-title-md text-on-surface">
            Apariencia
          </h2>
          <p className="text-body-sm text-on-surface-variant mt-1">
            El modo sistema se adapta automáticamente a tu navegador
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
          aria-label="Cerrar"
        >
          <MaterialIcon name="close" />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-2">
        {options.map((opt) => {
          const selected = mode === opt.mode;
          return (
            <button
              key={opt.mode}
              type="button"
              onClick={() => {
                setMode(opt.mode);
                onClose();
              }}
              className={`w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-all ${
                selected
                  ? "border-tertiary bg-tertiary-container/30 ring-1 ring-tertiary"
                  : "border-outline-variant hover:border-outline hover:bg-surface-container-high"
              }`}
            >
              <span
                className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                  selected
                    ? "bg-tertiary text-on-tertiary border-tertiary"
                    : "bg-surface-container-lowest text-on-surface-variant border-outline-variant"
                }`}
              >
                <MaterialIcon name={opt.icon} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-body-md font-medium text-on-surface">
                  {opt.label}
                </span>
                <span className="block text-label-sm text-on-surface-variant">
                  {opt.description}
                </span>
              </span>
              {selected && (
                <MaterialIcon
                  name="check_circle"
                  className="text-tertiary shrink-0"
                  filled
                />
              )}
            </button>
          );
        })}
      </div>
    </dialog>
  );
}
