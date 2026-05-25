"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { useTheme } from "./ThemeProvider";
import { ThemeModal } from "./ThemeModal";

const modeLabels = {
  system: "Sistema",
  light: "Claro",
  dark: "Oscuro",
} as const;

interface ThemeSettingsButtonProps {
  className?: string;
}

export function ThemeSettingsButton({
  className = "",
}: ThemeSettingsButtonProps) {
  const [open, setOpen] = useState(false);
  const { mode, resolved } = useTheme();

  const icon =
    mode === "system"
      ? "brightness_auto"
      : resolved === "dark"
        ? "dark_mode"
        : "light_mode";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`w-full flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors duration-150 ${className}`}
      >
        <MaterialIcon name={icon} />
        <span className="text-label-sm flex-1 text-left">Apariencia</span>
        <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">
          {modeLabels[mode]}
        </span>
      </button>
      <ThemeModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
