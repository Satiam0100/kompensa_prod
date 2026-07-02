"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { CARD_HOVER_EFFECT } from "./card-classes";
import {
  FORM_FIELD_CONTROL,
  FORM_FIELD_CONTROL_PLAIN,
  FORM_FIELD_INPUT,
  FORM_FIELD_TEXTAREA_CONTROL,
} from "./form-field-classes";
import { MaterialIcon } from "./MaterialIcon";

export interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  icon?: string;
  hint?: string;
  wrapperClassName?: string;
}

export function FormField({
  label,
  required,
  icon,
  hint,
  wrapperClassName = "",
  className = "",
  id,
  name,
  "aria-describedby": ariaDescribedBy,
  ...inputProps
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? name ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const describedBy =
    [hintId, ariaDescribedBy].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={fieldId}
        className="text-label-sm text-on-surface-variant px-1"
      >
        {label}{" "}
        {required && (
          <span className="text-tertiary" aria-hidden="true">
            *
          </span>
        )}
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
          id={fieldId}
          name={name}
          required={required}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          className={`${FORM_FIELD_INPUT} ${className}`}
          {...inputProps}
        />
      </div>
      {hint && (
        <p
          id={hintId}
          className="text-label-sm text-on-surface-variant px-1"
        >
          {hint}
        </p>
      )}
    </div>
  );
}

interface FormCheckboxProps {
  label: string;
  name: string;
  defaultChecked?: boolean;
}

export function FormCheckbox({
  label,
  name,
  defaultChecked = false,
}: FormCheckboxProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer px-1">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        value="true"
        className="w-4 h-4 rounded border-outline-variant text-tertiary focus:ring-tertiary"
      />
      <span className="text-body-sm text-on-surface">{label}</span>
    </label>
  );
}

interface FormTextareaProps {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  id?: string;
}

export function FormTextarea({
  label,
  name,
  defaultValue,
  placeholder,
  rows = 3,
  required,
  id,
}: FormTextareaProps) {
  const generatedId = useId();
  const fieldId = id ?? name ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={fieldId}
        className="text-label-sm text-on-surface-variant px-1"
      >
        {label}
        {required && <span className="text-tertiary"> *</span>}
      </label>
      <div className={FORM_FIELD_TEXTAREA_CONTROL}>
        <textarea
          id={fieldId}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          rows={rows}
          required={required}
          aria-required={required || undefined}
          className={`${FORM_FIELD_INPUT} block w-full resize-y min-h-[80px] py-3`}
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
      ? "bg-tertiary-container border border-on-tertiary-container text-tertiary group-hover:brightness-110 transition-colors"
      : "bg-primary-container border border-outline-variant text-primary group-hover:bg-primary group-hover:text-surface transition-colors";

  const surface =
    iconVariant === "tertiary"
      ? "bg-surface-container-low hover:bg-surface-container"
      : "bg-surface-container hover:bg-surface-container-high";

  return (
    <div
      className={`${colSpan} group ${surface} p-6 rounded-lg border border-outline-variant relative overflow-hidden ${CARD_HOVER_EFFECT} ${className}`}
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
        <h2 className="text-title-md">{title}</h2>
      </div>
      {children}
    </div>
  );
}
