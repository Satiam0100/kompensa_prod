/** Elevación y borde al hover (sin cambio de fondo). */
export const CARD_HOVER_EFFECT =
  "transition-all duration-200 ease-out hover:border-outline hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]";

/** Superficie base de cards en listados (órdenes, emisoras, agencias, campañas). */
export const LIST_CARD_BASE =
  "bg-surface-container border border-outline-variant rounded-lg p-4 space-y-3";

/** Hover ligero en cards de listado. */
export const LIST_CARD_HOVER = `${CARD_HOVER_EFFECT} hover:bg-surface-container-high/50`;

export const LIST_CARD_SELECTED =
  "bg-error-container/20 ring-1 ring-inset ring-error/30";

export function listCardClass(selected = false): string {
  if (selected) {
    return `${LIST_CARD_BASE} transition-all duration-200 ${LIST_CARD_SELECTED}`;
  }
  return `${LIST_CARD_BASE} ${LIST_CARD_HOVER}`;
}

/** Cards de panel / KPI / secciones con padding propio. */
export const PANEL_CARD_BASE =
  "bg-surface-container border border-outline-variant rounded-lg";

export const PANEL_CARD_HOVER = `${CARD_HOVER_EFFECT} hover:bg-surface-container-high/40`;

export function panelCardClass(extra = ""): string {
  return `${PANEL_CARD_BASE} ${PANEL_CARD_HOVER} ${extra}`.trim();
}
