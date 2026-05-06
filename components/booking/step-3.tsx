"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useBooking } from "@/lib/booking-context"
import { supabase } from "@/lib/supabaseClient"


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


function isPastDate(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

function toNumericDuration(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const raw = value.trim().toLowerCase()
    if (raw === "half-day") return 4
    if (raw === "full-day") return 8
    if (raw.endsWith("hr")) {
      const parsed = Number(raw.replace("hr", ""))
      return Number.isFinite(parsed) ? parsed : 0
    }
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

export function BookingStep3() {
  const router = useRouter()
  const { bookingData, updateBookingData, setStep } = useBooking()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [editingBookingId, setEditingBookingId] = useState<number | null>(() => {
    try {
      if (typeof window === "undefined") return null
      const raw = localStorage.getItem("bookingEditMeta")
      if (!raw) return null
      const parsed = JSON.parse(raw)
      return parsed?.bookingId ? Number(parsed.bookingId) : null
    } catch (err) {
      return null
    }
  })
  
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const calendarDays = generateCalendarDays(year, month)

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

 const handleDateSelect = (day: number) => {
  const selectedDate = new Date(year, month, day)

  if (isPastDate(selectedDate)) {
    setUnavailableModal({
      open: true,
      message: "You cannot select a past date. Please choose today or a future date.",
    })
    return
  }

  if (!isDateAvailable(selectedDate)) {
    setUnavailableModal({
      open: true,
      message: "This date is unavailable. Please choose another available date.",
    })
    return
  }

  updateBookingData({ date: selectedDate, time: "" })
}

useEffect(() => {
  const numericDuration = toNumericDuration(bookingData.duration)
  if (!bookingData.date || !numericDuration) {
    console.log("⛔ Waiting for date & duration...")
    return
  }

  console.log("✅ Fetching with:", {
    date: bookingData.date,
    duration: numericDuration
  })

  fetchAvailability(bookingData.date)

}, [bookingData.date, bookingData.duration])

  const handleTimeSelect = (raw: string) => {
    updateBookingData({ time: raw }) // ISO string
  }

  const dateToIso = (date: Date | null | undefined) => {
    if (!date) return ""
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    return localDate.toISOString().split("T")[0]
  }

  const addHours = (time: string, duration: number) => {
    const [hour, minute] = time.split(":").map(Number)
    const newHour = hour + duration
    return `${String(newHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
  }

  const handleNext = async () => {
    if (!bookingData.date || !bookingData.time) return
    const numericDuration = toNumericDuration(bookingData.duration)
    const selectedDateIso = dateToIso(bookingData.date)
    if (numericDuration > 0 && selectedDateIso) {
      try {
        const res = await fetch("/api/availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: selectedDateIso, duration: numericDuration }),
        })
        const data = await res.json()
        const stillAvailable =
          !!(res.ok && Array.isArray(data?.slots) && data.slots.includes(bookingData.time))
        if (!stillAvailable) {
          updateBookingData({ time: "" })
          setUnavailableModal({
            open: true,
            message: "That time slot was just taken. Please select another available time.",
          })
          await fetchAvailability(bookingData.date)
          return
        }
      } catch (err) {
        setUnavailableModal({
          open: true,
          message: "We could not verify availability right now. Please try again.",
        })
        return
      }
    }

    const editId = editingBookingId ?? (() => {
      try {
        if (typeof window === "undefined") return null
        const raw = localStorage.getItem("bookingEditMeta")
        if (!raw) return null
        const parsed = JSON.parse(raw)
        return parsed?.bookingId ? Number(parsed.bookingId) : null
      } catch (err) {
        return null
      }
    })()

    if (editId) {
      const date = dateToIso(bookingData.date)
      const time = bookingData.time
      const duration = bookingData.duration || 1

      const payload: Record<string, any> = {
        start_datetime: `${date} ${time}:00`,
        end_datetime: `${date} ${addHours(time, duration)}:00`,
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()
      const accessToken = session?.access_token
      if (!accessToken) return alert("You must be logged in")

      const res = await fetch("/api/bookings/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          bookingId: editId,
          updates: payload,
        }),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) return alert(json?.error || "Failed to save booking changes")

      if (typeof window !== "undefined") {
        localStorage.removeItem("bookingEditMeta")
        localStorage.removeItem("bookingDraft")
      }

      router.push("/user/schedule")
      return
    }

    setStep(4)
  }

  const isSelectedDate = (day: number) => {
    if (!bookingData.date) return false
    return (
      bookingData.date.getDate() === day &&
      bookingData.date.getMonth() === month &&
      bookingData.date.getFullYear() === year
    )
  }

  const [timeSlots, setTimeSlots] = useState<any[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [unavailableModal, setUnavailableModal] = useState({ open: false, message: "" })

 const fetchAvailability = async (selectedDate: Date) => {
  try {
    setLoadingSlots(true)

    const duration = toNumericDuration(bookingData.duration)
    console.log("duration:", duration)

    // FIX HERE
    if (!duration || duration <= 0) {
      console.warn("Invalid duration:", duration)
      setTimeSlots([])
      return
    }

    console.log("🚀 SENDING TO API:", {
      date: selectedDate,
      duration
    })

    
    // FIX TIMEZONE HERE
    const localDate = new Date(
      selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000
    )
      .toISOString()
      .split("T")[0]

    const res = await fetch("/api/availability", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: localDate, // use this instead
        duration
      })
    })

    const data = await res.json()
    if (!res.ok || !Array.isArray(data?.slots)) {
      setTimeSlots([])
      return
    }

    const formatted = data.slots.map((slot: string) => {
      const start = new Date(`1970-01-01T${slot}:00`)

      const end = new Date(start.getTime() + duration * 60 * 60 * 1000)

      const formatTime = (d: Date) =>
        d.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true
        })

      return {
        time: `${formatTime(start)} → ${formatTime(end)}`,
        raw: slot
      }
    })

    setTimeSlots(formatted)

  } catch (err) {
    console.error(err)
  } finally {
    setLoadingSlots(false)
  }
}
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [loadingBlocked, setLoadingBlocked] = useState(true)
   const isDateAvailable = (date: Date): boolean => {
      const localDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split("T")[0]

      return !blockedDates.includes(localDate)
    }

  useEffect(() => {
    const fetchBlockedDates = async () => {
      try {
        const res = await fetch("/api/availability/blocked-dates")
        const data = await res.json()

        console.log("🚫 BLOCKED DATES:", data)

        setBlockedDates(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingBlocked(false)
      }
    }

    fetchBlockedDates()
  }, [])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <span className="text-[#C8A96A] text-sm font-medium uppercase tracking-wider">Step 3 of 4</span>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold mt-2 mb-3 text-[#1a1a1a]">
          Select Date & Time
        </h1>
        <p className="text-muted-foreground">
          Choose your preferred appointment slot
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Calendar */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="hover:bg-[#C8A96A]/10 hover:text-[#C8A96A]">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <CardTitle className="text-lg font-serif text-[#1a1a1a]">
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
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="aspect-square" />
                }
                
                const date = new Date(year, month, day)
                const isPast = isPastDate(date)
                const isAvailable = isDateAvailable(date)
                const isSelected = isSelectedDate(day)
                
                return (
                  <button
                    key={day}
                    onClick={() => handleDateSelect(day)}
                    className={`
                      aspect-square rounded-lg text-sm font-medium transition-all
                      ${isSelected 
                        ? "bg-[#C8A96A] text-white shadow-md" 
                        : isPast || !isAvailable
                          ? "text-gray-300 cursor-not-allowed"
                          : "hover:bg-[#C8A96A]/10 text-[#1a1a1a] hover:text-[#C8A96A]"
                      }
                    `}
                  >
                    {day}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-100 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#C8A96A]" />
                <span className="text-muted-foreground">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-black" />
                <span className="text-muted-foreground">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-100" />
                <span className="text-muted-foreground">Unavailable</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-[#1a1a1a]">
              {bookingData.date 
                ? `Available Start Times`
                : "Select a Date First"
              }
            </CardTitle>
            {bookingData.date && (
              <p className="text-sm text-muted-foreground">
                {bookingData.date.toLocaleDateString("en-US", { 
                  weekday: "long", 
                  month: "long", 
                  day: "numeric" 
                })}
              </p>
            )}
          </CardHeader>
          <CardContent>
            {bookingData.date ? (
              <div className="grid grid-cols-2 gap-3">
                {loadingSlots ? (
                    <p className="text-sm text-muted-foreground">Loading available times...</p>
                  ) : timeSlots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No available slots</p>
                  ) : (
                    timeSlots.map((slot) => (
                      <button
                        key={slot.raw}
                        onClick={() => handleTimeSelect(slot.raw)}
                        className={`
                          py-3 px-4 rounded-xl text-sm font-medium transition-all border-2
                          ${bookingData.time === slot.raw
                            ? "bg-[#C8A96A] text-white border-[#C8A96A] shadow-md"
                            : "bg-white hover:bg-[#C8A96A]/5 border-gray-100 hover:border-[#C8A96A] text-[#1a1a1a]"
                          }
                        `}
                      >
                        {slot.time}
                      </button>
                    ))
                  )}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <p>Please select a date from the calendar to view available time slots.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between mt-10">
        <Button variant="outline" size="lg" onClick={() => setStep(2)} className="border-gray-200 hover:border-[#C8A96A] hover:bg-[#C8A96A]/5 h-12 px-6">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </Button>
        <Button 
          size="lg" 
          onClick={handleNext}
          disabled={!bookingData.date || !bookingData.time}
          className="bg-[#C8A96A] hover:bg-[#B8995A] text-white px-8 h-12"
        >
          {editingBookingId ? "Save changes" : "Continue"}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
      <Dialog
        open={unavailableModal.open}
        onOpenChange={(open) => !open && setUnavailableModal({ open: false, message: "" })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unavailable Selection</DialogTitle>
            <DialogDescription>{unavailableModal.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setUnavailableModal({ open: false, message: "" })}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
