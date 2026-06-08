"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
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
      onClose={onCancel}
      className="backdrop:bg-black/60 bg-surface-container text-on-surface border border-outline-variant rounded-xl p-0 w-[calc(100%-2rem)] max-w-md shadow-2xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0 overflow-hidden"
    >
      <div className="p-5 border-b border-outline-variant">
        <h3 className="text-title-md">{title}</h3>
      </div>
      <div className="p-5 text-body-sm text-on-surface-variant">{message}</div>
      <div className="p-5 pt-0 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 text-body-sm font-medium text-on-surface-variant hover:text-on-surface rounded-lg disabled:opacity-60"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2 bg-error text-on-error text-body-sm font-bold rounded-lg hover:brightness-110 disabled:opacity-70"
        >
          {loading ? (
            <MaterialIcon name="sync" className="animate-spin text-sm" />
          ) : (
            <MaterialIcon name="delete" className="text-sm" />
          )}
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
