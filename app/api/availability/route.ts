import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  const { date, duration } = await req.json()

  const startHour = 9
  const endHour = 18

  const slots: string[] = []

  for (let hour = startHour; hour <= endHour - duration; hour++) {
    const time = `${hour.toString().padStart(2, "0")}:00`
    slots.push(time)
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const startOfDay = new Date(date + "T00:00:00").toISOString()
  const endOfDay = new Date(date + "T23:59:59").toISOString()

  const { data: bookings } = await supabase
    .from("bookings")
    .select("start_datetime, end_datetime, status")
    .eq("status", "approved")
    //.or(`and(start_datetime.lte.${endOfDay},end_datetime.gte.${startOfDay})`)

    console.log("📦 BOOKINGS:", bookings)
  const bookingsList = (bookings || []).filter((booking) => {
      return booking.start_datetime.startsWith(date)
    })

  console.log("📅 FILTERED BOOKINGS:", bookingsList)

  const availableSlots = slots.filter((slot) => {
    const slotStart = new Date(`${date}T${slot}:00`)
    const slotEnd = new Date(slotStart.getTime() + duration * 60 * 60 * 1000)

    return !bookingsList.some((booking) => {
      const bookingStart = new Date(booking.start_datetime + "+08:00")
const bookingEnd = new Date(booking.end_datetime + "+08:00")
      return slotStart < bookingEnd && slotEnd > bookingStart
    })
  })

  return NextResponse.json({ slots: availableSlots })
}