"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type InputHTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import {
  DatePickerPopover,
  type DatePickerPlacement,
} from "./DatePickerPopover";
import {
  formatDateMaskFromDigits,
  fromISODate,
  isoToDisplayInput,
  isISOInRange,
  parseMaskedDate,
  toISODate,
} from "./date-picker-utils";
import { FORM_FIELD_CONTROL, FORM_FIELD_INPUT } from "./form-field-classes";
import { computeFloatingPopoverPosition } from "./floating-menu-position";
import { MaterialIcon } from "./MaterialIcon";
import { usePortalRoot } from "./portal-root-context";

const POPOVER_HEIGHT = 240;
const POPOVER_GAP = 0;

interface FormDateFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "name"> {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
}

export function FormDateField({
  label,
  required,
  name,
  defaultValue = "",
  min,
  max,
  className = "",
  id,
  ...inputProps
}: FormDateFieldProps) {
  const portalRoot = usePortalRoot();
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [selectedISO, setSelectedISO] = useState(defaultValue);
  const [textValue, setTextValue] = useState(() => isoToDisplayInput(defaultValue));
  const [viewDate, setViewDate] = useState(
    () => fromISODate(defaultValue) ?? new Date(),
  );
  const [popoverStyle, setPopoverStyle] = useState<CSSProperties>({});
  const [placement, setPlacement] = useState<DatePickerPlacement>("below");

  const minStr = min != null ? String(min) : undefined;
  const maxStr = max != null ? String(max) : undefined;

  const commitISO = useCallback((iso: string) => {
    setSelectedISO(iso);
    setTextValue(isoToDisplayInput(iso));
    const parsed = fromISODate(iso);
    if (parsed) setViewDate(parsed);
  }, []);

  const normalizeTextValue = useCallback(
    (raw: string): string => {
      const trimmed = raw.trim();
      if (!trimmed) return "";

      const masked = parseMaskedDate(trimmed);
      if (typeof masked === "string" && masked !== "") {
        if (!isISOInRange(masked, minStr, maxStr)) {
          return isoToDisplayInput(selectedISO);
        }
        commitISO(masked);
        return isoToDisplayInput(masked);
      }

      if (masked === "") {
        commitISO("");
        return "";
      }

      return isoToDisplayInput(selectedISO);
    },
    [commitISO, maxStr, minStr, selectedISO],
  );

  const updatePopoverPosition = useCallback(() => {
    if (!triggerRef.current) return;

    const popoverHeight =
      popoverRef.current?.getBoundingClientRect().height ?? POPOVER_HEIGHT;

    const { placement: nextPlacement, style } = computeFloatingPopoverPosition(
      triggerRef.current,
      portalRoot,
      popoverHeight,
      POPOVER_GAP,
    );

    setPlacement(nextPlacement);
    setPopoverStyle(style);
  }, [portalRoot]);

  useEffect(() => {
    if (!open) return;

    updatePopoverPosition();
    const frame = requestAnimationFrame(() => updatePopoverPosition());

    window.addEventListener("resize", updatePopoverPosition);
    window.addEventListener("scroll", updatePopoverPosition, true);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePopoverPosition);
      window.removeEventListener("scroll", updatePopoverPosition, true);
    };
  }, [open, updatePopoverPosition]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      if ((target as Element).closest?.("[data-date-picker-popover]")) return;
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    const form = containerRef.current?.closest("form");
    if (!form) return;

    const handleReset = () => {
      setSelectedISO(defaultValue);
      setTextValue(isoToDisplayInput(defaultValue));
      setViewDate(fromISODate(defaultValue) ?? new Date());
    };

    form.addEventListener("reset", handleReset);
    return () => form.removeEventListener("reset", handleReset);
  }, [defaultValue]);

  const handleSelect = (date: Date) => {
    commitISO(toISODate(date));
    setOpen(false);
  };

  const handleTextChange = (value: string) => {
    const masked = formatDateMaskFromDigits(value);
    setTextValue(masked);

    const parsed = parseMaskedDate(masked);
    if (typeof parsed === "string" && parsed !== "") {
      if (isISOInRange(parsed, minStr, maxStr)) {
        setSelectedISO(parsed);
        const parsedDate = fromISODate(parsed);
        if (parsedDate) setViewDate(parsedDate);
      }
    } else if (parsed === "") {
      setSelectedISO("");
    }
  };

  const handleTextBlur = () => {
    setTextValue((current) => normalizeTextValue(current));
  };

  useEffect(() => {
    const form = containerRef.current?.closest("form");
    if (!form) return;

    const handleSubmit = () => {
      setTextValue((current) => normalizeTextValue(current));
    };

    form.addEventListener("submit", handleSubmit, true);
    return () => form.removeEventListener("submit", handleSubmit, true);
  }, [normalizeTextValue]);

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <label htmlFor={fieldId} className="text-label-sm text-on-surface-variant px-1">
        {label}{" "}
        {required && <span className="text-tertiary">*</span>}
      </label>
      <div
        ref={triggerRef}
        className={`${FORM_FIELD_CONTROL} form-date-field ${open ? "form-field-control--open !border-tertiary !shadow-[0_0_0_1px_var(--color-tertiary)]" : ""} ${className}`}
      >
        <input
          id={fieldId}
          name={name}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="dd/mm/aaaa"
          maxLength={10}
          required={required}
          className={`${FORM_FIELD_INPUT} form-date-display ${selectedISO ? "text-on-surface" : "text-on-surface-variant"}`}
          value={textValue}
          onChange={(event) => handleTextChange(event.target.value)}
          onBlur={handleTextBlur}
          onFocus={() => setOpen(false)}
          onKeyDown={(event) => {
            const allowedKeys = [
              "Backspace",
              "Delete",
              "Tab",
              "ArrowLeft",
              "ArrowRight",
              "Home",
              "End",
            ];
            if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
              return;
            }
            if (event.key.length === 1 && !/\d/.test(event.key)) {
              event.preventDefault();
            }
          }}
          onPaste={(event) => {
            event.preventDefault();
            const pasted = event.clipboardData.getData("text");
            handleTextChange(pasted);
          }}
          {...inputProps}
        />
        <button
          type="button"
          className="form-date-trigger"
          onClick={() => {
            setOpen((current) => {
              const next = !current;
              if (next) updatePopoverPosition();
              return next;
            });
          }}
          aria-label="Abrir calendario"
          aria-expanded={open}
        >
          <MaterialIcon name="calendar_today" className="text-[18px]" />
        </button>
        {open &&
          createPortal(
            <DatePickerPopover
              ref={popoverRef}
              viewDate={viewDate}
              selectedISO={selectedISO}
              min={minStr}
              max={maxStr}
              style={popoverStyle}
              placement={placement}
              onViewChange={setViewDate}
              onSelect={handleSelect}
            />,
            portalRoot,
          )}
      </div>
    </div>
  );
}
