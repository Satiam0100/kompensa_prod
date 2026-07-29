import { AppShell } from "@/components/layout/AppShell";

export default function ReconocimientoLoading() {
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-8 pb-16">
        <div className="space-y-6 animate-pulse">
          <div className="mb-2 space-y-2">
            <div className="h-10 w-64 bg-surface-container-high rounded mb-2" />
            <div className="h-5 w-full max-w-xl bg-surface-container-low rounded" />
          </div>

          <div className="bg-surface-container border border-outline-variant rounded-lg p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5">
                <div className="h-4 w-16 bg-surface-container-high rounded" />
                <div className="h-12 bg-surface-container-lowest rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <div className="h-4 w-16 bg-surface-container-high rounded" />
                <div className="h-12 bg-surface-container-lowest rounded-lg" />
              </div>
              <div className="h-12 bg-surface-container-high rounded-lg" />
            </div>
          </div>

          <div className="bg-surface-container border border-outline-variant rounded-lg p-12">
            <div className="mx-auto h-12 w-12 bg-surface-container-high rounded-full mb-4" />
            <div className="mx-auto h-5 w-48 bg-surface-container-high rounded mb-2" />
            <div className="mx-auto h-4 w-72 max-w-full bg-surface-container-low rounded" />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
