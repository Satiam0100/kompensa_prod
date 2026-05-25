import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";
import { ThemeSettingsButton } from "@/components/theme/ThemeSettingsButton";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export const metadata = {
  title: "Iniciar sesión | Kompensa",
};

export default function LoginPage() {
  return (
    <div className="flex-1 w-full flex items-center justify-center bg-background custom-scrollbar overflow-y-auto p-6 relative">
      <div className="absolute top-6 right-6 w-48">
        <ThemeSettingsButton className="bg-surface-container border border-outline-variant" />
      </div>
      <div className="w-full max-w-md">
        <div className="bg-surface-container border border-outline-variant rounded-lg p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <Image
              src="/kompensa-logo.jpeg"
              alt="Kompensa"
              width={48}
              height={48}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <h1 className="text-headline-sm font-extrabold text-primary leading-none">
                Kompensa
              </h1>
              <p className="text-label-sm text-on-surface-variant">
                Panel de transmisiones
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-tertiary mb-2">
            <MaterialIcon name="lock" className="text-sm" />
            <span className="text-label-mono uppercase tracking-[0.2em]">
              Acceso restringido
            </span>
          </div>
          <h2 className="text-title-md text-on-surface mb-6">
            Iniciar sesión
          </h2>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
