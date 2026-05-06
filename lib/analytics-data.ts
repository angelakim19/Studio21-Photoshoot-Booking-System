// lib/analytics-data.ts

import { supabaseServer } from "./supabaseServer"

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export async function getAnalyticsData() {
  const currentYear = new Date().getFullYear()

  const [
    { count: totalBookings,    error: bookingsCountError },
    { data: clientRows,        error: clientsError       },
    { data: approvedBookings,  error: revenueError       },
    { data: bookingServices,   error: popularError       },
    { data: monthlyBookings,   error: monthlyError       },
    { data: allBookingDates,   error: weeklyError        },
    { data: breakdownRows,     error: breakdownError     },
  ] = await Promise.all([

    // 1. Total Bookings count
    supabaseServer
      .from("bookings")
      .select("*", { count: "exact", head: true }),

    // 2. Distinct clients — query users table directly with role=client
    supabaseServer
      .from("users")
      .select("id")
      .eq("role", "client"),

    // 3. Approved bookings total_price for total revenue
    supabaseServer
      .from("bookings")
      .select("total_price")
      .eq("status", "approved"),

    // 4. All service_ids for popular service calculation
    supabaseServer
      .from("bookings")
      .select("service_id")
      .not("service_id", "is", null),

    // 5. Approved bookings for monthly revenue chart
    supabaseServer
      .from("bookings")
      .select("total_price, start_datetime")
      .eq("status", "approved")
      .gte("start_datetime", `${currentYear}-01-01`)
      .lte("start_datetime", `${currentYear}-12-31`),

    // 6. Booking start_datetimes for weekly chart
    supabaseServer
      .from("bookings")
      .select("start_datetime")
      .not("start_datetime", "is", null),

    // 7. Service breakdown with FK join — only rows with a valid service
    supabaseServer
      .from("bookings")
      .select("service_id, services(name)")
      .not("service_id", "is", null),
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
  // 2. Total Clients — count directly from users table
  // -------------------------
  const totalClients = clientRows?.length ?? 0

  // -------------------------
  // 3. Total Revenue
  // -------------------------
  const totalRevenue = approvedBookings
    ? approvedBookings.reduce((sum, row) => sum + Number(row.total_price ?? 0), 0)
    : 0

  // -------------------------
  // 4. Popular Service
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

  if (monthlyBookings) {
    for (const row of monthlyBookings) {
      const month = new Date(row.start_datetime).getMonth()
      revenueByMonth[month] += Number(row.total_price ?? 0)
    }
  }

  const monthlyRevenue = MONTH_LABELS.map((month, i) => ({
    month,
    revenue: revenueByMonth[i],
  }))

  // -------------------------
  // 6. Weekly Bookings — simple raw count per day of week
  // -------------------------
  const dayCount: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }

  if (allBookingDates) {
    for (const row of allBookingDates) {
      if (!row.start_datetime) continue
      const dow = new Date(row.start_datetime).getDay() // 0=Sun, 6=Sat
      dayCount[dow] += 1
    }
  }

  // DAY_LABELS index matches dow (0=Sun ... 6=Sat)
  const weeklyBookings = DAY_LABELS.map((day, dow) => ({
    day,
    bookings: dayCount[dow],
  }))

  // -------------------------
  // 7. Service Breakdown
  // -------------------------
  const serviceBookingCount: Record<string, number> = {}

  if (breakdownRows) {
    for (const row of breakdownRows) {
      const name = (row.services as any)?.name
      if (!name) continue // skip rows where FK join returned null
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