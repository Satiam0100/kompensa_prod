import type { CSSProperties } from "react";

export type FloatingPlacement = "above" | "below";

export interface FloatingMenuPosition {
  placement: FloatingPlacement;
  style: CSSProperties;
}

function isBodyPortalRoot(portalRoot: HTMLElement): boolean {
  return portalRoot === document.body;
}

export function computeFloatingMenuPosition(
  triggerEl: HTMLElement,
  portalRoot: HTMLElement,
  menuHeight: number,
  gap = 0,
): FloatingMenuPosition {
  const triggerRect = triggerEl.getBoundingClientRect();
  const width = triggerRect.width;

  if (!isBodyPortalRoot(portalRoot)) {
    const rootRect = portalRoot.getBoundingClientRect();
    const spaceBelow = rootRect.bottom - triggerRect.bottom;
    const spaceAbove = triggerRect.top - rootRect.top;
    const openBelow = spaceBelow >= menuHeight || spaceBelow >= spaceAbove;
    const top = openBelow
      ? triggerRect.bottom - rootRect.top + gap
      : Math.max(0, triggerRect.top - rootRect.top - menuHeight - gap);
    const left = triggerRect.left - rootRect.left;

    return {
      placement: openBelow ? "below" : "above",
      style: { position: "absolute", top, left, width },
    };
  }

  const spaceBelow = window.innerHeight - triggerRect.bottom;
  const spaceAbove = triggerRect.top;
  const openBelow = spaceBelow >= menuHeight || spaceAbove >= spaceBelow;

  let top = openBelow
    ? triggerRect.bottom + gap
    : triggerRect.top - menuHeight - gap;

  if (!openBelow) {
    top = Math.max(8, top);
  }

  return {
    placement: openBelow ? "below" : "above",
    style: { position: "fixed", top, left: triggerRect.left, width },
  };
}

/** Posición del date picker (respeta márgenes horizontales en viewport). */
export function computeFloatingPopoverPosition(
  triggerEl: HTMLElement,
  portalRoot: HTMLElement,
  popoverHeight: number,
  gap = 0,
): FloatingMenuPosition {
  const triggerRect = triggerEl.getBoundingClientRect();
  const width = triggerRect.width;

  if (!isBodyPortalRoot(portalRoot)) {
    const rootRect = portalRoot.getBoundingClientRect();
    const spaceBelow = rootRect.bottom - triggerRect.bottom;
    const spaceAbove = triggerRect.top - rootRect.top;
    const openBelow = spaceBelow >= popoverHeight || spaceAbove >= spaceBelow;
    const top = openBelow
      ? triggerRect.bottom - rootRect.top + gap
      : Math.max(0, triggerRect.top - rootRect.top - popoverHeight - gap);
    let left = triggerRect.left - rootRect.left;
    left = Math.max(0, Math.min(left, rootRect.width - width));

    return {
      placement: openBelow ? "below" : "above",
      style: { position: "absolute", top, left, width },
    };
  }

  let left = triggerRect.left;
  if (left + width > window.innerWidth - 16) {
    left = window.innerWidth - width - 16;
  }
  left = Math.max(16, left);

  const spaceBelow = window.innerHeight - triggerRect.bottom;
  const spaceAbove = triggerRect.top;
  const openBelow = spaceBelow >= popoverHeight || spaceAbove >= spaceBelow;
  const top = openBelow
    ? triggerRect.bottom + gap
    : Math.max(8, triggerRect.top - popoverHeight - gap);

  return {
    placement: openBelow ? "below" : "above",
    style: { position: "fixed", top, left, width },
  };
}

export const FLOATING_MENU_CLASS =
  "form-select-menu pointer-events-auto z-[100] max-h-80 overflow-y-auto custom-scrollbar";

export const FLOATING_SELECT_MENU_CLASS =
  "form-select-menu pointer-events-auto z-[100]";
