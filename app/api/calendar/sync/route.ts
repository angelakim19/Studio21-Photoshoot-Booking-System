import { google } from "googleapis"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SERVICE_LABELS: Record<string, string> = {
  studio_rental: "Studio Rental",
  pkg_a:         "Package A – Indoor Set Design",
  pkg_b:         "Package B – Plain Background",
  pkg_c:         "Package C – Outdoor Shoot",
}

function getGoogleAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key:   process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/calendar.events"],
  })
}

export async function POST(req: NextRequest) {
  try {
    const { bookingId, action } = await req.json()
    const calendar  = google.calendar({ version: "v3", auth: getGoogleAuth() })
    const calendarId = process.env.GOOGLE_CALENDAR_ID!

    // ── DELETE ────────────────────────────────────────────────────────────────
    if (action === "delete") {
      const { data: booking } = await supabase
        .from("bookings")
        .select("calendar_event_id")
        .eq("id", bookingId)
        .single()

      if (booking?.calendar_event_id) {
        await calendar.events.delete({
          calendarId,
          eventId: booking.calendar_event_id,
        }).catch(() => {}) // ignore if already deleted on Google's side
      }

      await supabase
        .from("bookings")
        .update({ calendar_event_id: null })
        .eq("id", bookingId)

      return NextResponse.json({ success: true })
    }

    // ── CREATE / UPDATE ───────────────────────────────────────────────────────
    const { data: booking, error } = await supabase
      .from("bookings")
      .select(`
        id,
        start_datetime,
        end_datetime,
        total_price,
        package_name_snapshot,
        notes,
        calendar_event_id,
        users ( first_name, last_name, email, phone )
      `)
      .eq("id", bookingId)
      .single()

    if (error || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const clientName   = `${booking.users?.first_name ?? ""} ${booking.users?.last_name ?? ""}`.trim() || "Client"
    const serviceLabel = SERVICE_LABELS[booking.package_name_snapshot] ?? booking.package_name_snapshot ?? "Booking"
    const phone        = booking.users?.phone ? `📞 ${booking.users.phone}` : ""
    const email        = booking.users?.email ? `✉️ ${booking.users.email}` : ""

    // Strip __meta__ block from notes to get human-readable notes only
    const rawNotes   = booking.notes ?? ""
    const humanNotes = rawNotes.replace(/^__meta__:\{.*?\}\n?/s, "").trim()

    // The stored datetime strings (e.g. "2026-06-14 09:00:00") have no timezone
    // suffix, so new Date() would wrongly treat them as UTC and shift +8 hrs.
    // We strip any existing offset, then re-append +08:00 so Google Calendar
    // receives the correct PH wall-clock time without any double-shift.
    const toManilaIso = (raw: string): string =>
      raw.replace(" ", "T").replace(/([+-]\d{2}:\d{2}|Z)$/, "") + "+08:00"

    const eventBody = {
      summary:     `📷 ${clientName} — ${serviceLabel}`,
      description: [
        `Booking #${booking.id}`,
        `Service: ${serviceLabel}`,
        `Total: ₱${Number(booking.total_price).toLocaleString()}`,
        phone,
        email,
        humanNotes ? `Notes: ${humanNotes}` : "",
      ].filter(Boolean).join("\n"),
      start: { dateTime: toManilaIso(booking.start_datetime), timeZone: "Asia/Manila" },
      end:   { dateTime: toManilaIso(booking.end_datetime),   timeZone: "Asia/Manila" },
      colorId: "2", // green
    }

    let calendarEventId: string

    if (booking.calendar_event_id) {
      // Update existing event
      const updated = await calendar.events.update({
        calendarId,
        eventId:     booking.calendar_event_id,
        requestBody: eventBody,
      })
      calendarEventId = updated.data.id!
    } else {
      // Create new event
      const created = await calendar.events.insert({
        calendarId,
        requestBody: eventBody,
      })
      calendarEventId = created.data.id!
    }

    // Save calendar_event_id back to the booking row
    await supabase
      .from("bookings")
      .update({ calendar_event_id: calendarEventId })
      .eq("id", bookingId)

    return NextResponse.json({ success: true, calendarEventId })

  } catch (err: any) {
    console.error("calendar/sync error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}