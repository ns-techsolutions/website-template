"use client";

import { useMemo, useState } from "react";
import { addMonths, addYears, format } from "date-fns";

import { Calendar } from "@/components/ui/calendar";
import type { Closure, OpeningHour } from "@/lib/admin/types";

const DAY_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

interface AvailabilityCalendarProps {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  /** Weekly opening hours — drives which weekdays are bookable (from `useCatalogHours`). */
  openingHours: OpeningHour[] | undefined;
  /** One-off holiday / closure dates ("yyyy-MM-dd") that are not bookable. */
  closures: Closure[] | undefined;
  /**
   * When true, only past dates are blocked: closed weekdays and holidays still
   * render as unavailable (red) but stay selectable. The admin flow uses this so
   * staff can force-book outside normal availability; customers leave it off.
   */
  allowClosedDates?: boolean;
}

/**
 * Shared salon date picker used by both the customer booking form and the admin
 * appointment dialog. Bookable weekdays show green, past/closed/holiday days show
 * red. See `allowClosedDates` for the admin's force-book affordance.
 */
export function AvailabilityCalendar({
  selected,
  onSelect,
  openingHours,
  closures,
  allowClosedDates = false,
}: AvailabilityCalendarProps) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Month currently shown in the date-picker dropdown (controlled for year/month jumps).
  const [pickerMonth, setPickerMonth] = useState<Date>(selected ?? today);

  // Weekdays the salon is open — used to highlight bookable days on the calendar.
  const openWeekdays = useMemo(() => {
    const set = new Set<number>();
    for (const h of openingHours ?? []) {
      if (!h.closed && DAY_INDEX[h.day] !== undefined) set.add(DAY_INDEX[h.day]);
    }
    return set;
  }, [openingHours]);

  // Admin-configured holiday / one-off closure dates ("yyyy-MM-dd").
  const closureDates = useMemo(
    () => new Set((closures ?? []).map((c) => c.date)),
    [closures],
  );

  const isHoliday = (d: Date) => closureDates.has(format(d, "yyyy-MM-dd"));

  const isAvailableDay = (d: Date) =>
    d >= today && openWeekdays.has(d.getDay()) && !isHoliday(d);

  return (
    <Calendar
      mode="single"
      selected={selected}
      onSelect={onSelect}
      disabled={
        allowClosedDates
          ? (d: Date) => d < today
          : (d: Date) => !isAvailableDay(d)
      }
      showOutsideDays={false}
      month={pickerMonth}
      onMonthChange={setPickerMonth}
      autoFocus
      className="p-3 bg-white"
      classNames={{
        months: "flex flex-col",
        month: "flex flex-col gap-3",
        month_caption: "w-full",
        nav: "hidden",
        // Override the default <table> display so the grid rows lay out
        // correctly (otherwise the day cells collapse/overlap).
        month_grid: "flex flex-col w-[17.5rem]",
        weekdays: "grid grid-cols-7 mb-1",
        weekday: "flex h-8 items-center justify-center text-[0.7rem] font-medium uppercase tracking-wide text-[#8d8d8d]",
        weeks: "flex flex-col gap-y-1",
        week: "grid grid-cols-7",
        day: "flex h-9 items-center justify-center p-0 relative",
      }}
      modifiers={{
        available: isAvailableDay,
      }}
      components={{
        MonthCaption: ({ calendarMonth }: { calendarMonth: { date: Date } }) => {
          const m =
            calendarMonth?.date instanceof Date && !isNaN(calendarMonth.date.getTime())
              ? calendarMonth.date
              : pickerMonth;
          const navBtn =
            "flex h-7 w-7 items-center justify-center rounded-md text-[#5b8a63] hover:bg-[#e6f4e9] transition-colors";
          return (
            <div className="flex items-center justify-between px-1 pb-3">
              <div className="flex items-center gap-0.5">
                <button type="button" aria-label="Previous year" className={navBtn} onClick={() => setPickerMonth((p) => addYears(p, -1))}>«</button>
                <button type="button" aria-label="Previous month" className={navBtn} onClick={() => setPickerMonth((p) => addMonths(p, -1))}>‹</button>
              </div>
              <span className="text-sm font-medium text-[#2f6b3d] select-none">{format(m, "MMM yyyy")}</span>
              <div className="flex items-center gap-0.5">
                <button type="button" aria-label="Next month" className={navBtn} onClick={() => setPickerMonth((p) => addMonths(p, 1))}>›</button>
                <button type="button" aria-label="Next year" className={navBtn} onClick={() => setPickerMonth((p) => addYears(p, 1))}>»</button>
              </div>
            </div>
          );
        },
        DayButton: ({ day, modifiers, ...props }) => {
          const isSelected = modifiers.selected;
          const isToday = modifiers.today;
          // Bookable days are "active"; everything else (past dates,
          // closed weekdays, holidays) is shown as unavailable.
          const isAvailable = modifiers.available;
          // Whether the day can actually be picked. With `allowClosedDates`,
          // closed/holiday days stay clickable even though they read as red.
          const isDisabled = modifiers.disabled;

          // active → white, unavailable → red, selected → green.
          const tone = isSelected
            ? "bg-[#3a7d44] text-white shadow-sm"
            : isAvailable
              ? "bg-white border border-[#cfe6d4] text-[#2f2f2f] hover:border-[#3a7d44] cursor-pointer"
              : `bg-[#fde7e7] text-[#d05a5a] ${isDisabled ? "cursor-not-allowed" : "cursor-pointer hover:border-[#d05a5a]"}`;

          return (
            <button
              {...props}
              type="button"
              className={`mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium outline-none transition-colors
                ${tone}
                ${isToday && !isSelected ? "ring-1 ring-[#3a7d44]" : ""}
              `}
            >
              {day.date.getDate()}
            </button>
          );
        },
      }}
    />
  );
}
