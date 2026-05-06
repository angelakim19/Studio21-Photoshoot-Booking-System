// lib/analytics-data.ts

import { supabaseServer } from "./supabaseServer"

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export async function getAnalyticsData() {
  const currentYear = new Date().getFullYear()

  // ---------------------------------------------------------------
  // Fire all independent queries in parallel with Promise.all
  // This cuts load time from ~8 sequential round trips to ~2
  // ---------------------------------------------------------------
  const [
    { count: totalBookings,  error: bookingsCountError },
    { data: clientRows,      error: clientsError       },
    { data: paidPayments,    error: revenueError       },
    { data: bookingServices, error: popularError       },
    { data: monthlyPayments, error: monthlyError       },
    { data: allBookingDates, error: weeklyError        },
    { data: breakdownRows,   error: breakdownError     },
  ] = await Promise.all([

    // 1. Total Bookings count
    supabaseServer
      .from("bookings")
      .select("*", { count: "exact", head: true }),

    // 2. All user_ids for distinct client count
    supabaseServer
      .from("bookings")
      .select("user_id"),

    // 3. Paid payments for total revenue
    supabaseServer
      .from("payments")
      .select("amount")
      .eq("status", "paid"),

    // 4. All service_ids for popular service calculation
    supabaseServer
      .from("bookings")
      .select("service_id"),

    // 5. Paid payments for monthly revenue chart
    supabaseServer
      .from("payments")
      .select("amount, created_at")
      .eq("status", "paid")
      .gte("created_at", `${currentYear}-01-01`)
      .lte("created_at", `${currentYear}-12-31`),

    // 6. Booking dates for weekly bookings chart
    supabaseServer
      .from("bookings")
      .select("start_datetime"),

    // 7. Service breakdown with FK join
    supabaseServer
      .from("bookings")
      .select("service_id, services(name)"),
  ])

  // Log any errors
  if (bookingsCountError) console.error("Error fetching total bookings:", bookingsCountError)
  if (clientsError)       console.error("Error fetching clients:", clientsError)
  if (revenueError)       console.error("Error fetching revenue:", revenueError)
  if (popularError)       console.error("Error fetching popular service:", popularError)
  if (monthlyError)       console.error("Error fetching monthly revenue:", monthlyError)
  if (weeklyError)        console.error("Error fetching weekly bookings:", weeklyError)
  if (breakdownError)     console.error("Error fetching service breakdown:", breakdownError)

  // -------------------------
  // 2. Total Clients
  // -------------------------
  const totalClients = clientRows
    ? new Set(clientRows.map((r) => r.user_id)).size
    : 0

  // -------------------------
  // 3. Total Revenue
  // -------------------------
  const totalRevenue = paidPayments
    ? paidPayments.reduce((sum, row) => sum + (row.amount ?? 0), 0)
    : 0

  // -------------------------
  // 4. Popular Service
  // Only this one needs a follow-up query (to resolve the name),
  // but it's a single lookup — not a chain.
  // -------------------------
  let popularService = "N/A"

  if (bookingServices && bookingServices.length > 0) {
    const serviceCount: Record<string, number> = {}
    for (const row of bookingServices) {
      if (!row.service_id) continue
      serviceCount[row.service_id] = (serviceCount[row.service_id] ?? 0) + 1
    }

    const topServiceId = Object.entries(serviceCount)
      .sort((a, b) => b[1] - a[1])[0]?.[0]

    if (topServiceId) {
      const { data: serviceRow, error: serviceNameError } = await supabaseServer
        .from("services")
        .select("name")
        .eq("id", topServiceId)
        .single()

      if (serviceNameError) console.error("Error fetching service name:", serviceNameError)
      if (serviceRow) popularService = serviceRow.name
    }
  }

  // -------------------------
  // 5. Monthly Revenue chart data
  // -------------------------
  const revenueByMonth: Record<number, number> = {}
  for (let i = 0; i < 12; i++) revenueByMonth[i] = 0

  if (monthlyPayments) {
    for (const row of monthlyPayments) {
      const month = new Date(row.created_at).getMonth()
      revenueByMonth[month] += row.amount ?? 0
    }
  }

  const monthlyRevenue = MONTH_LABELS.map((month, i) => ({
    month,
    revenue: revenueByMonth[i],
  }))

  // -------------------------
  // 6. Weekly Bookings chart data
  // -------------------------
  const dayCount: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
  const dayWeekSet: Record<number, Set<string>> = {
    0: new Set(), 1: new Set(), 2: new Set(),
    3: new Set(), 4: new Set(), 5: new Set(), 6: new Set(),
  }

  if (allBookingDates) {
    for (const row of allBookingDates) {
      if (!row.start_datetime) continue
      const date = new Date(row.start_datetime)
      const dow = date.getDay()
      const year = date.getFullYear()
      const startOfYear = new Date(year, 0, 1)
      const weekNo = Math.ceil(
        ((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
      )
      dayCount[dow] += 1
      dayWeekSet[dow].add(`${year}-W${weekNo}`)
    }
  }

  const weeklyBookings = DAY_LABELS.map((day, i) => {
    const dow = i === 0 ? 0 : i
    const weeks = dayWeekSet[dow].size || 1
    return {
      day,
      bookings: Math.round((dayCount[dow] / weeks) * 10) / 10,
    }
  })

  // -------------------------
  // 7. Service Breakdown chart data
  // -------------------------
  const serviceBookingCount: Record<string, number> = {}

  if (breakdownRows) {
    for (const row of breakdownRows) {
      const name = (row.services as any)?.name ?? "Unknown"
      serviceBookingCount[name] = (serviceBookingCount[name] ?? 0) + 1
    }
  }

  const totalForBreakdown =
    Object.values(serviceBookingCount).reduce((a, b) => a + b, 0) || 1

  const serviceBreakdown = Object.entries(serviceBookingCount)
    .map(([name, count]) => ({
      name,
      value: Math.round((count / totalForBreakdown) * 100),
    }))
    .sort((a, b) => b.value - a.value)

  // -------------------------
  // Return
  // -------------------------
  return {
    stats: {
      totalBookings: totalBookings ?? 0,
      totalClients,
      totalRevenue,
      popularService,
    },
    monthlyRevenue,
    weeklyBookings,
    serviceBreakdown,
  }
}