interface ActivaBadgeProps {
  activa: boolean;
}

export function ActivaBadge({ activa }: ActivaBadgeProps) {
  return (
    <span
      className={
        activa
          ? "inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-medium bg-tertiary-container text-on-tertiary-container"
          : "inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-medium bg-surface-container-highest text-on-surface-variant"
      }
    >
      {activa ? "Activa" : "Inactiva"}
    </span>
  );
}
