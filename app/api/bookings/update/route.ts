import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "No token" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    const authedClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      }
    )

    const {
      data: { user },
      error: authError,
    } = await authedClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const bookingId = Number(body?.bookingId)
    const updates = body?.updates || {}

    if (!Number.isFinite(bookingId) || bookingId <= 0) {
      return NextResponse.json({ error: "Invalid booking id" }, { status: 400 })
    }

    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const actorEmail = user.email?.toLowerCase() || null
    const { data: actorProfiles } = await serviceClient
      .from("users")
      .select("id, role, email")
      .or(actorEmail ? `id.eq.${user.id},email.ilike.${actorEmail}` : `id.eq.${user.id}`)

    const { data: booking, error: bookingError } = await serviceClient
      .from("bookings")
      .select("id, user_id")
      .eq("id", bookingId)
      .maybeSingle()

    if (bookingError) {
      return NextResponse.json({ error: bookingError.message }, { status: 500 })
    }
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const actorRows = actorProfiles || []
    const isAdmin = actorRows.some((p: any) => p?.role === "admin")
    const linkedIds = new Set<string>([user.id, ...actorRows.map((p: any) => p?.id).filter(Boolean)])
    const isAllowed = isAdmin || linkedIds.has(booking.user_id)

    if (!isAllowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const allowedKeys = new Set([
      "package_name_snapshot",
      "start_datetime",
      "end_datetime",
      "service_id",
      "package_id",
      "makeup_service_id",
      "studio_rental_option_id",
    ])

    const safeUpdates: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(updates)) {
      if (allowedKeys.has(key)) safeUpdates[key] = value
    }

    if (Object.keys(safeUpdates).length === 0) {
      return NextResponse.json({ error: "No valid updates" }, { status: 400 })
    }

    const { data: updatedRows, error: updateError } = await serviceClient
      .from("bookings")
      .update(safeUpdates)
      .eq("id", bookingId)
      .select(
        "id, user_id, service_id, package_id, makeup_service_id, studio_rental_option_id, package_name_snapshot, package_price_snapshot, start_datetime, end_datetime, total_price, status"
      )

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, booking: updatedRows?.[0] ?? null })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unexpected error" }, { status: 500 })
  }
}
