import { AppShell } from "@/components/layout/AppShell";
import { CampanasListSkeleton } from "@/components/campanas/CampanasListSkeleton";

export default function CampanasLoading() {
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-8 pb-16">
        <CampanasListSkeleton />
      </div>
    </AppShell>
  );
}
