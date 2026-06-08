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
import { MaterialIcon } from "./MaterialIcon";

const POPOVER_HEIGHT = 240;
const POPOVER_GAP = 0;

interface FormDateFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue"> {
  label: string;
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
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const displayRef = useRef<HTMLInputElement>(null);
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
    if (hiddenRef.current) hiddenRef.current.value = iso;
    const parsed = fromISODate(iso);
    if (parsed) setViewDate(parsed);
  }, []);

  const updatePopoverPosition = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const popoverHeight =
      popoverRef.current?.getBoundingClientRect().height ?? POPOVER_HEIGHT;

    const width = rect.width;
    let left = rect.left;
    if (left + width > window.innerWidth - 16) {
      left = window.innerWidth - width - 16;
    }
    left = Math.max(16, left);

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openBelow =
      spaceBelow >= popoverHeight || spaceBelow >= spaceAbove;
    const nextPlacement: DatePickerPlacement = openBelow ? "below" : "above";

    const top = openBelow
      ? rect.bottom + POPOVER_GAP
      : Math.max(8, rect.top - popoverHeight - POPOVER_GAP);

    setPlacement(nextPlacement);
    setPopoverStyle({ top, left, width });
  }, []);

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
      if (hiddenRef.current) hiddenRef.current.value = defaultValue;
    };

    form.addEventListener("reset", handleReset);
    return () => form.removeEventListener("reset", handleReset);
  }, [defaultValue]);

  const handleSelect = (date: Date) => {
    commitISO(toISODate(date));
    setOpen(false);
  };

  const handleTextChange = (value: string) => {
    setTextValue(formatDateMaskFromDigits(value));
  };

  const handleTextBlur = () => {
    const parsed = parseMaskedDate(textValue);

    if (parsed === null) {
      setTextValue(isoToDisplayInput(selectedISO));
      return;
    }

    if (parsed === "") {
      commitISO("");
      return;
    }

    if (!isISOInRange(parsed, minStr, maxStr)) {
      setTextValue(isoToDisplayInput(selectedISO));
      return;
    }

    commitISO(parsed);
  };

  const flushPendingValue = useCallback(() => {
    const raw = displayRef.current?.value ?? textValue;
    const parsed = parseMaskedDate(raw);

    if (parsed === null) {
      setTextValue(isoToDisplayInput(selectedISO));
      return;
    }

    if (parsed === "") {
      commitISO("");
      return;
    }

    if (!isISOInRange(parsed, minStr, maxStr)) {
      setTextValue(isoToDisplayInput(selectedISO));
      return;
    }

    commitISO(parsed);
  }, [commitISO, minStr, maxStr, selectedISO, textValue]);

  useEffect(() => {
    const form = containerRef.current?.closest("form");
    if (!form) return;

    const handleSubmit = () => {
      flushPendingValue();
    };

    form.addEventListener("submit", handleSubmit, true);
    return () => form.removeEventListener("submit", handleSubmit, true);
  }, [flushPendingValue]);

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
          ref={hiddenRef}
          type="hidden"
          name={name}
          defaultValue={defaultValue}
          required={required}
          min={min}
          max={max}
          {...inputProps}
        />
        <input
          ref={displayRef}
          id={fieldId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="dd/mm/aaaa"
          maxLength={10}
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
            document.body,
          )}
      </div>
    </div>
  );
}
