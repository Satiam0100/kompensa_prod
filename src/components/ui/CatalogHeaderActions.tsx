import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

interface CatalogHeaderActionsProps {
  addLabel: string;
  addHref?: string;
  onAdd?: () => void;
  selecting: boolean;
  onToggleDeleteMode: () => void;
  deleteDisabled?: boolean;
}

const primaryBtn =
  "shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 bg-tertiary text-on-tertiary font-bold rounded-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none";

const deleteBtn =
  "shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-lg border transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

export function CatalogHeaderActions({
  addLabel,
  addHref,
  onAdd,
  selecting,
  onToggleDeleteMode,
  deleteDisabled = false,
}: CatalogHeaderActionsProps) {
  const addContent = (
    <>
      <MaterialIcon name="add" />
      {addLabel}
    </>
  );

  return (
    <div className="flex flex-wrap items-center gap-3 shrink-0">
      {selecting ? (
        <span className={`${primaryBtn} opacity-50 pointer-events-none`}>
          {addContent}
        </span>
      ) : addHref ? (
        <Link href={addHref} className={primaryBtn}>
          {addContent}
        </Link>
      ) : (
        <button type="button" onClick={onAdd} className={primaryBtn}>
          {addContent}
        </button>
      )}
      <button
        type="button"
        onClick={onToggleDeleteMode}
        disabled={deleteDisabled}
        className={`${deleteBtn} ${
          selecting
            ? "bg-surface-container-high border-outline text-on-surface"
            : "bg-surface-container border-outline-variant text-on-surface-variant hover:border-error hover:text-error"
        }`}
      >
        <MaterialIcon name={selecting ? "close" : "delete"} />
        {selecting ? "Cancelar selección" : "Eliminar"}
      </button>
    </div>
  );
}
