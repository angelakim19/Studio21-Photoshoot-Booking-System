"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  Calendar, Users, BarChart3, Settings, LogOut,
  ChevronLeft, ChevronRight, Clock, User, DollarSign, Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

const navItems = [
  { icon: Calendar, label: "Calendar", active: true },
  { icon: Users, label: "Clients" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Settings, label: "Settings" },
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
  
  for (let i = 0; i < startingDay; i++) {
    days.push(null)
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }
  
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
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 15)) // May 15, 2026
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 4, 15))
  
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const calendarDays = generateCalendarDays(year, month)
  
  const selectedDateKey = getDateKey(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate()
  )
  const selectedAppointments = mockAppointments[selectedDateKey] || []

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleDateSelect = (day: number) => {
    setSelectedDate(new Date(year, month, day))
  }

  const isSelectedDate = (day: number) => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    )
  }

  const hasAppointments = (day: number) => {
    const dateKey = getDateKey(year, month, day)
    return (mockAppointments[dateKey] || []).length > 0
  }

  // Stats
  const totalBookingsThisMonth = Object.values(mockAppointments).flat().length
  const totalRevenueThisMonth = 4250 // Mock value
  const totalClients = 156 // Mock value

  return (
    <div className="min-h-screen flex bg-[#F5F5F5]">
      {/* Sidebar */}
      <aside className="w-72 bg-[#1a1a1a] text-white hidden md:flex flex-col">
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-0McGs7RZl6BZHsb6KgS3JK5SUdnNz1.png"
              alt="Studio 21 Logo"
              width={45}
              height={45}
              className="rounded-full bg-white p-1"
            />
            <div>
              <span className="font-serif text-xl font-semibold">Studio 21</span>
              <span className="block text-xs text-[#C8A96A]">Admin Dashboard</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.label}>
                <button
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${item.active 
                      ? "bg-[#C8A96A] text-white" 
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                    }
                  `}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-white/10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#C8A96A]/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-[#C8A96A]" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">Admin User</p>
                  <p className="text-xs text-white/50">admin@studio21.com</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden border-b border-gray-100 bg-white p-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-0McGs7RZl6BZHsb6KgS3JK5SUdnNz1.png"
                alt="Studio 21 Logo"
                width={36}
                height={36}
                className="rounded-full"
              />
              <span className="font-serif text-lg font-semibold text-[#1a1a1a]">Studio 21</span>
            </Link>
            <Badge className="bg-[#C8A96A] text-white">Admin</Badge>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
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
                  <CardTitle className="text-4xl font-serif text-[#1a1a1a]">${totalRevenueThisMonth.toLocaleString()}</CardTitle>
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
                    if (day === null) {
                      return <div key={`empty-${index}`} className="aspect-square" />
                    }
                    
                    const isSelected = isSelectedDate(day)
                    const hasAppts = hasAppointments(day)
                    
                    return (
                      <button
                        key={day}
                        onClick={() => handleDateSelect(day)}
                        className={`
                          aspect-square rounded-xl text-sm font-medium transition-all relative
                          ${isSelected 
                            ? "bg-[#C8A96A] text-white shadow-md" 
                            : "hover:bg-gray-50 text-[#1a1a1a]"
                          }
                        `}
                      >
                        {day}
                        {hasAppts && !isSelected && (
                          <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#C8A96A]" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Appointments Panel */}
          <div className="w-full lg:w-[400px] border-t lg:border-t-0 lg:border-l border-gray-100 bg-white p-6 md:p-8 overflow-y-auto">
            <div className="mb-6">
              <h2 className="font-serif text-2xl font-semibold text-[#1a1a1a]">
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedAppointments.length} appointment{selectedAppointments.length !== 1 ? "s" : ""}
              </p>
            </div>

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
          </div>
        </div>
      </main>
    </div>
  )
}
