import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import {
  CONTENT_KEYS,
  getText,
  useContentOverrides,
} from "../hooks/useContentOverrides";
import { useSubmitInquiry } from "../hooks/useQueries";
import { EventType } from "../types";
import InteractiveMap from "./InteractiveMap";

// ─── Inline Brand Calendar ────────────────────────────────────────────────────

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface BrandCalendarProps {
  value: string; // 'YYYY-MM-DD' or ''
  onChange: (value: string) => void;
}

function BrandCalendar({ value, onChange }: BrandCalendarProps) {
  const today = new Date();
  const initialDate = value ? new Date(`${value}T00:00:00`) : today;

  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth()); // 0-indexed

  const selectedYear = value ? Number.parseInt(value.split("-")[0]) : null;
  const selectedMonth = value ? Number.parseInt(value.split("-")[1]) - 1 : null;
  const selectedDay = value ? Number.parseInt(value.split("-")[2]) : null;

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const handleDayClick = (day: number, monthOffset: 0 | -1 | 1) => {
    let m = viewMonth + monthOffset;
    let y = viewYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    }
    if (m > 11) {
      m = 0;
      y += 1;
    }
    const mm = String(m + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    onChange(`${y}-${mm}-${dd}`);
    if (monthOffset !== 0) {
      setViewMonth(m);
      setViewYear(y);
    }
  };

  // Build grid cells: 6 rows × 7 cols = 42 cells
  const cells: { day: number; monthOffset: 0 | -1 | 1; position: number }[] =
    [];
  let pos = 1;
  for (let i = 0; i < firstDayOfMonth; i++) {
    cells.push({
      day: daysInPrevMonth - firstDayOfMonth + 1 + i,
      monthOffset: -1,
      position: pos++,
    });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, monthOffset: 0, position: pos++ });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, monthOffset: 1, position: pos++ });
  }

  return (
    <div
      className="w-full rounded-sm border border-cream-dark bg-cream-light shadow-warm overflow-hidden"
      style={{ fontFamily: "'Lato', system-ui, sans-serif" }}
    >
      {/* Month / Year Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-cream-dark"
        style={{ background: "var(--accent-yellow)" }}
      >
        <button
          type="button"
          onClick={prevMonth}
          aria-label="Previous month"
          className="w-8 h-8 flex items-center justify-center rounded-sm text-brown-dark hover:bg-[var(--accent-yellow-hover)] transition-colors duration-150"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="font-display font-semibold text-brown-dark text-base tracking-wide select-none">
          {MONTHS[viewMonth]} {viewYear}
        </span>

        <button
          type="button"
          onClick={nextMonth}
          aria-label="Next month"
          className="w-8 h-8 flex items-center justify-center rounded-sm text-brown-dark hover:bg-[var(--accent-yellow-hover)] transition-colors duration-150"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day-of-week labels */}
      <div className="grid grid-cols-7 border-b border-cream-dark bg-cream-dark">
        {DAYS_OF_WEEK.map((d) => (
          <div
            key={d}
            className="text-center py-2 text-xs font-semibold tracking-widest uppercase"
            style={{ color: "var(--accent-yellow-text)" }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 p-2 gap-1">
        {cells.map((cell) => {
          const isCurrentMonth = cell.monthOffset === 0;
          const isToday =
            isCurrentMonth &&
            cell.day === today.getDate() &&
            viewMonth === today.getMonth() &&
            viewYear === today.getFullYear();
          const isSelected =
            isCurrentMonth &&
            selectedDay === cell.day &&
            selectedMonth === viewMonth &&
            selectedYear === viewYear;

          let cellStyle: React.CSSProperties = {};
          let cellClass =
            "relative flex items-center justify-center rounded-sm text-sm font-body transition-all duration-150 cursor-pointer select-none";

          cellClass += " min-h-[40px]";

          if (isSelected) {
            cellStyle = {
              background: "var(--accent-yellow)",
              border: "1.5px solid var(--accent-yellow-border)",
              color: "oklch(0.28 0.07 50)",
              fontWeight: 700,
            };
          } else if (isToday) {
            cellStyle = {
              border: "1.5px solid var(--accent-yellow-border)",
              color: "oklch(0.32 0.07 50)",
              fontWeight: 600,
            };
          } else if (!isCurrentMonth) {
            cellStyle = { color: "oklch(0.72 0.04 65)", opacity: 0.5 };
          } else {
            cellStyle = { color: "oklch(0.32 0.07 50)" };
          }

          return (
            <button
              key={`cell-${viewYear}-${viewMonth}-${cell.position}`}
              type="button"
              onClick={() => handleDayClick(cell.day, cell.monthOffset)}
              className={cellClass}
              style={cellStyle}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "var(--accent-yellow)";
                  (e.currentTarget as HTMLButtonElement).style.opacity = "0.7";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLButtonElement).style.background = "";
                  (e.currentTarget as HTMLButtonElement).style.opacity =
                    isCurrentMonth ? "1" : "0.5";
                }
              }}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export default function EventsBooking() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: EventType.ChurchEvent,
    eventDate: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const { overrides } = useContentOverrides();

  const {
    mutate: submitInquiry,
    isPending,
    isActorLoading,
    isError,
    error,
  } = useSubmitInquiry();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitInquiry(formData, {
      onSuccess: () => setSubmitted(true),
    });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-sm border border-cream-dark bg-cream-light font-body text-sm text-brown-dark placeholder:text-brown-light focus:outline-none focus:border-[var(--accent-yellow-border)] focus:ring-2 focus:ring-[var(--accent-yellow)]/30 transition-colors";

  const labelClass =
    "block font-body text-sm font-semibold text-brown-dark mb-1.5";

  return (
    <section id="events" className="py-20 md:py-28 bg-cream-light">
      {/* Yellow accent divider at top */}
      <div className="accent-divider max-w-3xl mx-auto mb-12" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="font-body text-sm font-semibold tracking-widest text-brown-light uppercase mb-3">
            Gather With Us
          </p>
          <h2
            className="font-display text-4xl md:text-5xl font-bold text-brown-dark mb-2"
            data-content-key={CONTENT_KEYS["events.heading"]}
          >
            {getText(
              overrides,
              CONTENT_KEYS["events.heading"],
              "Events & Booking",
            )}
          </h2>
          {/* Yellow underline accent */}
          <div className="flex justify-center mb-4">
            <div className="h-1 w-16 rounded-full bg-[var(--accent-yellow)]" />
          </div>
          <p
            className="font-body text-brown-mid max-w-xl mx-auto"
            data-content-key={CONTENT_KEYS["events.subheading"]}
          >
            {getText(
              overrides,
              CONTENT_KEYS["events.subheading"],
              "From Sunday coffee hours to private gatherings — we'd love to host your next event.",
            )}
          </p>
        </div>

        {/* Hours & Location Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {/* Mon–Sat Card */}
          <div className="bg-cream-dark rounded-sm p-6 shadow-warm border border-[var(--accent-yellow)]/30 hover:border-[var(--accent-yellow)] transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--accent-yellow)]/30 border border-[var(--accent-yellow)] flex items-center justify-center">
                <Clock className="w-5 h-5 text-brown-dark" />
              </div>
              <h3 className="font-display text-lg font-semibold text-brown-dark">
                Mon – Sat
              </h3>
            </div>
            <p className="font-body text-brown-mid text-sm leading-relaxed">
              8:00 AM – 3:00 PM
              <br />
              <span className="text-brown-light text-xs">
                Open daily for coffee &amp; community
              </span>
            </p>
          </div>

          {/* Sunday Card */}
          <div className="bg-cream-dark rounded-sm p-6 shadow-warm border border-[var(--accent-yellow)]/30 hover:border-[var(--accent-yellow)] transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--accent-yellow)]/30 border border-[var(--accent-yellow)] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-brown-dark" />
              </div>
              <h3 className="font-display text-lg font-semibold text-brown-dark">
                Sunday
              </h3>
            </div>
            <p className="font-body text-brown-mid text-sm leading-relaxed">
              8:00 AM – 1:00 PM
              <br />
              <span className="text-brown-light text-xs">
                Open before &amp; after service
              </span>
            </p>
          </div>

          {/* Map Card — interactive OpenStreetMap */}
          <InteractiveMap />
        </div>

        {/* Yellow accent divider */}
        <div className="accent-divider mb-14" />

        {/* Booking Form */}
        <div className="max-w-5xl mx-auto">
          <h3 className="font-display text-2xl font-semibold text-brown-dark mb-2 text-center">
            Booking Inquiry
          </h3>
          <div className="flex justify-center mb-8">
            <div className="h-0.5 w-10 rounded-full bg-[var(--accent-yellow)]" />
          </div>

          {submitted ? (
            <div className="text-center py-12 bg-[var(--accent-yellow)]/15 rounded-sm border border-[var(--accent-yellow-border)]">
              <div className="w-14 h-14 rounded-full bg-[var(--accent-yellow)]/40 border-2 border-[var(--accent-yellow)] flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-7 h-7 text-brown-dark" />
              </div>
              <h4 className="font-display text-xl font-semibold text-brown-dark mb-2">
                Inquiry Received!
              </h4>
              <p className="font-body text-brown-mid">
                Thank you! We'll be in touch soon to confirm your booking.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Two-column layout: left = form fields, right = calendar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left Column: Your Name, Email, Phone, Event Type */}
                <div className="space-y-5">
                  {/* Your Name */}
                  <div>
                    <label
                      htmlFor="booking-name"
                      className={labelClass}
                      data-content-key={CONTENT_KEYS["events.form.name"]}
                    >
                      {getText(
                        overrides,
                        CONTENT_KEYS["events.form.name"],
                        "Your Name",
                      )}
                    </label>
                    <input
                      id="booking-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Full name"
                      className={inputClass}
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <label
                      htmlFor="booking-email"
                      className={labelClass}
                      data-content-key={CONTENT_KEYS["events.form.email"]}
                    >
                      {getText(
                        overrides,
                        CONTENT_KEYS["events.form.email"],
                        "Email Address",
                      )}
                    </label>
                    <input
                      id="booking-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                      className={inputClass}
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label
                      htmlFor="booking-phone"
                      className={labelClass}
                      data-content-key={CONTENT_KEYS["events.form.phone"]}
                    >
                      {getText(
                        overrides,
                        CONTENT_KEYS["events.form.phone"],
                        "Phone Number",
                      )}
                    </label>
                    <input
                      id="booking-phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(555) 000-0000"
                      className={inputClass}
                    />
                  </div>

                  {/* Event Type */}
                  <div>
                    <label
                      htmlFor="booking-event-type"
                      className={labelClass}
                      data-content-key={CONTENT_KEYS["events.form.eventType"]}
                    >
                      {getText(
                        overrides,
                        CONTENT_KEYS["events.form.eventType"],
                        "Event Type",
                      )}
                    </label>
                    <div className="relative">
                      <select
                        id="booking-event-type"
                        name="eventType"
                        value={formData.eventType}
                        onChange={handleChange}
                        className="w-full appearance-none px-4 py-2.5 rounded-sm border border-cream-dark bg-cream-light font-body text-sm text-brown-dark focus:outline-none focus:border-[var(--accent-yellow-border)] focus:ring-2 focus:ring-[var(--accent-yellow)]/30 transition-colors cursor-pointer pr-10"
                      >
                        <option value={EventType.ChurchEvent}>
                          Church Event
                        </option>
                        <option value={EventType.Wedding}>Wedding</option>
                        <option value={EventType.CommunityGathering}>
                          Community Gathering
                        </option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-light" />
                    </div>
                  </div>
                </div>

                {/* Right Column: Event Date with BrandCalendar */}
                <div>
                  <label
                    htmlFor="booking-event-date"
                    className={labelClass}
                    data-content-key={CONTENT_KEYS["events.form.date"]}
                  >
                    {getText(
                      overrides,
                      CONTENT_KEYS["events.form.date"],
                      "Event Date",
                    )}
                    {formData.eventDate && (
                      <span className="ml-2 font-normal text-brown-mid">
                        — {formatDisplayDate(formData.eventDate)}
                      </span>
                    )}
                  </label>
                  {/* Hidden input keeps the value accessible for form validation */}
                  <input
                    id="booking-event-date"
                    type="hidden"
                    name="eventDate"
                    value={formData.eventDate}
                    required
                  />
                  <BrandCalendar
                    value={formData.eventDate}
                    onChange={(val) =>
                      setFormData((prev) => ({ ...prev, eventDate: val }))
                    }
                  />
                </div>
              </div>

              {/* Tell Us About Your Event — full width below the two columns */}
              <div>
                <label
                  htmlFor="booking-message"
                  className={labelClass}
                  data-content-key={CONTENT_KEYS["events.form.message"]}
                >
                  {getText(
                    overrides,
                    CONTENT_KEYS["events.form.message"],
                    "Tell Us About Your Event",
                  )}
                </label>
                <textarea
                  id="booking-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Share details about your event, expected guests, and any special requests..."
                  className="w-full px-4 py-2.5 rounded-sm border border-cream-dark bg-cream-light font-body text-sm text-brown-dark placeholder:text-brown-light focus:outline-none focus:border-[var(--accent-yellow-border)] focus:ring-2 focus:ring-[var(--accent-yellow)]/30 transition-colors resize-none"
                />
              </div>

              {isError && (
                <p className="font-body text-xs text-red-600 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
                  {error instanceof Error
                    ? error.message
                    : "Something went wrong. Please try again."}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending || isActorLoading || !formData.eventDate}
                data-content-key={CONTENT_KEYS["events.form.submit"]}
                className="w-full py-3 px-6 rounded-sm font-body font-semibold text-sm text-brown-dark bg-[var(--accent-yellow)] border border-[var(--accent-yellow-border)] hover:bg-[var(--accent-yellow-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Sending…
                  </>
                ) : (
                  getText(
                    overrides,
                    CONTENT_KEYS["events.form.submit"],
                    "Send Booking Inquiry",
                  )
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
