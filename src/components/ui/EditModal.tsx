"use client";

import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { PortalRootContext } from "@/components/ui/portal-root-context";

const MAX_WIDTH_CLASS = {
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
} as const;

interface EditModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: keyof typeof MAX_WIDTH_CLASS;
}

export function EditModal({
  open,
  title,
  onClose,
  children,
  maxWidth = "lg",
}: EditModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const portalLayerRef = useRef<HTMLDivElement>(null);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useLayoutEffect(() => {
    setPortalRoot(open ? portalLayerRef.current : null);
  }, [open]);

  return (
    <PortalRootContext value={portalRoot}>
      <dialog
        ref={dialogRef}
        onClose={onClose}
        className={`backdrop:bg-black/60 bg-surface-container text-on-surface border border-outline-variant rounded-xl p-0 w-[calc(100%-2rem)] ${MAX_WIDTH_CLASS[maxWidth]} max-h-[90vh] shadow-2xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0 overflow-hidden`}
      >
        <div className="p-5 border-b border-outline-variant flex items-center justify-between shrink-0">
          <h3 className="text-title-md">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-container-highest text-on-surface-variant"
            aria-label="Cerrar"
          >
            <MaterialIcon name="close" />
          </button>
        </div>
        <div className="relative p-5 overflow-y-auto max-h-[calc(90vh-4.5rem)]">
          {children}
        </div>
        <div
          ref={portalLayerRef}
          className="pointer-events-none absolute inset-0 z-[100] overflow-visible"
          aria-hidden
        />
      </dialog>
    </PortalRootContext>
  );
}
