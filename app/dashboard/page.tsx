"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  Calendar, Clock, User, Settings, LogOut, 
  Plus, Edit2, X, ChevronDown, Search, Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

type BookingStatus = "upcoming" | "completed" | "cancelled"

interface Booking {
  id: string
  service: string
  type: string
  date: string
  time: string
  status: BookingStatus
  price: number
}

const mockBookings: Booking[] = [
  {
    id: "STD-12345678",
    service: "Professional Photoshoot",
    type: "Portrait Photography",
    date: "May 15, 2026",
    time: "10:00 AM",
    status: "upcoming",
    price: 225,
  },
  {
    id: "STD-12345679",
    service: "Makeup Services",
    type: "Glamour",
    date: "May 20, 2026",
    time: "2:00 PM",
    status: "upcoming",
    price: 100,
  },
  {
    id: "STD-12345680",
    service: "Studio Rental",
    type: "Full Equipment Access",
    date: "April 10, 2026",
    time: "9:00 AM",
    status: "completed",
    price: 400,
  },
  {
    id: "STD-12345681",
    service: "Professional Photoshoot",
    type: "Fashion & Editorial",
    date: "March 28, 2026",
    time: "1:00 PM",
    status: "cancelled",
    price: 375,
  },
]

const navItems = [
  { icon: Calendar, label: "My Bookings", active: true },
  { icon: User, label: "Profile" },
  { icon: Settings, label: "Settings" },
]

const statusColors: Record<BookingStatus, string> = {
  upcoming: "bg-[#C8A96A]/10 text-[#C8A96A] border-[#C8A96A]/20",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-gray-100 text-gray-600 border-gray-200",
}

export default function DashboardPage() {
  const [bookings, setBookings] = useState(mockBookings)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [filter, setFilter] = useState<"all" | BookingStatus>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredBookings = bookings.filter((booking) => {
    const matchesFilter = filter === "all" || booking.status === filter
    const matchesSearch = 
      booking.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleCancelBooking = () => {
    if (selectedBooking) {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === selectedBooking.id ? { ...b, status: "cancelled" as BookingStatus } : b
        )
      )
      setCancelDialogOpen(false)
      setSelectedBooking(null)
    }
  }

  const upcomingCount = bookings.filter((b) => b.status === "upcoming").length

  return (
    <div className="min-h-screen flex bg-[#F5F5F5]">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 hidden md:flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-0McGs7RZl6BZHsb6KgS3JK5SUdnNz1.png"
              alt="Studio 21 Logo"
              width={45}
              height={45}
              className="rounded-full"
            />
            <div>
              <span className="font-serif text-xl font-semibold text-[#1a1a1a]">Studio 21</span>
              <span className="block text-xs text-[#C8A96A]">Dashboard</span>
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
                      ? "bg-[#C8A96A]/10 text-[#C8A96A]" 
                      : "text-muted-foreground hover:bg-gray-50 hover:text-[#1a1a1a]"
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

        <div className="p-4 border-t border-gray-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#C8A96A]/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-[#C8A96A]" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-[#1a1a1a]">John Doe</p>
                  <p className="text-xs text-muted-foreground">john@example.com</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
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
      <main className="flex-1 flex flex-col">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 rounded-full bg-[#C8A96A]/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-[#C8A96A]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-semibold text-[#1a1a1a]">My Bookings</h1>
              <p className="text-muted-foreground mt-1">
                You have {upcomingCount} upcoming {upcomingCount === 1 ? "booking" : "bookings"}
              </p>
            </div>
            <Button asChild className="bg-[#C8A96A] hover:bg-[#B8995A] text-white">
              <Link href="/booking">
                <Plus className="mr-2 h-4 w-4" />
                New Booking
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardDescription className="text-muted-foreground">Upcoming</CardDescription>
                <CardTitle className="text-4xl font-serif text-[#C8A96A]">{bookings.filter((b) => b.status === "upcoming").length}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardDescription className="text-muted-foreground">Completed</CardDescription>
                <CardTitle className="text-4xl font-serif text-[#1a1a1a]">{bookings.filter((b) => b.status === "completed").length}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardDescription className="text-muted-foreground">Total Spent</CardDescription>
                <CardTitle className="text-4xl font-serif text-[#1a1a1a]">
                  ${bookings.filter((b) => b.status === "completed").reduce((acc, b) => acc + b.price, 0)}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 border-gray-200 bg-white focus:border-[#C8A96A] focus:ring-[#C8A96A]"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "upcoming", "completed", "cancelled"] as const).map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(status)}
                  className={`capitalize ${filter === status ? "bg-[#C8A96A] hover:bg-[#B8995A] text-white" : "border-gray-200 hover:border-[#C8A96A] hover:bg-[#C8A96A]/5"}`}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          {/* Bookings Table */}
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-[#F5F5F5]">
                      <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Booking ID</th>
                      <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Service</th>
                      <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date & Time</th>
                      <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
                      <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-muted-foreground">
                          <Sparkles className="h-8 w-8 mx-auto mb-3 text-[#C8A96A]/30" />
                          No bookings found
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((booking) => (
                        <tr key={booking.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                          <td className="p-4">
                            <span className="font-mono text-sm text-[#1a1a1a]">{booking.id}</span>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-[#1a1a1a]">{booking.service}</p>
                              <p className="text-sm text-muted-foreground">{booking.type}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5 text-sm text-[#1a1a1a]">
                                <Calendar className="h-4 w-4 text-[#C8A96A]" />
                                {booking.date}
                              </div>
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {booking.time}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className={`${statusColors[booking.status]} capitalize font-medium`}>
                              {booking.status}
                            </Badge>
                          </td>
                          <td className="p-4 font-semibold text-[#1a1a1a]">${booking.price}</td>
                          <td className="p-4 text-right">
                            {booking.status === "upcoming" && (
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="sm" className="hover:bg-[#C8A96A]/10 hover:text-[#C8A96A]">
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => {
                                    setSelectedBooking(booking)
                                    setCancelDialogOpen(true)
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="bg-[#F5F5F5] rounded-xl p-4">
              <p className="font-medium text-[#1a1a1a]">{selectedBooking.service}</p>
              <p className="text-sm text-muted-foreground">
                {selectedBooking.date} at {selectedBooking.time}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)} className="border-gray-200">
              Keep Booking
            </Button>
            <Button variant="destructive" onClick={handleCancelBooking}>
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
