import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getBusinessHours(date: string) {
  const d = new Date(date)
  const day = d.getDay() // 0 = Sunday, 6 = Saturday

  // Sunday
  if (day === 0) {
    return { start: 7, end: 23 }
  }

  // Monday–Saturday
  return { start: 8, end: 23 }
}

export async function POST(req: Request) {
  const { date, duration } = await req.json()
  const normalizedDuration = Number(duration)

  if (!date || !Number.isFinite(normalizedDuration) || normalizedDuration <= 0) {
    return NextResponse.json({ slots: [] }, { status: 400 })
  }

  const { start: startHour, end: endHour } = getBusinessHours(date)

  const slots: string[] = []

  for (let hour = startHour; hour <= endHour - normalizedDuration; hour++) {
    const time = `${hour.toString().padStart(2, "0")}:00`
    slots.push(time)
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: bookings } = await supabase
    .from("bookings")
    .select("start_datetime, end_datetime, status")
    .eq("status", "approved")

  const bookingsList = (bookings || []).filter((booking) => {
    if (!booking?.start_datetime || !booking?.end_datetime) return false
    return booking.start_datetime.startsWith(date)
  })

  function timeToMinutes(time: string) {
    const [hour, minute] = time.split(":").map(Number)
    return hour * 60 + minute
  }
  const availableSlots = slots.filter((slot) => {
    const slotStart = timeToMinutes(slot)
    const slotEnd = slotStart + normalizedDuration * 60

    return !bookingsList.some((booking) => {
      const bookingStartTime = booking.start_datetime.split(" ")[1]?.slice(0, 5)
      const bookingEndTime = booking.end_datetime.split(" ")[1]?.slice(0, 5)
      if (!bookingStartTime || !bookingEndTime) return false

      const bookingStart = timeToMinutes(bookingStartTime)
      const bookingEnd = timeToMinutes(bookingEndTime)

      return slotStart < bookingEnd && slotEnd > bookingStart
    })
  })

  return NextResponse.json({ slots: availableSlots })
}