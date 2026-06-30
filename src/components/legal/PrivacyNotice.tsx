import Link from "next/link";

interface PrivacyNoticeProps {
  className?: string;
}

export function PrivacyNotice({ className = "" }: PrivacyNoticeProps) {
  return (
    <p className={`text-label-sm text-on-surface-variant ${className}`}>
      Al enviar este formulario, confirmas que cuentas con autorización para
      registrar los datos de contacto del cliente (email y teléfono/WhatsApp).{" "}
      <Link
        href="/privacidad"
        className="text-primary underline underline-offset-2 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Política de Privacidad
      </Link>
      .
    </p>
  );
}
