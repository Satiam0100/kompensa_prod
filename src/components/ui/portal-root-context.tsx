"use client";

import { createContext, useContext } from "react";

/**
 * Contenedor para portales de dropdowns/calendarios.
 * Dentro de <dialog showModal>, los portales a document.body quedan detrás del modal.
 */
export const PortalRootContext = createContext<HTMLElement | null>(null);

export function usePortalRoot(): HTMLElement {
  const root = useContext(PortalRootContext);
  if (root) return root;
  if (typeof document !== "undefined") return document.body;
  return null as unknown as HTMLElement;
}
