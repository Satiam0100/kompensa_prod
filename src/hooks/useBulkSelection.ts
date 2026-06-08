"use client";

import { useCallback, useState } from "react";

export function useBulkSelection() {
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const startSelecting = useCallback(() => {
    setSelecting(true);
    setSelectedIds(new Set());
  }, []);

  const cancelSelecting = useCallback(() => {
    setSelecting(false);
    setSelectedIds(new Set());
    setConfirmOpen(false);
  }, []);

  const toggleSelecting = useCallback(() => {
    setSelecting((current) => {
      if (current) {
        setSelectedIds(new Set());
        setConfirmOpen(false);
      }
      return !current;
    });
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const requestDelete = useCallback(() => {
    if (selectedIds.size > 0) setConfirmOpen(true);
  }, [selectedIds.size]);

  const closeConfirm = useCallback(() => {
    if (!deleting) setConfirmOpen(false);
  }, [deleting]);

  return {
    selecting,
    selectedIds,
    selectedCount: selectedIds.size,
    confirmOpen,
    deleting,
    setDeleting,
    startSelecting,
    cancelSelecting,
    toggleSelecting,
    toggleSelect,
    requestDelete,
    closeConfirm,
    finishDelete: cancelSelecting,
  };
}

export type BulkSelection = ReturnType<typeof useBulkSelection>;
