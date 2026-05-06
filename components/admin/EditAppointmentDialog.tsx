"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient" 



// ─── Studio Hours (0 = Sun … 6 = Sat) ────────────────────────────────────────
// open/close are integer hours in LOCAL time (24h). close is exclusive upper bound.
const STUDIO_HOURS: Record<number, { open: number; close: number }> = {
  0: { open: 7,  close: 23 }, // Sunday   7 AM – 11 PM
  1: { open: 8,  close: 22 }, // Monday   8 AM – 10 PM
  2: { open: 8,  close: 22 },
  3: { open: 8,  close: 22 },
  4: { open: 8,  close: 22 },
  5: { open: 8,  close: 22 }, // Friday
  6: { open: 7,  close: 23 }, // Saturday 7 AM – 11 PM
}

// ─── Pricing Tables ────────────────────────────────────────────────────────────
const PHOTOSHOOT_PACKAGES: {
  value: string; label: string; description: string; prices: Record<number, number>
}[] = [
  {
    value: "pkg_a", label: "Package A – Indoor Set Design",
    description: "Photographer, Hair & Makeup, Creative Direction, Studio Use, Set Design, Soft Copy (20–150 edited photos)",
    prices: { 1: 8500, 2: 15500, 3: 22500 },
  },
  {
    value: "pkg_b", label: "Package B – Plain Background",
    description: "Photographer, Hair & Makeup, Creative Direction, Studio Use, Soft Copy (20–150 edited photos)",
    prices: { 1: 6000, 2: 11000, 3: 17000 },
  },
  {
    value: "pkg_c", label: "Package C – Outdoor Shoot",
    description: "Photographer, Hair & Makeup, Creative Direction, Soft Copy (20–150 edited photos)",
    prices: { 1: 7500, 2: 14500, 3: 21500 },
  },
]

const STUDIO_RENTAL_OPTIONS: {
  label: string; hours: number; priceBasic: number; priceBackdrop: number
}[] = [
  { label: "1 Hour",           hours: 1, priceBasic: 500,  priceBackdrop: 700  },
  { label: "2 Hours",          hours: 2, priceBasic: 1000, priceBackdrop: 1400 },
  { label: "3 Hours",          hours: 3, priceBasic: 1500, priceBackdrop: 2100 },
  { label: "Half Day (4 hrs)", hours: 4, priceBasic: 2500, priceBackdrop: 2500 },
  { label: "Full Day (8 hrs)", hours: 8, priceBasic: 5000, priceBackdrop: 5000 },
]

const ADDON_PHOTOGRAPHER_PRICE      = 1500
const ADDON_MAKEUP_PRICE_PER_PERSON = 1200

// ─── Types ─────────────────────────────────────────────────────────────────────
type FormType = {
  firstName: string; lastName: string; email: string; phone: string
  date: string; time: string; duration: number; service: string
  addons: { photographer: boolean; makeup: boolean }
  photoshootSets: number; makeupPeople: number
  studioHours: number; studioBackdrop: boolean
  notes: string; paymentMethod: string
  paymentReference: string; paymentMethodOther: string
  makeupOnlyPeople: number
}

type Props = {
  open: boolean; onClose: () => void
  form: FormType; setForm: (form: FormType) => void
  onSave: (calculatedPrice: number) => void
  saving?: boolean
  /** ID of the booking being edited — excluded from overlap checks */
  bookingId?: number | string | null
}

type BlockedDateRow = {
  blocked_date?: string | null
  blocked_start?: string | null
  blocked_end?: string | null
  reason?: string | null
}

type ExistingBooking = {
  id: number | string
  start_datetime: string
  end_datetime: string
}

type SlotStatus = "available" | "booked" | "past" | "outside-hours" | "blocked"

// ══════════════════════════════════════════════════════════════════════════════
// ─── Pure Helpers ──────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Convert "HH:MM" to total minutes */
const toMin = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + m
}

/** Convert total minutes to "HH:MM" */
const fmtHHMM = (min: number): string =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`

/** Convert "HH:MM" to "h:MM AM/PM" */
const fmtAMPM = (hhmm: string): string => {
  if (!hhmm) return ""
  const [h, m] = hhmm.split(":").map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`
}

/** Returns today's date as "YYYY-MM-DD" in local time */
const localToday = (): string => new Date().toLocaleDateString("en-CA")

const isPhotoshootSvc = (s: string): boolean =>
  PHOTOSHOOT_PACKAGES.some(p => p.value === s)

const isMakeupOnlySvc = (s: string): boolean => s === "makeup_only"

const MAKEUP_ONLY_PRICE_PER_PERSON = 1200 // matches makeup_services.price_per_person
const MAKEUP_ONLY_DURATION_MIN = 60       // 1 hour flat

/**
 * Parse a DB timestamp string as LOCAL time.
 * Strips UTC markers ("Z", "+HH:MM") so JavaScript interprets it as local.
 * Handles both "YYYY-MM-DD HH:MM:SS" and "YYYY-MM-DDTHH:MM:SS" formats.
 */
function parseLocalDatetime(raw: string): Date {
  // Normalise: replace space separator, strip timezone suffix
  const normalised = raw.replace(" ", "T").replace(/([+-]\d{2}:\d{2}|Z)$/, "")
  return new Date(normalised)
}

/**
 * Build a "YYYY-MM-DD HH:MM:SS" string from a Date in LOCAL time.
 * Used when constructing Supabase query boundaries.
 */
function toLocalDatetimeString(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0")
  return (
    `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ` +
    `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── REQUIRED HELPER 1 — isDateBlocked ────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Returns true if the given date string ("YYYY-MM-DD") falls within any
 * admin-blocked row (either a single blocked_date or a blocked_start/end range).
 */
export function isDateBlocked(dateStr: string, rows: BlockedDateRow[]): boolean {
  for (const r of rows) {
    // Exact single-day block
    if (r.blocked_date && r.blocked_date === dateStr) return true

    // Range block — compare midnight-normalised dates
    if (r.blocked_start && r.blocked_end) {
      const target = new Date(`${dateStr}T00:00:00`)
      // Strip time from range bounds so we compare calendar days only
      const rangeStart = new Date(new Date(r.blocked_start).toDateString())
      const rangeEnd   = new Date(new Date(r.blocked_end).toDateString())
      if (target >= rangeStart && target <= rangeEnd) return true
    }
  }
  return false
}

/** Returns the block reason for a given date, or "Unavailable" */
function getBlockReason(dateStr: string, rows: BlockedDateRow[]): string {
  for (const r of rows) {
    if (r.blocked_date === dateStr) return r.reason ?? "Unavailable"
    if (r.blocked_start && r.blocked_end) {
      const target = new Date(`${dateStr}T00:00:00`)
      const rangeStart = new Date(new Date(r.blocked_start).toDateString())
      const rangeEnd   = new Date(new Date(r.blocked_end).toDateString())
      if (target >= rangeStart && target <= rangeEnd) return r.reason ?? "Unavailable"
    }
  }
  return "Unavailable"
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── REQUIRED HELPER 2 — fetchBookingsByDate ──────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch all approved/pending bookings that OVERLAP the given calendar day.
 *
 * Overlap condition (Allen's interval algebra):
 *   existing.start_datetime < endOfDay  AND  existing.end_datetime > startOfDay
 *
 * This correctly catches bookings that:
 *   - Start before the day and end within it
 *   - Start within the day and end after it
 *   - Span the entire day
 *   - Are entirely within the day
 *
 * DB column type: timestamp without time zone  → use LOCAL time strings, no UTC.
 */
export async function fetchBookingsByDate(dateStr: string): Promise<ExistingBooking[]> {
  // Build start-of-day and end-of-day boundaries in local time
  const startOfDay = new Date(`${dateStr}T00:00:00`)
  const endOfDay   = new Date(`${dateStr}T23:59:59`)

  const startStr = toLocalDatetimeString(startOfDay) // "YYYY-MM-DD 00:00:00"
  const endStr   = toLocalDatetimeString(endOfDay)   // "YYYY-MM-DD 23:59:59"

  const { data, error } = await supabase
    .from("bookings")
    .select("id, start_datetime, end_datetime")
    // ✅ OVERLAP QUERY: existing.start < endOfDay AND existing.end > startOfDay
    .lt("start_datetime", endStr)
    .gt("end_datetime",   startStr)
    // ✅ Only active bookings block slots
    .in("status", ["approved", "pending"])

  if (error) {
    console.error("[fetchBookingsByDate] Supabase error:", error)
    return []
  }

  return (data as ExistingBooking[]) ?? []
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── REQUIRED HELPER 3 — generateTimeSlots ────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Generate every hourly slot between the studio's open and close time
 * for the given date. Returns an array of "HH:MM" strings.
 *
 * Example: Mon 8 AM–10 PM → ["08:00","09:00",…,"21:00"]
 * The last generated start time still requires a slot of at least 1 h,
 * so we stop at (close - 1) hour; isValidStartTime handles finer checks.
 */
export function generateTimeSlots(dateStr: string): string[] {
  if (!dateStr) return []
  const dow   = new Date(`${dateStr}T00:00:00`).getDay()
  const hours = STUDIO_HOURS[dow]
  const slots: string[] = []
  // Start at open hour, end before close hour (close is exclusive)
  for (let h = hours.open; h < hours.close; h++) {
    slots.push(fmtHHMM(h * 60))
  }
  return slots
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── REQUIRED HELPER 4 — isSlotUnavailable ────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Returns true if the slot [slotStart, slotStart + durationMin) overlaps
 * ANY of the provided bookings (converted to minutes-since-midnight).
 *
 * Overlap logic (correct interval math):
 *   slotStart < booking.end  AND  slotEnd > booking.start
 *
 * This is the standard half-open interval overlap test. A slot that ends
 * exactly when a booking starts is NOT an overlap (back-to-back is fine).
 */
export function isSlotUnavailable(
  slotStart: number,             // minutes since midnight (e.g. 8*60 = 480)
  durationMin: number,
  bookings: Array<{ startMin: number; endMin: number }>
): boolean {
  const slotEnd = slotStart + durationMin
  return bookings.some(bk => slotStart < bk.endMin && slotEnd > bk.startMin)
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── REQUIRED HELPER 5 — isValidStartTime ────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Returns true if the slot fits entirely within the studio's closing time.
 *   slotStart + durationMin <= closingTime
 *
 * Both slotStart and closingTime are in minutes since midnight.
 * (closingTime = STUDIO_HOURS[dow].close * 60)
 */
export function isValidStartTime(
  slotStart: number,
  durationMin: number,
  closingTimeMin: number
): boolean {
  return slotStart + durationMin <= closingTimeMin
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── buildSlotStatuses — assembles the full status map ───────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Build a Record<"HH:MM", SlotStatus> for every hourly slot on dateStr.
 * Uses all five helper functions to determine each slot's status.
 *
 * Priority (first match wins):
 *   outside-hours → past → blocked (admin) → booked (existing booking) → available
 */
function buildSlotStatuses(
  dateStr: string,
  durationMin: number,
  blockedRows: BlockedDateRow[],
  bookings: ExistingBooking[],
  currentBookingId?: number | string | null
): Record<string, SlotStatus> {
  if (!dateStr || durationMin <= 0) return {}

  const dow          = new Date(`${dateStr}T00:00:00`).getDay()
  const { open, close } = STUDIO_HOURS[dow]
  const openMin      = open  * 60
  const closeMin     = close * 60

  // Current time in minutes (only relevant if dateStr === today)
  const today  = localToday()
  const now    = new Date()
  const nowMin = dateStr === today ? now.getHours() * 60 + now.getMinutes() : -1

  // ── Admin-blocked intervals (in minutes) ──────────────────────────────────
  const adminIntervals: Array<{ start: number; end: number }> = []

  for (const r of blockedRows) {
    if (!isDateBlocked(dateStr, [r])) continue

    if (r.blocked_date === dateStr) {
      // Whole-day block
      adminIntervals.push({ start: 0, end: 24 * 60 })
      break
    }

    if (r.blocked_start && r.blocked_end) {
      const bs = parseLocalDatetime(r.blocked_start)
      const be = parseLocalDatetime(r.blocked_end)
      const sameDay = bs.toDateString() === be.toDateString()

      // If the range spans multiple days, block the whole target day
      adminIntervals.push(
        sameDay
          ? { start: bs.getHours() * 60 + bs.getMinutes(), end: be.getHours() * 60 + be.getMinutes() }
          : { start: 0, end: 24 * 60 }
      )
    }
  }

  // ── Convert bookings → minute intervals ───────────────────────────────────
  // Exclude the booking currently being edited (it should not block itself).
  const bookedIntervals: Array<{ start: number; end: number }> = []

  for (const bk of bookings) {
    // Skip the booking being edited
    if (currentBookingId != null && String(bk.id) === String(currentBookingId)) continue

    const bs = parseLocalDatetime(bk.start_datetime)
    const be = parseLocalDatetime(bk.end_datetime)

    // Convert to minutes-since-midnight for the target date.
    // Because fetchBookingsByDate uses overlap query, these bookings are
    // guaranteed to touch the target date even if they started the day before.
    // We clamp to [0, 24*60] so cross-midnight bookings still block correctly.
    const bsMin = bs.getHours() * 60 + bs.getMinutes()
    const beMin = be.getHours() * 60 + be.getMinutes()

    // Handle case where booking ends exactly at midnight (beMin === 0 means full day)
    bookedIntervals.push({
      start: bsMin,
      end:   beMin === 0 ? 24 * 60 : beMin,
    })
  }

  // ── Generate slots and classify ───────────────────────────────────────────
  const allSlots  = generateTimeSlots(dateStr)        // ["08:00", "09:00", …]
  const result: Record<string, SlotStatus> = {}

  for (const slot of allSlots) {
    const slotStart = toMin(slot)
    const slotEnd   = slotStart + durationMin
    const key       = slot

    // 1. Outside studio hours (slot doesn't fit within open→close window)
    if (slotStart < openMin || !isValidStartTime(slotStart, durationMin, closeMin)) {
      result[key] = "outside-hours"
      continue
    }

    // 2. In the past (only applies when viewing today)
    //    A slot is "past" if it has already started (slotStart < nowMin).
    if (nowMin >= 0 && slotStart < nowMin) {
      result[key] = "past"
      continue
    }

    // 3. Admin-blocked
    //    Slot overlaps an admin-blocked interval: slotStart < iv.end AND slotEnd > iv.start
    if (adminIntervals.some(iv => slotStart < iv.end && slotEnd > iv.start)) {
      result[key] = "blocked"
      continue
    }

    // 4. Booked — uses isSlotUnavailable (correct overlap logic)
    const mappedBookings = bookedIntervals.map(iv => ({ startMin: iv.start, endMin: iv.end }))
    if (isSlotUnavailable(slotStart, durationMin, mappedBookings)) {
      result[key] = "booked"
      continue
    }

    // 5. Available 🎉
    result[key] = "available"
  }

  return result
}

// ──────────────────────────────────────────────────────────────────────────────
// Days in month helper
// ──────────────────────────────────────────────────────────────────────────────
function daysInMonth(year: number, month: number): Date[] {
  const days: Date[] = []
  const d = new Date(year, month, 1)
  while (d.getMonth() === month) { days.push(new Date(d)); d.setDate(d.getDate() + 1) }
  return days
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── Inline Calendar ───────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function InlineCalendar({
  value, onChange, blockedRows,
}: {
  value: string
  onChange: (d: string) => void
  blockedRows: BlockedDateRow[]
}) {
  const today = localToday()
  const seed  = value ? new Date(`${value}T00:00:00`) : new Date()
  const [viewYear,  setViewYear]  = useState(seed.getFullYear())
  const [viewMonth, setViewMonth] = useState(seed.getMonth())

  const days     = daysInMonth(viewYear, viewMonth)
  const firstDow = days[0].getDay()

  const prevMonth = () => viewMonth === 0
    ? (setViewYear(y => y - 1), setViewMonth(11))
    : setViewMonth(m => m - 1)
  const nextMonth = () => viewMonth === 11
    ? (setViewYear(y => y + 1), setViewMonth(0))
    : setViewMonth(m => m + 1)

  const monthLabel = new Date(viewYear, viewMonth).toLocaleString("default", { month: "long", year: "numeric" })

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden text-sm select-none">
      {/* ── Month navigation ── */}
      <div className="flex items-center justify-between bg-gray-50 px-3 py-2 border-b border-gray-200">
        <button type="button" onClick={prevMonth}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors text-gray-500 font-bold">‹</button>
        <span className="font-semibold text-gray-700 text-sm">{monthLabel}</span>
        <button type="button" onClick={nextMonth}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors text-gray-500 font-bold">›</button>
      </div>

      {/* ── Day-of-week headers ── */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* ── Day cells ── */}
      <div className="grid grid-cols-7 p-1.5 gap-1">
        {Array.from({ length: firstDow }).map((_, i) => <div key={`bl${i}`} />)}

        {days.map(dayObj => {
          const ds          = dayObj.toLocaleDateString("en-CA")
          const isPast      = ds < today
          // isDateBlocked is now the exported helper — consistent across the file
          const isBlocked   = isDateBlocked(ds, blockedRows)
          const isSelected  = ds === value
          const isToday     = ds === today
          const num         = dayObj.getDate()

          let cls = "relative flex items-center justify-center rounded-lg w-full aspect-square text-xs font-medium transition-all "

          if (isSelected) {
            cls += "bg-[#C8A96A] text-black font-bold shadow-md ring-2 ring-[#C8A96A]/40 scale-105 z-10 "
          } else if (isPast) {
            cls += "text-gray-300 cursor-not-allowed "
          } else if (isBlocked) {
            cls += "bg-red-50 text-red-300 cursor-not-allowed border border-red-200 "
          } else {
            cls += "text-gray-700 cursor-pointer hover:bg-amber-50 hover:text-[#C8A96A] hover:scale-105 "
          }

          return (
            <div
              key={ds}
              className={cls}
              title={
                isBlocked ? `🚫 ${getBlockReason(ds, blockedRows)}`
                : isPast  ? "Past date"
                : `Select ${new Date(`${ds}T00:00:00`).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}`
              }
              onClick={() => { if (!isPast && !isBlocked) onChange(ds) }}
            >
              <span className={isBlocked && !isSelected ? "opacity-40" : ""}>{num}</span>

              {/* Hatch overlay for blocked */}
              {isBlocked && !isSelected && (
                <span
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  style={{ background: "repeating-linear-gradient(-45deg,transparent,transparent 3px,rgba(239,68,68,0.18) 3px,rgba(239,68,68,0.18) 4px)" }}
                />
              )}
              {/* Today dot */}
              {isToday && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C8A96A]" />
              )}
            </div>
          )
        })}
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap items-center gap-3 px-3 py-2 border-t border-gray-100 bg-gray-50 text-[10px] text-gray-400">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#C8A96A] inline-block" />Selected</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-white border border-gray-200 inline-block" />Available</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-50 border border-red-200 inline-block" />Blocked</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100 inline-block" />Past</span>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── Time Slot Grid ────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function TimeSlotGrid({
  dateStr, durationMin, statuses, selectedTime, onSelect,
}: {
  dateStr: string
  durationMin: number
  statuses: Record<string, SlotStatus>
  selectedTime: string
  onSelect: (t: string) => void
}) {
  if (!dateStr)     return <p className="text-xs text-gray-400 italic">📅 Select a date first to see time slots.</p>
  if (!durationMin) return <p className="text-xs text-gray-400 italic">🛎 Select a service to see time slots.</p>

  const slots   = Object.keys(statuses).sort()
  const visible = slots.filter(s => statuses[s] !== "outside-hours")
  const hasAny  = visible.some(s => statuses[s] === "available")

  return (
    <div className="space-y-2">
      {!hasAny && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-500 font-medium flex items-center gap-2">
          <span>😕</span><span>No available slots for this date. Please choose a different day.</span>
        </div>
      )}

      <div className="grid grid-cols-4 gap-1.5">
        {visible.map(slot => {
          const status   = statuses[slot]
          const selected = slot === selectedTime
          const endSlot  = fmtHHMM(toMin(slot) + durationMin)

          let cls = "relative flex flex-col items-center justify-center rounded-lg py-2 px-1 text-[11px] border transition-all overflow-hidden "

          if (selected) {
            cls += "bg-[#C8A96A] border-[#C8A96A] text-black font-bold shadow-md scale-[1.05] z-10 ring-2 ring-[#C8A96A]/30 "
          } else if (status === "available") {
            cls += "bg-white border-gray-200 text-gray-700 cursor-pointer hover:border-[#C8A96A] hover:bg-amber-50 hover:text-[#C8A96A] hover:scale-[1.03] "
          } else if (status === "booked") {
            cls += "bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed "
          } else if (status === "past") {
            cls += "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed "
          } else if (status === "blocked") {
            cls += "bg-red-50 border-red-200 text-red-300 cursor-not-allowed "
          }

          const subLabel =
            status === "booked"  ? "Booked"  :
            status === "past"    ? "Past"    :
            status === "blocked" ? "Blocked" : ""

          return (
            <button
              key={slot}
              type="button"
              disabled={status !== "available"}
              title={
                status === "booked"  ? "Already booked" :
                status === "past"    ? "Time has passed" :
                status === "blocked" ? "Blocked by studio" :
                `${fmtAMPM(slot)} – ${fmtAMPM(endSlot)}`
              }
              className={cls}
              onClick={() => status === "available" && onSelect(slot)}
            >
              <span className="font-semibold leading-tight">{fmtAMPM(slot)}</span>

              {subLabel && (
                <span className="text-[9px] mt-0.5 opacity-70 leading-none">{subLabel}</span>
              )}

              {/* Diagonal hatch for booked / blocked */}
              {(status === "booked" || status === "blocked") && (
                <span
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: status === "booked"
                      ? "repeating-linear-gradient(-45deg,transparent,transparent 4px,rgba(156,163,175,0.25) 4px,rgba(156,163,175,0.25) 5px)"
                      : "repeating-linear-gradient(-45deg,transparent,transparent 4px,rgba(239,68,68,0.15) 4px,rgba(239,68,68,0.15) 5px)",
                  }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[10px] text-gray-400 pt-1">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#C8A96A] inline-block" />Selected</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border border-gray-200 bg-white inline-block" />Available</span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gray-100 inline-block"
            style={{ background: "repeating-linear-gradient(-45deg,transparent,transparent 3px,rgba(156,163,175,0.35) 3px,rgba(156,163,175,0.35) 4px)" }}
          />Booked
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-50 border border-red-200 inline-block"
            style={{ background: "repeating-linear-gradient(-45deg,transparent,transparent 3px,rgba(239,68,68,0.2) 3px,rgba(239,68,68,0.2) 4px)" }}
          />Blocked
        </span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-50 inline-block" />Past</span>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── Main Dialog ───────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
export default function EditAppointmentDialog({
  open, onClose, form, setForm, onSave, saving = false, bookingId,
}: Props) {
  const [blockedRows,  setBlockedRows]  = useState<BlockedDateRow[]>([])
  const [allBookings,  setAllBookings]  = useState<ExistingBooking[]>([])
  const [slotStatuses, setSlotStatuses] = useState<Record<string, SlotStatus>>({})
  const [loadingData,  setLoadingData]  = useState(false)

  // ── Fetch blocked dates once when dialog opens ─────────────────────────────
  useEffect(() => {
    if (!open) return
    supabase
      .from("admin_blocked_dates")
      .select("blocked_date, blocked_start, blocked_end, reason")
      .then(({ data: bd }) => {
        setBlockedRows((bd as BlockedDateRow[]) ?? [])
      })
  }, [open])

  // ── Fetch bookings whenever dialog opens OR selected date changes ──────────
  //    Uses overlap-based query via fetchBookingsByDate helper.
  //    Dependency array: [open, form.date] — refetches on every date change.
  useEffect(() => {
    if (!open || !form.date) return

    setLoadingData(true)

    fetchBookingsByDate(form.date)
      .then(bookings => {
        setAllBookings(bookings)
      })
      .finally(() => {
        setLoadingData(false)
      })
  }, [open, form.date]) // ✅ Refetches when date changes

  // ── Derived durations ──────────────────────────────────────────────────────
  const isStudioRental   = form.service === "studio_rental"
  const isPhotoshoot     = isPhotoshootSvc(form.service)
  const isMakeupOnly     = isMakeupOnlySvc(form.service)

  // Makeup add-on adds 1 hour per person before the main session
  const makeupExtraMin  = isStudioRental && form.addons.makeup ? (form.makeupPeople ?? 1) * 60 : 0
  const baseDurationMin = isStudioRental
    ? (form.studioHours ?? 1) * 60
    : isPhotoshoot
      ? (form.photoshootSets ?? 1) * 120
      : isMakeupOnly
        ? (form.makeupOnlyPeople ?? 1) * MAKEUP_ONLY_DURATION_MIN
        : form.duration
  const totalDurationMin = baseDurationMin + makeupExtraMin
  const endTime = form.time ? fmtHHMM(toMin(form.time) + totalDurationMin) : ""

  // ── Rebuild slot statuses whenever inputs change ───────────────────────────
  useEffect(() => {
    if (!form.date || totalDurationMin <= 0) {
      setSlotStatuses({})
      return
    }

    const statuses = buildSlotStatuses(
      form.date,
      totalDurationMin,
      blockedRows,
      allBookings,
      bookingId
    )
    setSlotStatuses(statuses)

    // If the currently-selected time is no longer valid (e.g. another booking
    // just loaded that overlaps it), clear the selection using a functional
    // update to avoid the stale-closure bug.
    setForm(prev => {
      if (prev.time && statuses[prev.time] !== "available") {
        return { ...prev, time: "" }
      }
      return prev
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.date, totalDurationMin, blockedRows, allBookings, bookingId])

  // ── Pricing ───────────────────────────────────────────────────────────────
  let basePrice = 0
  if (isStudioRental) {
    const opt = STUDIO_RENTAL_OPTIONS.find(o => o.hours === (form.studioHours ?? 1))
    if (opt) basePrice = form.studioBackdrop ? opt.priceBackdrop : opt.priceBasic
  } else if (isPhotoshoot) {
    const pkg = PHOTOSHOOT_PACKAGES.find(p => p.value === form.service)
    if (pkg) basePrice = pkg.prices[form.photoshootSets ?? 1] ?? 0
  } else if (isMakeupOnly) {
    basePrice = (form.makeupOnlyPeople ?? 1) * MAKEUP_ONLY_PRICE_PER_PERSON
  }
  const addonsPrice = isStudioRental
    ? (form.addons.photographer ? ADDON_PHOTOGRAPHER_PRICE : 0)
      + (form.addons.makeup ? (form.makeupPeople ?? 1) * ADDON_MAKEUP_PRICE_PER_PERSON : 0)
    : 0
  const totalPrice = basePrice + addonsPrice

  const selectedStudioOpt = STUDIO_RENTAL_OPTIONS.find(o => o.hours === (form.studioHours ?? 1))
  const selectedPkg       = PHOTOSHOOT_PACKAGES.find(p => p.value === form.service)

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-y-auto py-4">
      <div className="bg-white w-[600px] max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#F5F5F5] to-white border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-[#1A1A1A]">Edit Appointment</h2>
          <p className="text-xs text-[#6B6B6B] mt-0.5">Update booking details and schedule</p>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

        {/* CLIENT DETAILS */}
        <div className="space-y-2.5">
          <p className="text-xs font-semibold text-[#1A1A1A] uppercase tracking-wide">Client Information</p>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs text-[#6B6B6B] font-medium">First Name</label>
              <input type="text" className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#C8A96A] focus:border-transparent"
                value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-[#6B6B6B] font-medium">Last Name</label>
              <input type="text" className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#C8A96A] focus:border-transparent"
                value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-[#6B6B6B] font-medium">Email</label>
              <input type="email" className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#C8A96A] focus:border-transparent"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-[#6B6B6B] font-medium">Phone</label>
              <input type="tel" className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#C8A96A] focus:border-transparent"
                value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
        </div>

        {/* SERVICE */}
        <div className="space-y-2">
          <label className="text-xs text-[#6B6B6B] font-medium uppercase tracking-wide">Service Type</label>
          <select
            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#C8A96A] focus:border-transparent"
            value={form.service}
            onChange={e => {
              const val = e.target.value
              setForm({
                ...form, service: val, photoshootSets: 1, studioHours: 1,
                studioBackdrop: false, duration: val === "studio_rental" ? 60 : val === "makeup_only" ? 60 : 120,
                time: "",
                addons: val === "studio_rental" ? form.addons : { photographer: false, makeup: false },
                makeupPeople: 1,
                makeupOnlyPeople: 1,
              })
            }}
          >
            <option value="">Select Service</option>
            <optgroup label="Studio Rental"><option value="studio_rental">Studio Rental</option></optgroup>
            <optgroup label="Photoshoot Packages">
              {PHOTOSHOOT_PACKAGES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </optgroup>
            <optgroup label="Makeup Services">
              <option value="makeup_only">Makeup Only (1 hr) – ₱1,200/person</option>
            </optgroup>
          </select>
        </div>

        {/* PHOTOSHOOT CONFIG */}
        {isPhotoshoot && selectedPkg && (
          <div className="bg-gradient-to-br from-[#F5F5F5] to-white border border-gray-200 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[#C8A96A] uppercase tracking-wide">📷 {selectedPkg.label}</p>
              <span className="text-[10px] text-[#6B6B6B] bg-white border border-gray-200 rounded-full px-2 py-0.5">2h/set</span>
            </div>
            <p className="text-xs text-[#6B6B6B] leading-snug">{selectedPkg.description}</p>
            <div className="flex gap-2">
              {[1, 2, 3].map(n => (
                <button key={n} type="button"
                  onClick={() => setForm({ ...form, photoshootSets: n, duration: n * 120, time: "" })}
                  className={`flex-1 flex flex-col items-center py-2 rounded-lg border transition-all text-[11px] ${
                    (form.photoshootSets ?? 1) === n
                      ? "border-[#C8A96A] bg-[#C8A96A]/5 shadow-sm text-[#C8A96A] font-bold"
                      : "border-gray-200 bg-white hover:border-[#C8A96A] text-gray-600"
                  }`}
                >
                  <span className="font-bold">{n}S</span>
                  <span className="text-[9px] text-[#6B6B6B]">{n * 2}h</span>
                  <span className="text-[10px] font-semibold text-[#C8A96A] mt-0.5">₱{(selectedPkg.prices[n] ?? 0).toLocaleString()}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MAKEUP ONLY CONFIG */}
        {isMakeupOnly && (
          <div className="bg-gradient-to-br from-[#F5F5F5] to-white border border-gray-200 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[#C8A96A] uppercase tracking-wide">💄 Makeup Only</p>
              <span className="text-[10px] text-[#6B6B6B] bg-white border border-gray-200 rounded-full px-2 py-0.5">1 hr · ₱1,200/person</span>
            </div>
            <p className="text-xs text-[#6B6B6B] leading-snug">Hair &amp; Makeup Artist — standalone makeup session, no photoshoot.</p>
            <div className="flex items-center gap-3 bg-[#C8A96A]/5 rounded-lg px-3 py-2 text-xs">
              <span className="text-[#6B6B6B] font-medium">Number of people:</span>
              <button type="button"
                onClick={() => setForm({ ...form, makeupOnlyPeople: Math.max(1, (form.makeupOnlyPeople ?? 1) - 1), time: "" })}
                className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-[#1A1A1A] font-bold">−</button>
              <span className="w-5 text-center font-bold text-[#1A1A1A]">{form.makeupOnlyPeople ?? 1}</span>
              <button type="button"
                onClick={() => setForm({ ...form, makeupOnlyPeople: Math.min(10, (form.makeupOnlyPeople ?? 1) + 1), time: "" })}
                className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-[#1A1A1A] font-bold">+</button>
              <span className="text-[#C8A96A] font-semibold ml-auto">
                ₱{((form.makeupOnlyPeople ?? 1) * MAKEUP_ONLY_PRICE_PER_PERSON).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* STUDIO RENTAL CONFIG */}
        {isStudioRental && (
          <div className="bg-gradient-to-br from-[#F5F5F5] to-white border border-gray-200 rounded-xl p-3.5 space-y-3">
            <p className="text-xs font-semibold text-[#C8A96A] uppercase tracking-wide">🎬 Studio Rental</p>
            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-xs text-[#6B6B6B] font-medium">Duration</label>
              <div className="grid grid-cols-3 gap-2">
                {STUDIO_RENTAL_OPTIONS.slice(0, 3).map(opt => {
                  const sel = (form.studioHours ?? 1) === opt.hours
                  return (
                    <button key={opt.hours} type="button"
                      onClick={() => setForm({ ...form, studioHours: opt.hours, duration: opt.hours * 60, time: "" })}
                      className={`flex flex-col items-center p-2 rounded-lg border transition-all text-center ${sel ? "border-[#C8A96A] bg-[#C8A96A]/5" : "border-gray-200 hover:border-[#C8A96A] bg-white"}`}
                    >
                      <span className={`text-xs font-bold ${sel ? "text-[#C8A96A]" : "text-gray-700"}`}>{opt.label}</span>
                      <span className="text-[10px] text-[#6B6B6B] mt-0.5">₱{(form.studioBackdrop ? opt.priceBackdrop : opt.priceBasic).toLocaleString()}</span>
                    </button>
                  )
                })}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {STUDIO_RENTAL_OPTIONS.slice(3).map(opt => {
                  const sel = (form.studioHours ?? 1) === opt.hours
                  return (
                    <button key={opt.hours} type="button"
                      onClick={() => setForm({ ...form, studioHours: opt.hours, duration: opt.hours * 60, time: "" })}
                      className={`flex flex-col items-center p-2 rounded-lg border transition-all text-center ${sel ? "border-[#C8A96A] bg-[#C8A96A]/5" : "border-gray-200 hover:border-[#C8A96A] bg-white"}`}
                    >
                      <span className={`text-xs font-bold ${sel ? "text-[#C8A96A]" : "text-gray-700"}`}>{opt.label}</span>
                      <span className="text-[10px] text-[#6B6B6B] mt-0.5">₱{(form.studioBackdrop ? opt.priceBackdrop : opt.priceBasic).toLocaleString()}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            {/* Inclusions */}
            <div className="space-y-1.5 border-t border-gray-200 pt-3">
              <label className="text-xs text-[#6B6B6B] font-medium">Package</label>
              <div className="space-y-1.5">
                {([false, true] as const).map(backdrop => (
                  <label key={String(backdrop)} className="flex items-center gap-2 text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-2 cursor-pointer hover:border-[#C8A96A]">
                    <input type="radio" className="accent-[#C8A96A]"
                      checked={form.studioBackdrop === backdrop}
                      onChange={() => setForm({ ...form, studioBackdrop: backdrop })} />
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-[#1A1A1A] block">{backdrop ? "With Backdrop" : "Basic"}</span>
                      <span className="text-[11px] text-[#6B6B6B]">{backdrop ? "Space + Lighting + Backdrop" : "Space + Basic Lighting"}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            {/* Add-ons */}
            <div className="space-y-1.5 border-t border-gray-200 pt-3">
              <label className="text-xs text-[#6B6B6B] font-medium">Add-ons</label>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-2 cursor-pointer hover:border-[#C8A96A]">
                  <input type="checkbox" className="accent-[#C8A96A]"
                    checked={form.addons.photographer}
                    onChange={e => setForm({ ...form, addons: { ...form.addons, photographer: e.target.checked } })} />
                  <span className="flex-1 min-w-0"><span className="font-semibold text-[#1A1A1A]">Photographer</span>
                    <span className="text-[#6B6B6B] ml-1">(+₱{ADDON_PHOTOGRAPHER_PRICE.toLocaleString()})</span></span>
                </label>
                <label className="flex items-center gap-2 text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-2 cursor-pointer hover:border-[#C8A96A]">
                  <input type="checkbox" className="accent-[#C8A96A]"
                    checked={form.addons.makeup}
                    onChange={e => setForm({ ...form, addons: { ...form.addons, makeup: e.target.checked }, makeupPeople: e.target.checked ? (form.makeupPeople ?? 1) : 1, time: "" })} />
                  <span className="flex-1 min-w-0"><span className="font-semibold text-[#1A1A1A]">Hair & Makeup</span>
                    <span className="text-[#6B6B6B] ml-1">(₱{ADDON_MAKEUP_PRICE_PER_PERSON.toLocaleString()}/p)</span></span>
                </label>
                {form.addons.makeup && (
                  <div className="ml-5 flex items-center gap-2 mt-1 bg-[#C8A96A]/5 rounded-lg px-2 py-1.5 text-xs">
                    <span className="text-[#6B6B6B] font-medium">People:</span>
                    <button type="button" onClick={() => setForm({ ...form, makeupPeople: Math.max(1, (form.makeupPeople ?? 1) - 1), time: "" })}
                      className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-[#1A1A1A]">−</button>
                    <span className="w-4 text-center font-bold">{form.makeupPeople ?? 1}</span>
                    <button type="button" onClick={() => setForm({ ...form, makeupPeople: Math.min(10, (form.makeupPeople ?? 1) + 1), time: "" })}
                      className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-[#1A1A1A]">+</button>
                    <span className="text-[#6B6B6B] ml-auto">₱{((form.makeupPeople ?? 1) * ADDON_MAKEUP_PRICE_PER_PERSON).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ DATE & TIME SECTION ══════════════════════════════════════════════ */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#F5F5F5] to-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-[#1A1A1A] uppercase tracking-wide">📅 Date &amp; Time</p>
            {loadingData && (
              <span className="text-xs text-[#6B6B6B] flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 border-2 border-gray-300 border-t-[#C8A96A] rounded-full animate-spin" />
                Loading…
              </span>
            )}
          </div>

          <div className="p-3.5 space-y-3">
            {/* ─ Calendar ─ */}
            <div>
              <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide mb-2">Select Date</p>
              <InlineCalendar
                value={form.date}
                onChange={d => setForm({ ...form, date: d, time: "" })}
                blockedRows={blockedRows}
              />
            </div>

            {/* ─ Selected date info bar ─ */}
            {form.date && (
              <div className={`rounded-lg px-2.5 py-2 text-xs flex items-start gap-2 border ${
                isDateBlocked(form.date, blockedRows)
                  ? "bg-red-50 text-red-600 border-red-200"
                  : "bg-[#C8A96A]/5 text-[#1A1A1A] border-[#C8A96A]/20"
              }`}>
                {isDateBlocked(form.date, blockedRows) ? (
                  <>
                    <span className="mt-0.5 text-sm">🚫</span>
                    <span className="leading-snug">
                      <strong>Blocked:</strong> {getBlockReason(form.date, blockedRows)}
                    </span>
                  </>
                ) : (
                  <span className="leading-snug">
                    <strong className="text-[#1A1A1A]">
                      {new Date(`${form.date}T00:00:00`).toLocaleDateString("en-US", {
                        weekday: "short", month: "short", day: "numeric",
                      })}
                    </strong>
                    {" — "}
                    <span className="text-[#6B6B6B] text-[11px]">
                      {(() => {
                        const dow = new Date(`${form.date}T00:00:00`).getDay()
                        const h   = STUDIO_HOURS[dow]
                        return `${fmtAMPM(fmtHHMM(h.open * 60))} – ${fmtAMPM(fmtHHMM(h.close * 60))}`
                      })()}
                    </span>
                  </span>
                )}
              </div>
            )}

            {/* ─ Time slot grid ─ */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">Select Time</p>
                {form.date && totalDurationMin > 0 && (
                  <span className="text-[10px] text-[#6B6B6B] bg-[#F5F5F5] rounded-full px-2 py-0.5">
                    {Math.floor(totalDurationMin / 60)}h{totalDurationMin % 60 > 0 ? ` ${totalDurationMin % 60}m` : ""}
                  </span>
                )}
              </div>
              {loadingData && form.date ? (
                <div className="text-xs text-[#6B6B6B] py-2 flex items-center gap-1.5">
                  <svg className="animate-spin w-3 h-3 text-[#C8A96A]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Checking availability…
                </div>
              ) : (
                <TimeSlotGrid
                  dateStr={form.date}
                  durationMin={totalDurationMin}
                  statuses={slotStatuses}
                  selectedTime={form.time}
                  onSelect={t => setForm({ ...form, time: t })}
                />
              )}
            </div>

            {/* ─ Booking confirmation banner ─ */}
            {form.time && endTime && (
              <div className="bg-[#C8A96A]/8 border border-[#C8A96A]/25 rounded-lg px-3 py-2.5 flex items-center gap-2.5">
                <span className="text-lg">🕐</span>
                <div className="text-xs text-[#1A1A1A] leading-snug">
                  <span className="block font-bold text-[#C8A96A] text-sm">
                    {fmtAMPM(form.time)} → {fmtAMPM(endTime)}
                  </span>
                  <span className="text-[#6B6B6B]">
                    {new Date(`${form.date}T00:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    {" · "}
                    {Math.floor(totalDurationMin / 60)}h{totalDurationMin % 60 > 0 ? ` ${totalDurationMin % 60}m` : ""}
                    {makeupExtraMin > 0 && ` (+${makeupExtraMin / 60}h makeup)`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PAYMENT */}
        <div className="space-y-2.5 border-t pt-3">
          <p className="text-xs font-semibold text-[#1A1A1A] uppercase tracking-wide">Payment Details</p>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1.5">
              <label className="text-xs text-[#6B6B6B] font-medium">Method</label>
              <select className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#C8A96A] focus:border-transparent"
                value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
                <option value="">Select Method</option>
                <option value="gcash">GCash</option>
                <option value="maya">Maya</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="credit_card">Credit/Debit Card</option>
                <option value="other">Other</option>
              </select>
              {form.paymentMethod === "other" && (
                <input type="text" placeholder="Specify method" className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#C8A96A] focus:border-transparent"
                  value={form.paymentMethodOther} onChange={e => setForm({ ...form, paymentMethodOther: e.target.value })} />
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-[#6B6B6B] font-medium">Reference No.</label>
              <input type="text" placeholder="e.g. 10002938475" className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#C8A96A] focus:border-transparent"
                value={form.paymentReference} onChange={e => setForm({ ...form, paymentReference: e.target.value })} />
            </div>
          </div>
        </div>

        {/* PRICE BREAKDOWN */}
        {form.service && (
          <div className="border-t pt-3 space-y-1 text-xs">
            {isStudioRental && selectedStudioOpt && (
              <>
                <div className="flex justify-between text-[#6B6B6B]">
                  <span>{selectedStudioOpt.label}{form.studioBackdrop ? " · Backdrop" : " · Basic"}</span>
                  <span className="font-medium">₱{(form.studioBackdrop ? selectedStudioOpt.priceBackdrop : selectedStudioOpt.priceBasic).toLocaleString()}</span>
                </div>
                {form.addons.photographer && (
                  <div className="flex justify-between text-[#6B6B6B]">
                    <span>Photographer</span><span className="font-medium">+₱{ADDON_PHOTOGRAPHER_PRICE.toLocaleString()}</span>
                  </div>
                )}
                {form.addons.makeup && (
                  <div className="flex justify-between text-[#6B6B6B]">
                    <span>Hair & Makeup × {form.makeupPeople ?? 1}</span>
                    <span className="font-medium">+₱{((form.makeupPeople ?? 1) * ADDON_MAKEUP_PRICE_PER_PERSON).toLocaleString()}</span>
                  </div>
                )}
              </>
            )}
            {isPhotoshoot && selectedPkg && (
              <div className="flex justify-between text-[#6B6B6B]">
                <span>{form.photoshootSets ?? 1}×{selectedPkg.label.split('–')[0].trim()}</span>
                <span className="font-medium">₱{(selectedPkg.prices[form.photoshootSets ?? 1] ?? 0).toLocaleString()}</span>
              </div>
            )}
            {isMakeupOnly && (
              <div className="flex justify-between text-[#6B6B6B]">
                <span>Makeup Only × {form.makeupOnlyPeople ?? 1} person{(form.makeupOnlyPeople ?? 1) > 1 ? "s" : ""}</span>
                <span className="font-medium">₱{((form.makeupOnlyPeople ?? 1) * MAKEUP_ONLY_PRICE_PER_PERSON).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-1.5 border-t border-gray-200 font-bold text-sm">
              <span className="text-[#1A1A1A]">Total</span>
              <span className="text-[#C8A96A]">₱{totalPrice.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* NOTES */}
        <textarea placeholder="Notes (optional)" rows={2}
          className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#C8A96A] focus:border-transparent"
          value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />

        </div>

        {/* ACTIONS */}
        <div className="border-t bg-[#F5F5F5] px-6 py-3 flex justify-end gap-2">
          <button onClick={onClose} className="px-3.5 py-2 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors text-sm font-medium">Cancel</button>
          <button
            onClick={() => onSave(totalPrice)}
            disabled={
              saving ||
              loadingData ||
              !form.service ||
              !form.date ||
              !form.time ||
              isDateBlocked(form.date, blockedRows) ||
              slotStatuses[form.time] !== "available"
            }
            className="px-4 py-2 bg-[#C8A96A] text-black rounded-lg hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm transition-opacity"
          >
            {saving ? "Saving…" : "Save Appointment"}
          </button>
        </div>
      </div>
    </div>
  )
}
