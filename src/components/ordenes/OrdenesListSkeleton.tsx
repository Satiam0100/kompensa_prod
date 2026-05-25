export function OrdenesListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-surface-container-low rounded-lg max-w-md" />
      <div className="hidden lg:block bg-surface-container border border-outline-variant rounded-lg overflow-hidden">
        <div className="h-12 bg-surface-container-low border-b border-outline-variant" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-16 border-b border-outline-variant/40 px-4 flex items-center gap-4"
          >
            <div className="h-4 bg-surface-container-high rounded flex-1 max-w-xs" />
            <div className="h-4 bg-surface-container-high rounded w-24" />
            <div className="h-4 bg-surface-container-high rounded w-20" />
          </div>
        ))}
      </div>
      <div className="lg:hidden grid gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-28 bg-surface-container border border-outline-variant rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}
