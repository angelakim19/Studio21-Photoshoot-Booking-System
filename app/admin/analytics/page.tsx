// app/admin/analytics/page.tsx

import { getAnalyticsData } from "../../../lib/analytics-data"
import AnalyticsCharts from "@/components/admin/AnalyticsCharts"

export default async function AnalyticsPage() {
  const { stats, monthlyRevenue, weeklyBookings, serviceBreakdown } =
    await getAnalyticsData()

  const currentYear = new Date().getFullYear()

  return (
    <div>
      <p className="text-sm uppercase tracking-[0.28em] text-[#8f7a53]">Service</p>
      <h1 className="font-serif text-4xl mb-6 font-semibold text-[#111111]">Analytics</h1>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <p className="text-gray-500 text-sm">Total Bookings</p>
          <p className="text-2xl font-semibold">{stats.totalBookings}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <p className="text-gray-500 text-sm">Clients</p>
          <p className="text-2xl font-semibold">{stats.totalClients}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <p className="text-gray-500 text-sm">Revenue</p>
          <p className="text-2xl font-semibold">
            ₱{stats.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <p className="text-gray-500 text-sm">Popular</p>
          <p className="text-2xl font-semibold">{stats.popularService}</p>
        </div>
      </div>

      {/* Charts (client component) */}
      <AnalyticsCharts
        monthlyRevenue={monthlyRevenue}
        weeklyBookings={weeklyBookings}
        serviceBreakdown={serviceBreakdown}
        currentYear={currentYear}
      />
    </div>
  )
}