"use client";

import { forwardRef, useState, type CSSProperties } from "react";
import { MaterialIcon } from "./MaterialIcon";
import {
  fromISODate,
  getCalendarDays,
  getMonthYearParts,
  getYearBounds,
  getYearPageLabel,
  getYearPageYears,
  isDateDisabled,
  isSameDay,
  WEEKDAYS,
} from "./date-picker-utils";

export type DatePickerPlacement = "above" | "below";
type ViewMode = "days" | "years";

interface DatePickerPopoverProps {
  viewDate: Date;
  selectedISO: string;
  min?: string;
  max?: string;
  style?: CSSProperties;
  placement?: DatePickerPlacement;
  onViewChange: (date: Date) => void;
  onSelect: (date: Date) => void;
}

export const DatePickerPopover = forwardRef<HTMLDivElement, DatePickerPopoverProps>(
  function DatePickerPopover(
    {
      viewDate,
      selectedISO,
      min,
      max,
      style,
      placement = "below",
      onViewChange,
      onSelect,
    },
    ref,
  ) {
    const [viewMode, setViewMode] = useState<ViewMode>("days");
    const today = new Date();
    const selectedDate = fromISODate(selectedISO);
    const { month, monthLabel, year } = getMonthYearParts(viewDate);
    const { minYear, maxYear } = getYearBounds(min, max);
    const yearPageYears = getYearPageYears(viewDate.getFullYear(), min, max);

    const goMonth = (delta: number) => {
      onViewChange(
        new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1),
      );
    };

    const goYearPage = (delta: number) => {
      const nextCenter = Math.min(
        maxYear,
        Math.max(minYear, viewDate.getFullYear() + delta),
      );
      onViewChange(new Date(nextCenter, viewDate.getMonth(), 1));
    };

    const handleYearSelect = (nextYear: number) => {
      onViewChange(new Date(nextYear, viewDate.getMonth(), 1));
      setViewMode("days");
    };

    const handlePrev = () => {
      if (viewMode === "years") goYearPage(-12);
      else goMonth(-1);
    };

    const handleNext = () => {
      if (viewMode === "years") goYearPage(12);
      else goMonth(1);
    };

    return (
      <div
        ref={ref}
        role="dialog"
        aria-label="Seleccionar fecha"
        data-date-picker-popover
        style={style}
        className={`date-picker-popover date-picker-popover--${placement} fixed z-50 rounded-lg border border-outline-variant bg-surface-container-low p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.3)]`}
      >
        <div className="mb-2 grid grid-cols-[28px_minmax(0,1fr)_28px] items-center gap-0.5">
          <button
            type="button"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            onClick={handlePrev}
            aria-label={viewMode === "years" ? "Años anteriores" : "Mes anterior"}
          >
            <MaterialIcon name="chevron_left" className="text-[18px]" />
          </button>

          {viewMode === "days" ? (
            <div
              className="flex min-w-0 items-center justify-center gap-1 whitespace-nowrap"
              aria-label={`${monthLabel} ${year}`}
            >
              <span className="text-body-sm font-semibold text-on-surface">
                {month}
              </span>
              <button
                type="button"
                className="rounded px-1 py-0.5 text-body-sm font-semibold text-tertiary tabular-nums transition-colors hover:bg-surface-container-high"
                onClick={() => setViewMode("years")}
                aria-label={`Cambiar año, actual ${year}`}
              >
                {year}
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="min-w-0 text-center text-body-sm font-semibold text-on-surface whitespace-nowrap tabular-nums transition-colors hover:text-tertiary"
              onClick={() => setViewMode("days")}
              aria-label="Volver al calendario de días"
            >
              {getYearPageLabel(yearPageYears)}
            </button>
          )}

          <button
            type="button"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            onClick={handleNext}
            aria-label={viewMode === "years" ? "Años siguientes" : "Mes siguiente"}
          >
            <MaterialIcon name="chevron_right" className="text-[18px]" />
          </button>
        </div>

        {viewMode === "days" ? (
          <>
            <div className="mb-1 grid grid-cols-7 gap-0.5">
              {WEEKDAYS.map((day) => (
                <span
                  key={day}
                  className="py-0.5 text-center text-[11px] font-medium text-on-surface-variant"
                >
                  {day}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {getCalendarDays(viewDate).map(({ date, key }) => {
                if (!date) {
                  return <span key={key} aria-hidden className="h-7" />;
                }

                const isSelected = selectedDate
                  ? isSameDay(date, selectedDate)
                  : false;
                const isToday = isSameDay(date, today);
                const disabled = isDateDisabled(date, min, max);

                return (
                  <button
                    key={key}
                    type="button"
                    disabled={disabled}
                    onClick={() => onSelect(date)}
                    className={[
                      "h-7 rounded-md text-[12px] font-medium transition-all",
                      disabled
                        ? "cursor-not-allowed text-on-surface-variant/40"
                        : "text-on-surface hover:bg-surface-container-high",
                      isSelected
                        ? "bg-tertiary text-on-tertiary hover:bg-tertiary hover:brightness-110"
                        : "",
                      isToday && !isSelected
                        ? "ring-1 ring-tertiary ring-inset"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {yearPageYears.map((pageYear) => {
              const isSelected = pageYear === year;
              const isCurrent = pageYear === today.getFullYear();
              const disabled = pageYear < minYear || pageYear > maxYear;

              return (
                <button
                  key={pageYear}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleYearSelect(pageYear)}
                  className={[
                    "h-8 rounded-md text-body-sm font-semibold tabular-nums transition-all",
                    disabled
                      ? "cursor-not-allowed text-on-surface-variant/40"
                      : "text-on-surface hover:bg-surface-container-high",
                    isSelected
                      ? "bg-tertiary text-on-tertiary hover:bg-tertiary hover:brightness-110"
                      : "",
                    isCurrent && !isSelected
                      ? "ring-1 ring-tertiary ring-inset"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {pageYear}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);
