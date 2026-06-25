import { CAMPANAS_GRID_CLASS } from "@/components/campanas/CampanaCard";

export function CampanasListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="space-y-2 mb-8">
        <div className="h-10 bg-surface-container-low rounded-lg w-48" />
        <div className="h-5 bg-surface-container-low rounded-lg max-w-xl" />
      </div>
      <div className="h-10 bg-surface-container-low rounded-lg max-w-md" />
      <div className={CAMPANAS_GRID_CLASS}>
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
              <div className="h-6 w-20 bg-surface-container-high rounded-full" />
            </div>
            <div className="h-2 bg-surface-container-high rounded-full" />
            <div className="h-3 bg-surface-container-high rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
