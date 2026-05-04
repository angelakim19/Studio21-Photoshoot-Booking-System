import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from("admin_blocked_dates")
    .select("blocked_date")

  if (error) {
    console.error(error)
    return NextResponse.json([])
  }

  const dates = data.map((d) => d.blocked_date)

  return NextResponse.json(dates)
}