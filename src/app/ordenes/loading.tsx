import { AppShell } from "@/components/layout/AppShell";
import { OrdenesListSkeleton } from "@/components/ordenes/OrdenesListSkeleton";

export default function OrdenesLoading() {
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-8 pb-16">
        <div className="mb-8">
          <div className="h-10 w-64 bg-surface-container-high rounded animate-pulse mb-2" />
          <div className="h-5 w-96 max-w-full bg-surface-container-low rounded animate-pulse" />
        </div>
        <OrdenesListSkeleton />
      </div>
    </AppShell>
  );
}
