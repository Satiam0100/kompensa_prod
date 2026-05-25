import { type InputHTMLAttributes, type ReactNode } from "react";
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
  const inputClasses = `w-full bg-transparent border-none py-3 text-body-md text-on-surface focus:ring-0 ${className}`;

  const field = icon ? (
    <div
      className={`flex items-center gap-2 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 focus-within:border-tertiary transition-all ${wrapperClassName}`}
    >
      <MaterialIcon name={icon} className="text-outline-variant text-sm" />
      <input className={inputClasses} {...inputProps} />
    </div>
  ) : (
    <input
      className={`bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 text-body-md text-on-surface form-input-focus transition-all ${className}`}
      {...inputProps}
    />
  );

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-label-sm text-on-surface-variant px-1">
        {label}{" "}
        {required && <span className="text-tertiary">*</span>}
      </label>
      {field}
    </div>
  );
}

interface FormSelectProps {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}

export function FormSelect({
  label,
  name,
  defaultValue,
  options,
}: FormSelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-label-sm text-on-surface-variant px-1">
        {label}
      </label>
      <select
        name={name}
        defaultValue={defaultValue}
        className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 text-body-md text-on-surface form-input-focus appearance-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
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
