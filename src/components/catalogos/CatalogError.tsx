interface CatalogErrorProps {
  title: string;
  error: string;
}

export function CatalogError({ title, error }: CatalogErrorProps) {
  return (
    <div className="bg-error-container/20 border border-error rounded-lg p-6 text-on-error-container">
      <p className="text-body-md font-medium mb-1">{title}</p>
      <p className="text-body-sm opacity-90">{error}</p>
      <p className="text-label-sm mt-3 text-on-surface-variant">
        Revisa las variables de entorno (Vercel o{" "}
        <code className="font-label-mono">.env.local</code>) y la conexión a
        Supabase.
      </p>
    </div>
  );
}
