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
      inclusions_snapshot
    } = body

    // ✅ REQUIRED VALIDATION
    if (!service_id || !date || !time || !duration) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const start_datetime = new Date(`${date}T${time}:00`)
    const end_datetime = new Date(
      start_datetime.getTime() + duration * 60 * 60 * 1000
    )

    // ✅ READ TOKEN FROM HEADER
    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "No token" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")

    // ✅ CREATE SUPABASE CLIENT WITH TOKEN
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )

    // ✅ GET USER
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    console.log("API USER:", user)

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ✅ BUILD DATA
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
      inclusions_snapshot
    }

    // ✅ SERVICE-BASED ASSIGNMENT (REPLACE OLD LOGIC)
    if (service_id === 1) {
      // 📸 Photoshoot
      bookingData.package_id = package_id
      bookingData.package_variation_id = package_variation_id
    }

    else if (service_id === 2) {
      // 💄 Makeup
      bookingData.makeup_service_id = makeup_service_id
    }

    else if (service_id === 3) {
      // 🏢 Studio Rental
      bookingData.studio_rental_option_id = studio_rental_option_id
    }

    // ✅ INSERT
    const { data, error } = await supabase
      .from("bookings")
      .insert([bookingData])
      .select()
      .single()

    if (error) {
      console.error("❌ INSERT ERROR:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })

  } catch (err) {
    console.error("❌ SERVER ERROR:", err)
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    )
  }
}