import { ORDENES_GRID_CLASS } from "@/components/ordenes/OrdenCard";

export function OrdenesListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-surface-container-low rounded-lg max-w-md" />
      <div className={ORDENES_GRID_CLASS}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface-container border border-outline-variant rounded-lg p-4 space-y-3"
          >
            <div className="flex justify-between gap-2">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-surface-container-high rounded w-3/4" />
                <div className="h-3 bg-surface-container-high rounded w-1/2" />
              </div>
              <div className="h-6 w-16 bg-surface-container-high rounded-full shrink-0" />
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-surface-container-high rounded w-full" />
              <div className="h-3 bg-surface-container-high rounded w-2/3" />
              <div className="h-3 bg-surface-container-high rounded w-1/2" />
            </div>
            <div className="h-3 bg-surface-container-high rounded w-1/3 pt-1 border-t border-outline-variant/40" />
          </div>
        ))}
      </div>
    </div>
  );
}
