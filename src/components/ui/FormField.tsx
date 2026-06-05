import { type InputHTMLAttributes, type ReactNode } from "react";
import {
  FORM_FIELD_CONTROL,
  FORM_FIELD_CONTROL_PLAIN,
  FORM_FIELD_INPUT,
} from "./form-field-classes";
import { MaterialIcon } from "./MaterialIcon";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  icon?: string;
  wrapperClassName?: string;
}

export function FormField({
  label,
  required,
  icon,
  wrapperClassName = "",
  className = "",
  ...inputProps
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-label-sm text-on-surface-variant px-1">
        {label}{" "}
        {required && <span className="text-tertiary">*</span>}
      </label>
      <div
        className={`${icon ? FORM_FIELD_CONTROL : FORM_FIELD_CONTROL_PLAIN} ${wrapperClassName}`}
      >
        {icon && (
          <MaterialIcon
            name={icon}
            className="shrink-0 text-outline-variant text-sm transition-colors group-hover:text-tertiary group-focus-within:text-tertiary"
          />
        )}
        <input
          className={`${FORM_FIELD_INPUT} ${className}`}
          {...inputProps}
        />
      </div>
    </div>
  );
}

interface SectionCardProps {
  title: string;
  icon: string;
  iconVariant?: "primary" | "tertiary";
  children: ReactNode;
  className?: string;
  colSpan?: string;
  decorationIcon?: string;
}

export function SectionCard({
  title,
  icon,
  iconVariant = "primary",
  children,
  className = "",
  colSpan = "md:col-span-8",
  decorationIcon,
}: SectionCardProps) {
  const iconBox =
    iconVariant === "tertiary"
      ? "bg-tertiary-container border border-on-tertiary-container text-tertiary"
      : "bg-primary-container border border-outline-variant text-primary group-hover:bg-primary group-hover:text-surface transition-colors";

  const bg =
    iconVariant === "tertiary"
      ? "bg-surface-container-low"
      : "bg-surface-container group hover:border-outline transition-colors";

  return (
    <div
      className={`${colSpan} ${bg} p-6 rounded-lg border border-outline-variant relative overflow-hidden ${className}`}
    >
      {decorationIcon && (
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <MaterialIcon
            name={decorationIcon}
            className="text-[120px]"
            filled
          />
        </div>
      )}
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`w-8 h-8 rounded flex items-center justify-center ${iconBox}`}
        >
          <MaterialIcon name={icon} className="text-[20px]" />
        </div>
        <h3 className="text-title-md">{title}</h3>
      </div>
      {children}
    </div>
  );
}
