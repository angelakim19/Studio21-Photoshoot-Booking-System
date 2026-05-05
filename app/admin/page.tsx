"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Calendar, ChevronLeft, ChevronRight, Clock,
  Sparkles, Ban, ToggleLeft, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabaseClient"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Appointment {
  id: string
  client: string
  service: string
  time: string
  duration: string
  status: "approved" | "pending" | "cancelled"
  totalPrice: number
}

interface BlockedDate {
  id: string
  blocked_date: string  // "YYYY-MM-DD"
  reason: string | null
}

interface Stats {
  monthlyBookings: number
  monthlyRevenue: number
  totalClients: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function generateCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)
  const days: (number | null)[] = []
  for (let i = 0; i < firstDay.getDay(); i++) days.push(null)
  for (let i = 1; i <= lastDay.getDate(); i++) days.push(i)
  return days
}

function getDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function formatTime(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

function calcDuration(start: string | null, end: string | null): string {
  if (!start || !end) return "—"
  const mins = (new Date(end).getTime() - new Date(start).getTime()) / 60000
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h && m) return `${h}h ${m}m`
  if (h) return `${h} hour${h > 1 ? "s" : ""}`
  return `${m} min`
}

function monthRange(y: number, m: number) {
  const lastDay = new Date(y, m + 1, 0).getDate()
  const mm = String(m + 1).padStart(2, "0")
  return {
    start: `${y}-${mm}-01`,
    end:   `${y}-${mm}-${String(lastDay).padStart(2, "0")}`,
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  approved:  "bg-green-50 text-green-700 border-green-200",
  pending:   "bg-amber-50 text-amber-700 border-amber-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
}

const statusBarColors: Record<string, string> = {
  approved:  "bg-green-500",
  pending:   "bg-amber-500",
  cancelled: "bg-gray-300",
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [currentDate,  setCurrentDate]  = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const [appointmentsByDate, setAppointmentsByDate] = useState<Record<string, Appointment[]>>({})
  const [blockedDates,       setBlockedDates]       = useState<Record<string, BlockedDate>>({})
  const [stats,              setStats]              = useState<Stats>({ monthlyBookings: 0, monthlyRevenue: 0, totalClients: 0 })

  const [panel,        setPanel]       = useState<"appointments" | "availability">("appointments")
  const [blockReason,  setBlockReason] = useState("")
  const [loading,      setLoading]     = useState(true)
  const [blockLoading, setBlockLoading] = useState(false)

  const year         = currentDate.getFullYear()
  const month        = currentDate.getMonth()
  const calendarDays = generateCalendarDays(year, month)

  const selectedDateKey      = getDateKey(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
  const selectedAppointments = appointmentsByDate[selectedDateKey] || []
  const isFullyBlocked       = selectedDateKey in blockedDates
  const currentBlockReason   = blockedDates[selectedDateKey]?.reason ?? ""

  // ── Fetch bookings ─────────────────────────────────────────────────────────

  const fetchBookings = useCallback(async (y: number, m: number) => {
    setLoading(true)
    const { start, end } = monthRange(y, m)

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        start_datetime,
        end_datetime,
        status,
        total_price,
        package_name_snapshot,
        users   ( first_name, last_name ),
        services ( name )
      `)
      .gte("start_datetime", `${start}T00:00:00`)
      .lte("start_datetime", `${end}T23:59:59`)
      .neq("status", "cancelled")

    if (error) {
      console.error("fetchBookings:", error.message)
      setLoading(false)
      return
    }

    const grouped: Record<string, Appointment[]> = {}

    for (const row of data ?? []) {
      const dateKey = row.start_datetime?.slice(0, 10)
      if (!dateKey) continue

      const user = Array.isArray(row.users)    ? row.users[0]    : row.users
      const svc  = Array.isArray(row.services) ? row.services[0] : row.services

      const appt: Appointment = {
        id:         String(row.id),
        client:     user ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() : "Unknown",
        service:    row.package_name_snapshot ?? svc?.name ?? "—",
        time:       formatTime(row.start_datetime),
        duration:   calcDuration(row.start_datetime, row.end_datetime),
        status:     (row.status as Appointment["status"]) ?? "pending",
        totalPrice: row.total_price ?? 0,
      }

      if (!grouped[dateKey]) grouped[dateKey] = []
      grouped[dateKey].push(appt)
    }

    setAppointmentsByDate(grouped)
    setLoading(false)
  }, [])

  // ── Fetch blocked dates ────────────────────────────────────────────────────

  const fetchBlockedDates = useCallback(async (y: number, m: number) => {
    const { start, end } = monthRange(y, m)

    const { data, error } = await supabase
      .from("admin_blocked_dates")
      .select("id, blocked_date, reason")
      .gte("blocked_date", start)
      .lte("blocked_date", end)

    if (error) { console.error("fetchBlockedDates:", error.message); return }

    const map: Record<string, BlockedDate> = {}
    for (const row of data ?? []) map[row.blocked_date] = row
    setBlockedDates(map)
  }, [])

  // ── Fetch stats ────────────────────────────────────────────────────────────

  const fetchStats = useCallback(async (y: number, m: number) => {
    const { start, end } = monthRange(y, m)

    const { data: bookingData } = await supabase
      .from("bookings")
      .select("total_price")
      .gte("start_datetime", `${start}T00:00:00`)
      .lte("start_datetime", `${end}T23:59:59`)
      .neq("status", "cancelled")

    const monthlyBookings = bookingData?.length ?? 0
    const monthlyRevenue  = bookingData?.reduce((s, b) => s + (b.total_price ?? 0), 0) ?? 0

    const { count } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role", "client")

    setStats({ monthlyBookings, monthlyRevenue, totalClients: count ?? 0 })
  }, [])

  // ── Run on mount + month navigation ───────────────────────────────────────

  useEffect(() => {
    fetchBookings(year, month)
    fetchBlockedDates(year, month)
    fetchStats(year, month)
  }, [year, month, fetchBookings, fetchBlockedDates, fetchStats])

  // ── Block / Unblock ───────────────────────────────────────────────────────

  const blockDay = async () => {
    if (!blockReason.trim()) return
    setBlockLoading(true)

    const { data, error } = await supabase
      .from("admin_blocked_dates")
      .insert({ blocked_date: selectedDateKey, reason: blockReason.trim() })
      .select("id, blocked_date, reason")
      .single()

    if (error) console.error("blockDay:", error.message)
    else if (data) setBlockedDates(prev => ({ ...prev, [selectedDateKey]: data }))

    setBlockReason("")
    setBlockLoading(false)
  }

  const unblockDay = async () => {
    const row = blockedDates[selectedDateKey]
    if (!row) return
    setBlockLoading(true)

    const { error } = await supabase
      .from("admin_blocked_dates")
      .delete()
      .eq("id", row.id)

    if (error) console.error("unblockDay:", error.message)
    else setBlockedDates(prev => { const n = { ...prev }; delete n[selectedDateKey]; return n })

    setBlockLoading(false)
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const handleDateSelect = (day: number) => {
    setSelectedDate(new Date(year, month, day))
    setPanel("appointments")
    setBlockReason("")
  }

  const isSelectedDate  = (day: number) =>
    selectedDate.getDate() === day &&
    selectedDate.getMonth() === month &&
    selectedDate.getFullYear() === year

  const hasAppointments = (day: number) =>
    (appointmentsByDate[getDateKey(year, month, day)] || []).length > 0

  const isBlocked = (day: number) =>
    getDateKey(year, month, day) in blockedDates

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      {/* Mobile Header */}
      <header className="md:hidden border-b border-gray-100 bg-white p-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/favicon.png" alt="Studio 21 Logo" width={45} height={45} className="rounded-full" />
            <span className="font-serif text-lg font-semibold text-[#1a1a1a]">Studio 21</span>
          </Link>
          <Badge className="bg-[#C8A96A] text-white">Admin</Badge>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* ── Left: Stats + Calendar ───────────────────────────────── */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto">

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardDescription className="text-muted-foreground">Monthly Bookings</CardDescription>
                <div className="w-10 h-10 rounded-xl bg-[#C8A96A]/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-[#C8A96A]" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-4xl font-serif text-[#1a1a1a]">
                  {loading
                    ? <Loader2 className="h-7 w-7 animate-spin text-[#C8A96A]" />
                    : stats.monthlyBookings}
                </CardTitle>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardDescription className="text-muted-foreground">Monthly Revenue</CardDescription>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">₱</span>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-4xl font-serif text-[#1a1a1a]">
                  {loading
                    ? <Loader2 className="h-7 w-7 animate-spin text-[#C8A96A]" />
                    : `₱${stats.monthlyRevenue.toLocaleString()}`}
                </CardTitle>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardDescription className="text-muted-foreground">Total Clients</CardDescription>
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <span className="text-blue-500 font-bold text-lg">👤</span>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-4xl font-serif text-[#1a1a1a]">
                  {loading
                    ? <Loader2 className="h-7 w-7 animate-spin text-[#C8A96A]" />
                    : stats.totalClients}
                </CardTitle>
              </CardContent>
            </Card>

          </div>

          {/* Calendar */}
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-serif text-xl text-[#1a1a1a]">
                  {months[month]} {year}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 mb-2">
                {daysOfWeek.map(d => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  if (day === null) return <div key={`empty-${index}`} className="aspect-square" />

                  const isSelected = isSelectedDate(day)
                  const hasAppts   = hasAppointments(day)
                  const blocked    = isBlocked(day)

                  return (
                    <button
                      key={day}
                      onClick={() => handleDateSelect(day)}
                      className={`
                        aspect-square rounded-xl text-sm font-medium transition-all
                        flex flex-col items-center justify-center gap-0.5
                        ${isSelected
                          ? "bg-[#C8A96A] text-white shadow-md"
                          : blocked
                            ? "bg-red-50 text-red-400"
                            : "hover:bg-gray-50 text-[#1a1a1a]"
                        }
                      `}
                    >
                      {day}
                      <span className="flex gap-0.5">
                        {hasAppts && !isSelected && <span className="w-1 h-1 rounded-full bg-[#C8A96A]" />}
                        {blocked  && !isSelected && <span className="w-1 h-1 rounded-full bg-red-400" />}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#C8A96A]" /> Has bookings
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400" /> Closed
                </span>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* ── Right Panel ──────────────────────────────────────────── */}
        <div className="w-full lg:w-[400px] border-t lg:border-t-0 lg:border-l border-gray-100 bg-white p-6 md:p-8 overflow-y-auto">

          {/* Date heading */}
          <div className="mb-5">
            <h2 className="font-serif text-2xl font-semibold text-[#1a1a1a]">
              {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedAppointments.length} appointment{selectedAppointments.length !== 1 ? "s" : ""}
              {isFullyBlocked && <span className="ml-2 text-red-500 font-medium">· Closed</span>}
            </p>
          </div>

          {/* Tab toggle */}
          <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-6 text-sm font-medium">
            <button
              onClick={() => setPanel("appointments")}
              className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition-colors
                ${panel === "appointments" ? "bg-[#C8A96A] text-white" : "text-muted-foreground hover:bg-gray-50"}`}
            >
              <Clock className="h-4 w-4" /> Appointments
            </button>
            <button
              onClick={() => setPanel("availability")}
              className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition-colors
                ${panel === "availability" ? "bg-[#C8A96A] text-white" : "text-muted-foreground hover:bg-gray-50"}`}
            >
              <ToggleLeft className="h-4 w-4" /> Availability
            </button>
          </div>

          {/* ── APPOINTMENTS TAB ── */}
          {panel === "appointments" && (
            <>
              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-[#C8A96A]" />
                </div>
              ) : selectedAppointments.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-[#C8A96A]/30" />
                  <p>No appointments scheduled</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedAppointments.map((appt) => (
                    <Card key={appt.id} className="overflow-hidden border-gray-100 shadow-sm">
                      <div className={`h-1 ${statusBarColors[appt.status] ?? "bg-gray-200"}`} />
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium text-[#1a1a1a]">{appt.client}</p>
                            <p className="text-sm text-muted-foreground">{appt.service}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`${statusColors[appt.status] ?? ""} capitalize font-medium`}
                          >
                            {appt.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-[#C8A96A]" />
                            {appt.time}
                          </div>
                          <span className="text-gray-300">|</span>
                          <span>{appt.duration}</span>
                          <span className="text-gray-300">|</span>
                          <span className="text-[#C8A96A] font-medium">
                            ₱{appt.totalPrice.toLocaleString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── AVAILABILITY TAB ── */}
          {panel === "availability" && (
            <div className="space-y-5">
              {isFullyBlocked ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-red-700">
                    <Ban className="h-4 w-4 shrink-0" />
                    <p className="font-medium text-sm">This day is blocked</p>
                  </div>
                  {currentBlockReason && (
                    <p className="text-sm text-red-600 bg-red-100 rounded-lg px-3 py-2">
                      <span className="font-medium">Reason: </span>{currentBlockReason}
                    </p>
                  )}
                  <button
                    onClick={unblockDay}
                    disabled={blockLoading}
                    className="w-full py-2 rounded-lg text-sm font-medium bg-white border border-red-200 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {blockLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Unblock this day
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 p-4 space-y-4">
                  <div>
                    <p className="font-medium text-[#1a1a1a] text-sm">Block entire day</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Mark this date as fully unavailable for bookings
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#1a1a1a]">
                      Reason <span className="text-muted-foreground font-normal">(required)</span>
                    </label>
                    <textarea
                      value={blockReason}
                      onChange={e => setBlockReason(e.target.value)}
                      placeholder="e.g. Holiday, Studio maintenance, Personal day…"
                      rows={3}
                      className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#C8A96A]/40 focus:border-[#C8A96A] placeholder:text-gray-300"
                    />
                  </div>
                  <button
                    onClick={blockDay}
                    disabled={!blockReason.trim() || blockLoading}
                    className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors
                      ${blockReason.trim() && !blockLoading
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                  >
                    {blockLoading
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Ban className="h-4 w-4" />
                    }
                    Block this day
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
