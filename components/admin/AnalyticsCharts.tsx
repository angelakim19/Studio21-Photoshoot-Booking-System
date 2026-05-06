// components/admin/AnalyticsCharts.tsx

"use client"

import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts"

const PIE_COLORS = ["#C8A96A", "#1a1a1a", "#a08850", "#d4b87e", "#8a7040"]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-sm">
        <p className="font-medium text-[#1a1a1a] mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color }} className="capitalize">
            {entry.name === "revenue"
              ? `₱${entry.value.toLocaleString()}`
              : entry.value}
            {entry.name !== "revenue" ? ` ${entry.name}` : ""}
          </p>
        ))}
      </div>
    )
  }
  return null
}

type MonthlyRevenue = { month: string; revenue: number }
type WeeklyBookings = { day: string; bookings: number }
type ServiceBreakdown = { name: string; value: number }

interface AnalyticsChartsProps {
  monthlyRevenue: MonthlyRevenue[]
  weeklyBookings: WeeklyBookings[]
  serviceBreakdown: ServiceBreakdown[]
  currentYear: number
}

export default function AnalyticsCharts({
  monthlyRevenue,
  weeklyBookings,
  serviceBreakdown,
  currentYear,
}: AnalyticsChartsProps) {
  return (
    <>
      {/* Revenue Area Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <h2 className="font-serif text-lg font-semibold text-[#1a1a1a] mb-1">
          Revenue Over Time
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          Monthly revenue for {currentYear}
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart
            data={monthlyRevenue}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C8A96A" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#C8A96A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#C8A96A"
              strokeWidth={2.5}
              fill="url(#revenueGrad)"
              dot={false}
              activeDot={{ r: 5, fill: "#C8A96A" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row: Bar + Pie */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Weekly Bookings Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="font-serif text-lg font-semibold text-[#1a1a1a] mb-1">
            Weekly Bookings
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Average bookings per day of week
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={weeklyBookings}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              barSize={28}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#f9f5ee" }}
              />
              <Bar dataKey="bookings" fill="#C8A96A" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Service Breakdown Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="font-serif text-lg font-semibold text-[#1a1a1a] mb-1">
            Service Breakdown
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Bookings by service type
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={serviceBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {serviceBreakdown.map((_, i) => (
                  <Cell
                    key={i}
                    fill={PIE_COLORS[i % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span className="text-xs text-gray-600">{value}</span>
                )}
              />
              <Tooltip formatter={(value) => [`${value}%`, "Share"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>
    </>
  )
}