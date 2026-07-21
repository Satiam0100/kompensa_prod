"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { FORM_FIELD_CONTROL_PLAIN } from "./form-field-classes";
import {
  computeFloatingMenuPosition,
  FLOATING_SELECT_MENU_CLASS,
  subscribeFloatingOverlayListeners,
} from "./floating-menu-position";
import { MaterialIcon } from "./MaterialIcon";
import { usePortalRoot } from "./portal-root-context";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface FormSelectProps {
  label: string;
  name: string;
  id?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  options: SelectOption[];
  className?: string;
}

const MENU_GAP = 0;
const MENU_ITEM_HEIGHT = 40;
const MENU_PADDING = 8;

export function FormSelect({
  label,
  name,
  id,
  defaultValue = "",
  value: controlledValue,
  onChange,
  required,
  options,
  className = "",
}: FormSelectProps) {
  const portalRoot = usePortalRoot();
  const fieldId = id ?? name;
  const labelId = `${fieldId}-label`;
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const isControlled = controlledValue !== undefined;
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(
    () => controlledValue ?? (defaultValue || options[0]?.value || ""),
  );
  const value = isControlled ? controlledValue : internalValue;
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const [menuPlacement, setMenuPlacement] = useState<"above" | "below">(
    "below",
  );

  const selectedOption =
    options.find((option) => option.value === value) ?? options[0];
  const menuHeight = options.length * MENU_ITEM_HEIGHT + MENU_PADDING * 2;

  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) return;

    const { placement, style } = computeFloatingMenuPosition(
      triggerRef.current,
      portalRoot,
      menuHeight,
      MENU_GAP,
    );

    setMenuPlacement(placement);
    setMenuStyle(style);
  }, [menuHeight, portalRoot]);

  const commitValue = useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      onChange?.(nextValue);
      if (hiddenRef.current) hiddenRef.current.value = nextValue;
    },
    [isControlled, onChange],
  );

  useEffect(() => {
    if (hiddenRef.current) hiddenRef.current.value = value;
  }, [value]);

  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    updateMenuPosition();
    return subscribeFloatingOverlayListeners({
      onReposition: updateMenuPosition,
      onClose: closeMenu,
      menuSelector: "[data-form-select-menu]",
    });
  }, [open, updateMenuPosition, closeMenu]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      if ((target as Element).closest?.("[data-form-select-menu]")) return;
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
      const resetValue = defaultValue || options[0]?.value || "";
      commitValue(resetValue);
    };

    form.addEventListener("reset", handleReset);
    return () => form.removeEventListener("reset", handleReset);
  }, [commitValue, defaultValue, options]);

  const toggleOpen = () => {
    setOpen((current) => {
      const next = !current;
      if (next) updateMenuPosition();
      return next;
    });
  };

  const handleSelect = (nextValue: string) => {
    const option = options.find((item) => item.value === nextValue);
    if (option?.disabled) return;
    commitValue(nextValue);
    setOpen(false);
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`} ref={containerRef}>
      <label
        id={labelId}
        htmlFor={fieldId}
        className="text-label-sm text-on-surface-variant px-1"
      >
        {label}
        {required && (
          <span className="text-tertiary" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      <div
        ref={triggerRef}
        className={`${FORM_FIELD_CONTROL_PLAIN} form-select-field ${open ? `form-field-control--open form-select-field--open form-select-field--open-${menuPlacement} !border-tertiary !shadow-[0_0_0_1px_var(--color-tertiary)]` : ""}`}
      >
        <input
          ref={hiddenRef}
          type="hidden"
          name={name}
          value={value}
          required={required}
          tabIndex={-1}
          aria-hidden="true"
        />
        <button
          type="button"
          id={fieldId}
          className="form-select-trigger"
          onClick={toggleOpen}
          aria-labelledby={labelId}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-required={required || undefined}
        >
          <span className="truncate text-left">
            {selectedOption?.label ?? "Seleccionar"}
          </span>
          <MaterialIcon
            name="expand_more"
            className={`shrink-0 text-outline-variant transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open &&
          createPortal(
            <ul
              data-form-select-menu
              role="listbox"
              aria-label={label}
              style={menuStyle}
              className={`${FLOATING_SELECT_MENU_CLASS} form-select-menu--${menuPlacement}`}
            >
              {options.map((option) => {
                const isSelected = option.value === value;
                const isDisabled = Boolean(option.disabled);
                return (
                  <li key={option.value} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={isDisabled}
                      disabled={isDisabled}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleSelect(option.value)}
                      className={[
                        "form-select-option",
                        isDisabled
                          ? "text-on-surface-variant/50 cursor-not-allowed"
                          : isSelected
                            ? "bg-tertiary text-on-tertiary"
                            : "text-on-surface hover:bg-surface-container-high",
                      ].join(" ")}
                    >
                      {option.label}
                    </button>
                  </li>
                );
              })}
            </ul>,
            portalRoot,
          )}
      </div>
    </div>
  );
}
