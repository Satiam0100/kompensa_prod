import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";
import { AppFooter } from "@/components/layout/AppFooter";
import { ThemeSettingsButton } from "@/components/theme/ThemeSettingsButton";
import { isAuthConfigured } from "@/lib/auth/config";

export const metadata = {
  title: "Iniciar sesión",
};

export default function LoginPage() {
  return (
    <div className="flex-1 w-full flex flex-col min-h-0 bg-background custom-scrollbar overflow-y-auto p-6 relative">
      <div className="absolute top-6 right-6 w-48">
        <ThemeSettingsButton className="bg-surface-container border border-outline-variant" />
      </div>
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-surface-container border border-outline-variant rounded-lg p-8 shadow-2xl">
          <div className="flex justify-center mb-8">
            <Image
              src="/kompensa-logo.jpeg"
              alt="Kompensa"
              width={64}
              height={64}
              priority
              className="w-16 h-16 rounded-lg object-cover"
            />
          </div>

          <h1 className="text-title-md text-on-surface mb-6">
            Iniciar sesión
          </h1>

          {!isAuthConfigured() && (
            <p className="text-body-sm text-on-surface-variant bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2 mb-4">
              Modo temporal: usuario <strong>admin</strong>, contraseña{" "}
              <strong>admin</strong>.
            </p>
          )}

          <LoginForm />
          </div>
        </div>
      </div>
      <AppFooter className="mt-auto border-t-0 bg-transparent" />
    </div>
  );
}
