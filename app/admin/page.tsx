"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  Calendar, Users, ChevronLeft, ChevronRight, Clock,
  DollarSign, Sparkles, Ban, ToggleLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Appointment {
  id: string
  client: string
  service: string
  time: string
  duration: string
  status: "confirmed" | "pending" | "in-progress"
}

const mockAppointments: Record<string, Appointment[]> = {
  "2026-05-15": [
    { id: "1", client: "Sarah Johnson", service: "Portrait Photography", time: "9:00 AM", duration: "2 hours", status: "confirmed" },
    { id: "2", client: "Mike Chen", service: "Fashion Shoot", time: "11:30 AM", duration: "3 hours", status: "confirmed" },
    { id: "3", client: "Emily Davis", service: "Makeup Services", time: "3:00 PM", duration: "1 hour", status: "pending" },
  ],
  "2026-05-16": [
    { id: "4", client: "Alex Thompson", service: "Studio Rental", time: "10:00 AM", duration: "4 hours", status: "confirmed" },
    { id: "5", client: "Jessica Lee", service: "Product Photography", time: "2:00 PM", duration: "2 hours", status: "confirmed" },
  ],
  "2026-05-17": [
    { id: "6", client: "David Wilson", service: "Portrait Photography", time: "9:00 AM", duration: "1 hour", status: "confirmed" },
  ],
  "2026-05-18": [],
  "2026-05-19": [
    { id: "7", client: "Amanda Brown", service: "Bridal Makeup", time: "8:00 AM", duration: "2 hours", status: "confirmed" },
    { id: "8", client: "Chris Martin", service: "Fashion Shoot", time: "11:00 AM", duration: "4 hours", status: "pending" },
    { id: "9", client: "Lisa Wang", service: "Portrait Photography", time: "4:00 PM", duration: "1 hour", status: "confirmed" },
  ],
}

// ✅ All available time slots
const ALL_TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
]

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

function generateCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDay = firstDay.getDay()
  const days: (number | null)[] = []
  for (let i = 0; i < startingDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)
  return days
}

function getDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

const statusColors = {
  confirmed: "bg-green-50 text-green-700 border-green-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  "in-progress": "bg-[#C8A96A]/10 text-[#C8A96A] border-[#C8A96A]/20",
}

const statusBarColors = {
  confirmed: "bg-green-500",
  pending: "bg-amber-500",
  "in-progress": "bg-[#C8A96A]",
}

export default function AdminDashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 15))
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 4, 15))

  // ✅ Blocking state
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [blockedSlots, setBlockedSlots] = useState<Record<string, string[]>>({})

  // ✅ Panel toggle: "appointments" | "availability"
  const [panel, setPanel] = useState<"appointments" | "availability">("appointments")

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const calendarDays = generateCalendarDays(year, month)

  const selectedDateKey = getDateKey(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate()
  )
  const selectedAppointments = mockAppointments[selectedDateKey] || []

  const isFullyBlocked = blockedDates.includes(selectedDateKey)
  const slotsBlockedForDate = blockedSlots[selectedDateKey] || []
  const isPartiallyBlocked = !isFullyBlocked && slotsBlockedForDate.length > 0

  // ✅ Toggle full-day block
  const toggleFullDayBlock = () => {
    setBlockedDates(prev =>
      prev.includes(selectedDateKey)
        ? prev.filter(d => d !== selectedDateKey)
        : [...prev, selectedDateKey]
    )
    // Clear slot blocks when toggling full day
    setBlockedSlots(prev => {
      const next = { ...prev }
      delete next[selectedDateKey]
      return next
    })
  }

  // ✅ Toggle a single time slot
  const toggleSlot = (slot: string) => {
    setBlockedSlots(prev => {
      const current = prev[selectedDateKey] || []
      const updated = current.includes(slot)
        ? current.filter(s => s !== slot)
        : [...current, slot]
      return { ...prev, [selectedDateKey]: updated }
    })
  }

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const handleDateSelect = (day: number) => {
    setSelectedDate(new Date(year, month, day))
    setPanel("appointments")
  }

  const isSelectedDate = (day: number) =>
    selectedDate.getDate() === day &&
    selectedDate.getMonth() === month &&
    selectedDate.getFullYear() === year

  const hasAppointments = (day: number) => {
    const dateKey = getDateKey(year, month, day)
    return (mockAppointments[dateKey] || []).length > 0
  }

  // ✅ Blocking indicators per calendar day
  const getDayBlockStatus = (day: number): "full" | "partial" | null => {
    const dateKey = getDateKey(year, month, day)
    if (blockedDates.includes(dateKey)) return "full"
    if ((blockedSlots[dateKey] || []).length > 0) return "partial"
    return null
  }

  const totalBookingsThisMonth = Object.values(mockAppointments).flat().length
  const totalRevenueThisMonth = 4250
  const totalClients = 156

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
        {/* Calendar Section */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardDescription className="text-muted-foreground">Monthly Bookings</CardDescription>
                <div className="w-10 h-10 rounded-xl bg-[#C8A96A]/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-[#C8A96A]" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-4xl font-serif text-[#1a1a1a]">{totalBookingsThisMonth}</CardTitle>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardDescription className="text-muted-foreground">Monthly Revenue</CardDescription>
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-4xl font-serif text-[#1a1a1a]">₱{totalRevenueThisMonth.toLocaleString()}</CardTitle>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardDescription className="text-muted-foreground">Total Clients</CardDescription>
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-4xl font-serif text-[#1a1a1a]">{totalClients}</CardTitle>
              </CardContent>
            </Card>
          </div>

          {/* Calendar */}
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="hover:bg-[#C8A96A]/10 hover:text-[#C8A96A]">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <CardTitle className="text-xl font-serif text-[#1a1a1a]">
                  {months[month]} {year}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={handleNextMonth} className="hover:bg-[#C8A96A]/10 hover:text-[#C8A96A]">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-3">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  if (day === null) return <div key={`empty-${index}`} className="aspect-square" />

                  const isSelected = isSelectedDate(day)
                  const hasAppts = hasAppointments(day)
                  const blockStatus = getDayBlockStatus(day)

                  return (
                    <button
                      key={day}
                      onClick={() => handleDateSelect(day)}
                      className={`
                        aspect-square rounded-xl text-sm font-medium transition-all relative flex flex-col items-center justify-center gap-0.5
                        ${isSelected
                          ? "bg-[#C8A96A] text-white shadow-md"
                          : blockStatus === "full"
                            ? "bg-red-50 text-red-400"
                            : blockStatus === "partial"
                              ? "bg-orange-50 text-orange-500"
                              : "hover:bg-gray-50 text-[#1a1a1a]"
                        }
                      `}
                    >
                      {day}

                      {/* ✅ dot indicators */}
                      <span className="flex gap-0.5">
                        {hasAppts && !isSelected && (
                          <span className="w-1 h-1 rounded-full bg-[#C8A96A]" />
                        )}
                        {blockStatus === "full" && !isSelected && (
                          <span className="w-1 h-1 rounded-full bg-red-400" />
                        )}
                        {blockStatus === "partial" && !isSelected && (
                          <span className="w-1 h-1 rounded-full bg-orange-400" />
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* ✅ Legend */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#C8A96A]" /> Has bookings</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" /> Closed</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-400" /> Partial</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-[400px] border-t lg:border-t-0 lg:border-l border-gray-100 bg-white p-6 md:p-8 overflow-y-auto">

          {/* Date heading */}
          <div className="mb-5">
            <h2 className="font-serif text-2xl font-semibold text-[#1a1a1a]">
              {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedAppointments.length} appointment{selectedAppointments.length !== 1 ? "s" : ""}
              {isFullyBlocked && <span className="ml-2 text-red-500 font-medium">· Closed</span>}
              {isPartiallyBlocked && <span className="ml-2 text-orange-500 font-medium">· Partial block</span>}
            </p>
          </div>

          {/* ✅ Tab toggle */}
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

          {/* APPOINTMENTS TAB */}
          {panel === "appointments" && (
            <>
              {selectedAppointments.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-[#C8A96A]/30" />
                  <p>No appointments scheduled</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedAppointments.map((appointment) => (
                    <Card key={appointment.id} className="overflow-hidden border-gray-100 shadow-sm">
                      <div className={`h-1 ${statusBarColors[appointment.status]}`} />
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium text-[#1a1a1a]">{appointment.client}</p>
                            <p className="text-sm text-muted-foreground">{appointment.service}</p>
                          </div>
                          <Badge variant="outline" className={`${statusColors[appointment.status]} capitalize font-medium`}>
                            {appointment.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-[#C8A96A]" />
                            {appointment.time}
                          </div>
                          <span className="text-gray-300">|</span>
                          <span>{appointment.duration}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ✅ AVAILABILITY TAB */}
          {panel === "availability" && (
            <div className="space-y-5">

              {/* Full-day block toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
                <div>
                  <p className="font-medium text-[#1a1a1a] text-sm">Block entire day</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Mark this date as fully unavailable</p>
                </div>
                <button
                  onClick={toggleFullDayBlock}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isFullyBlocked
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  <Ban className="h-4 w-4" />
                  {isFullyBlocked ? "Unblock" : "Block"}
                </button>
              </div>

              {/* Time slots — disabled when full day is blocked */}
              <div>
                <p className="text-sm font-medium text-[#1a1a1a] mb-3">
                  Time Slots
                  {isFullyBlocked && <span className="ml-2 text-xs text-red-400 font-normal">(day fully blocked)</span>}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_TIME_SLOTS.map(slot => {
                    const isBlocked = slotsBlockedForDate.includes(slot)
                    return (
                      <button
                        key={slot}
                        onClick={() => !isFullyBlocked && toggleSlot(slot)}
                        disabled={isFullyBlocked}
                        className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors text-left
                          ${isFullyBlocked
                            ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                            : isBlocked
                              ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                              : "bg-white text-[#1a1a1a] border-gray-200 hover:bg-gray-50"
                          }`}
                      >
                        <span className="flex items-center justify-between">
                          {slot}
                          {isBlocked && !isFullyBlocked && (
                            <span className="text-xs text-red-400">Blocked</span>
                          )}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}