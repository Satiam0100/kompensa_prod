import Link from "next/link";

interface AppFooterProps {
  className?: string;
}

export function AppFooter({ className = "" }: AppFooterProps) {
  return (
    <footer
      className={`shrink-0 px-4 py-4 text-center text-label-sm text-on-surface-variant border-t border-outline-variant bg-surface-container-low ${className}`}
    >
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <Link
          href="/privacidad"
          className="text-primary underline underline-offset-2 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Política de Privacidad
        </Link>
        <span aria-hidden="true" className="text-on-surface-variant/60">
          ·
        </span>
        <Link
          href="https://solware.agency"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Desarrollado por Solware
        </Link>
      </div>
    </footer>
  );
}
