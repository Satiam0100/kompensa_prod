import type { ReactNode } from "react";

const baseClasses =
  "inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-medium";

const variantClasses = {
  success: "bg-tertiary-container text-on-tertiary-container",
  warning: "bg-error-container/40 text-on-error-container",
  neutral: "bg-surface-container-highest text-on-surface-variant",
  primary: "bg-primary-container text-on-primary-container",
} as const;

export type StatusBadgeVariant = keyof typeof variantClasses;

interface StatusBadgeProps {
  children: ReactNode;
  variant: StatusBadgeVariant;
}

export function StatusBadge({ children, variant }: StatusBadgeProps) {
  return (
    <span className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}
