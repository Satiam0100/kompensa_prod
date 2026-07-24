import { AppShell } from "@/components/layout/AppShell";
import { ReconocimientoPanel } from "@/components/reconocimiento/ReconocimientoPanel";

export const metadata = {
  title: "Reconocimiento",
};

export default function ReconocimientoPage() {
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-8 pb-16">
        <ReconocimientoPanel />
      </div>
    </AppShell>
  );
}
