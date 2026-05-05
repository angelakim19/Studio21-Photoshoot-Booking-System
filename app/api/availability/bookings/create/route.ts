import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      date,
      time,
      duration,
      service_id,
      package_id,
      package_variation_id,
      studio_rental_option_id,
      makeup_service_id,
      number_of_persons,
      total_price,
      notes,
      package_name_snapshot,
      package_price_snapshot,
      inclusions_snapshot,
      payment_method,
      reference_number,
    } = body

    // REQUIRED VALIDATION
    if (!service_id || !date || !time || !duration) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!payment_method || !reference_number) {
      return NextResponse.json(
        { error: "Payment details required" },
        { status: 400 }
      )
    }

    // optional strict validation
    if (!/^\d{12}$/.test(reference_number)) {
      return NextResponse.json(
        { error: "Reference number must be exactly 12 digits" },
        { status: 400 }
      )
    }


    function addHours(time: string, duration: number) {
      const [hour, minute] = time.split(":").map(Number)
      const newHour = hour + duration

      return `${String(newHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
    }
    const start_datetime = `${date} ${time}:00`
    const end_datetime = `${date} ${addHours(time, duration)}:00`
    //const start_datetime = new Date(`${date}T${time}:00`)
    //const end_datetime = new Date(
    //  start_datetime.getTime() + duration * 60 * 60 * 1000
    //)

    // READ TOKEN
    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "No token" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")

    // SUPABASE CLIENT
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    )

    // GET USER
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // BUILD BOOKING DATA
    const bookingData: any = {
      user_id: user.id,
      service_id,
      number_of_persons: number_of_persons || null,
      total_price,
      notes,
      start_datetime,
      end_datetime,
      status: "pending",
      payment_status: "pending",
      calendar_event_id: null,
      package_name_snapshot,
      package_price_snapshot,
      inclusions_snapshot,
    }

    // SERVICE-BASED ASSIGNMENT
    if (service_id === 1) {
      bookingData.package_id = package_id
      bookingData.package_variation_id = package_variation_id
    } else if (service_id === 2) {
      bookingData.makeup_service_id = makeup_service_id
    } else if (service_id === 3) {
      bookingData.studio_rental_option_id = studio_rental_option_id
    }

    // INSERT BOOKING
    const { data, error } = await supabase
      .from("bookings")
      .insert([bookingData])
      .select()
      .single()

    if (error) {
      console.error("❌ BOOKING INSERT ERROR:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // INSERT PAYMENT (linked to booking)
    const { error: paymentError } = await supabase
      .from("payments")
      .insert([
        {
          booking_id: data.id,
          amount: total_price,
          payment_method,
          payment_reference: reference_number,
          status: "pending",
        },
      ])

    if (paymentError) {
      console.error("❌ PAYMENT INSERT ERROR:", paymentError)
      // optional: you can fail here if needed
    }

    // SUCCESS RESPONSE
    return NextResponse.json({ success: true, data })

  } catch (err) {
    console.error("❌ SERVER ERROR:", err)
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    )
  }
}