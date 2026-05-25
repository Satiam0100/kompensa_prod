import type { SvgIconProps } from "@mui/material/SvgIcon";
import { ICONS, type IconName } from "./icons";

interface MaterialIconProps {
  name: string;
  className?: string;
  /** Compatibilidad: los iconos MUI filled son el estilo por defecto del paquete */
  filled?: boolean;
  style?: SvgIconProps["style"];
  fontSize?: SvgIconProps["fontSize"];
}

export function MaterialIcon({
  name,
  className = "",
  style,
  fontSize = "inherit",
}: MaterialIconProps) {
  const Icon = ICONS[name as IconName];

  if (!Icon) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[MaterialIcon] Icono no mapeado: "${name}"`);
    }
    return null;
  }

  return (
    <Icon
      className={className}
      style={style}
      fontSize={fontSize}
      aria-hidden
    />
  );
}
