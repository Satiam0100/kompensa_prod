"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

interface EditModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function EditModal({ open, title, onClose, children }: EditModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

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
      className="backdrop:bg-black/60 bg-surface-container text-on-surface border border-outline-variant rounded-xl p-0 w-[calc(100%-2rem)] max-w-lg max-h-[90vh] shadow-2xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0 overflow-hidden"
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
      <div className="p-5 overflow-y-auto max-h-[calc(90vh-4.5rem)]">
        {children}
      </div>
    </dialog>
  );
}
