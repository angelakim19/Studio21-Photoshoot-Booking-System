import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  const { userId } = await req.json()

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const deletions = [
    supabase.from("bookings").delete().eq("user_id", userId),
    supabase.from("user_settings").delete().eq("user_id", userId),
    supabase.from("user_profiles").delete().eq("user_id", userId),
    supabase.from("users").delete().eq("id", userId),
  ]

  for (const deletion of deletions) {
    const { error } = await deletion

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  const { error } = await supabase.auth.admin.deleteUser(userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}