import { type Ref } from "react";

interface FormStatusMessageProps {
  message: string | null | undefined;
  variant: "error" | "status";
  className?: string;
  ref?: Ref<HTMLParagraphElement>;
}

export function FormStatusMessage({
  message,
  variant,
  className = "",
  ref,
}: FormStatusMessageProps) {
  if (!message) return null;

  return (
    <p
      ref={ref}
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      aria-atomic="true"
      className={className}
    >
      {message}
    </p>
  );
}
