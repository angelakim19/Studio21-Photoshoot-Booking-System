import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

/**
 * FIXED: Uses PH Time offset to ensure the day of the week (Sunday vs Weekday)
 * is calculated correctly regardless of server location.
 */
function getBusinessHours(dateString: string) {
  // Creating the date with +08:00 ensures day 0 (Sunday) is PH Sunday.
  const d = new Date(`${dateString}T00:00:00+08:00`)
  const day = d.getDay() 
  
  // Sunday: 07:00 - 23:00 | Mon-Sat: 08:00 - 23:00
  return day === 0 ? { start: 7, end: 23 } : { start: 8, end: 23 }
}

export async function POST(req: Request) {
  try {
    const { date, duration } = await req.json()
    const normalizedDuration = Number(duration)

    // 1. Validation
    if (!date || !Number.isFinite(normalizedDuration) || normalizedDuration <= 0) {
      return NextResponse.json({ slots: [] }, { status: 400 })
    }

    const { start: startHour, end: endHour } = getBusinessHours(date)
    const slots: string[] = []

    // 2. Generate all possible starting slots
    for (let hour = startHour; hour <= endHour - normalizedDuration; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`)
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 3. Fetch existing bookings
    // We filter for the specific date. We include the PH offset in the query
    // to handle 'timestamptz' columns correctly in Supabase.
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("start_datetime, end_datetime, status")
      .in("status", ["pending", "approved"]) // EXCLUDES 'cancelled' automatically
      .gte("start_datetime", `${date}T00:00:00+08:00`)
      .lte("start_datetime", `${date}T23:59:59+08:00`)

    if (error) throw error

    // Helper to convert HH:mm to total minutes for easier math
    const timeToMinutes = (time: string) => {
      const [hour, minute] = time.split(":").map(Number)
      return hour * 60 + (minute || 0)
    }

    // 4. Filter slots by checking for overlaps
    const availableSlots = slots.filter((slot) => {
      const slotStart = timeToMinutes(slot)
      const slotEnd = slotStart + normalizedDuration * 60

      const hasOverlap = bookings?.some((booking) => {
        // Extracts the time part (HH:mm) regardless of 'T' or ' ' separator
        const bStartStr = booking.start_datetime.split(/[T ]/)[1]?.slice(0, 5)
        const bEndStr = booking.end_datetime.split(/[T ]/)[1]?.slice(0, 5)
        
        if (!bStartStr || !bEndStr) return false

        const bStart = timeToMinutes(bStartStr)
        const bEnd = timeToMinutes(bEndStr)

        // Overlap formula: (StartA < EndB) AND (EndA > StartB)
        return slotStart < bEnd && slotEnd > bStart
      })

      return !hasOverlap
    })

    return NextResponse.json({ slots: availableSlots })

  } catch (err) {
    console.error("Booking API Error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}