import Image from "next/image";
import Link from "next/link";
import { PrivacyPolicyContent } from "@/components/legal/PrivacyPolicyContent";

export const metadata = {
  title: "Política de Privacidad",
  description:
    "Política de privacidad de Kompensa sobre el tratamiento de datos personales en el panel de transmisiones.",
};

export default function PrivacidadPage() {
  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-background">
      <div className="max-w-3xl mx-auto w-full p-8 pb-6 flex-grow">
        <div className="flex items-center gap-3 mb-8">
          <Image
            src="/kompensa-logo.jpeg"
            alt="Kompensa"
            width={40}
            height={40}
            className="w-10 h-10 rounded-lg object-cover"
          />
          <span className="text-headline-sm font-extrabold text-primary leading-none">
            Kompensa
          </span>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-label-sm text-on-surface-variant hover:text-primary mb-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          ← Volver al acceso
        </Link>

        <h1 className="text-display-lg text-on-surface mb-8">
          Política de Privacidad
        </h1>

        <PrivacyPolicyContent />
      </div>
    </div>
  );
}
