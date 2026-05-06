"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { normalizeBookingStatus } from "@/lib/booking-status"

export default function SchedulePage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [editingBooking, setEditingBooking] = useState<any | null>(null)
  const [editStep, setEditStep] = useState(1)
  const [editDraft, setEditDraft] = useState({
    serviceType: "photoshoot",
    service: "",
    date: "",
    startTime: "",
    endTime: "",
  })

  const serviceTypeOptions = [
    { value: "photoshoot", label: "Photoshoot Packages" },
    { value: "makeup", label: "Makeup Services" },
    { value: "studio-rental", label: "Studio Rental" },
  ]

  const getBusinessHours = (dateIso: string) => {
    const d = new Date(dateIso)
    const day = d.getDay() // 0 = Sunday
    if (day === 0) return { start: 7, end: 23 }
    return { start: 8, end: 23 }
  }

  const toHourDuration = (booking: any) => {
    const startRaw = booking?.start_datetime
    const endRaw = booking?.end_datetime
    if (!startRaw || !endRaw) return 1
    const start = new Date(String(startRaw).replace(" ", "T"))
    const end = new Date(String(endRaw).replace(" ", "T"))
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1
    const hours = Math.round((end.getTime() - start.getTime()) / (60 * 60 * 1000))
    return hours > 0 ? hours : 1
  }

  const formatTimeLabel = (value: string) =>
    new Date(`1970-01-01T${value}:00`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })

  const parseDurationHoursFromServiceLabel = (label: string | undefined | null) => {
    const raw = (label || "").toLowerCase()
    if (!raw) return null
    if (raw.startsWith("1 hour")) return 1
    if (raw.startsWith("2 hours")) return 2
    if (raw.startsWith("3 hours")) return 3
    if (raw.startsWith("half day")) return 4
    if (raw.startsWith("full day")) return 8
    return null
  }

  const buildTimeOptions = (dateIso: string, durationHours: number) => {
    const { start, end } = getBusinessHours(dateIso)
    const options: Array<{ value: string; label: string }> = []
    for (let hour = start; hour <= end - durationHours; hour++) {
      const startValue = `${String(hour).padStart(2, "0")}:00`
      const endValue = `${String(hour + durationHours).padStart(2, "0")}:00`
      options.push({
        value: startValue,
        label: `${formatTimeLabel(startValue)} - ${formatTimeLabel(endValue)}`,
      })
    }
    return options
  }

  const serviceDetailOptions: Record<string, Array<{ value: string; label: string }>> = {
    photoshoot: [
      { value: "Package A — Indoor Set Design", label: "Package A — Indoor Set Design" },
      { value: "Package B — Plain Background", label: "Package B — Plain Background" },
      { value: "Package C — Outdoor Shoot", label: "Package C — Outdoor Shoot" },
    ],
    makeup: [
      { value: "Natural/Everyday Look", label: "Natural/Everyday Look" },
      { value: "Glamour/Evening", label: "Glamour/Evening" },
      { value: "Bridal Makeup", label: "Bridal Makeup" },
    ],
    "studio-rental": [
      { value: "1 Hour — Basic Setup", label: "1 Hour — Basic Setup" },
      { value: "1 Hour — With Backdrop", label: "1 Hour — With Backdrop" },
      { value: "2 Hours — Basic Setup", label: "2 Hours — Basic Setup" },
      { value: "2 Hours — With Backdrop", label: "2 Hours — With Backdrop" },
      { value: "3 Hours — Basic Setup", label: "3 Hours — Basic Setup" },
      { value: "3 Hours — With Backdrop", label: "3 Hours — With Backdrop" },
      { value: "Half Day (4 hrs) — With Backdrop", label: "Half Day (4 hrs) — With Backdrop" },
      { value: "Full Day (8 hrs) — With Backdrop", label: "Full Day (8 hrs) — With Backdrop" },
    ],
  }

  const serviceLabels: Record<string, string> = {
    pkg_a: "Package A - Indoor Set Design",
    pkg_b: "Package B - Plain Background",
    pkg_c: "Package C - Outdoor Shoot",
    studio_rental: "Studio Rental",
    photoshoot: "Photoshoot",
    makeup: "Makeup",
    "studio-rental": "Studio Rental",
  }

  const packageLabels: Record<number, string> = {
    1: "Package A - Indoor Set Design",
    2: "Package B - Plain Background",
    3: "Package C - Outdoor Shoot",
  }

  const getServiceTypeLabel = (serviceId: number | string | null | undefined) => {
    const id = Number(serviceId)
    if (id === 1) return "Photoshoot"
    if (id === 2) return "Makeup"
    if (id === 3) return "Studio Rental"
    return ""
  }

  const normalizeServiceValue = (booking: any) => {
    if (Number(booking?.service_id) === 1 || booking?.package_id) return "photoshoot"
    if (Number(booking?.service_id) === 2 || booking?.makeup_service_id) return "makeup"
    if (Number(booking?.service_id) === 3 || booking?.studio_rental_option_id) return "studio-rental"

    const value = (booking?.service || booking?.package_name_snapshot || "").toString().toLowerCase()
    if (value.includes("package")) return "photoshoot"
    if (value.includes("photo")) return "photoshoot"
    if (value.includes("makeup")) return "makeup"
    if (value.includes("studio")) return "studio-rental"
    return value || "photoshoot"
  }

  const getServiceDetail = (booking: any, serviceType: string) => {
    const raw = booking?.package_name_snapshot || booking?.service || ""
    const available = serviceDetailOptions[serviceType] || []
    const exact = available.find((option) => option.value === raw)
    return exact?.value || available[0]?.value || raw || ""
  }

  const getDisplayService = (booking: any) => {
    return booking?.package_name_snapshot || booking?.service || "—"
  }

  const getSyncedDisplayService = (booking: any) => {
    if (booking?.package_id) return packageLabels[Number(booking.package_id)] || "Photoshoot"
    if (booking?.makeup_service_id) return "Makeup"
    if (booking?.studio_rental_option_id) return "Studio Rental"

    const serviceId = Number(booking?.service_id)
    if (serviceId === 1) return "Photoshoot"
    if (serviceId === 2) return "Makeup"
    if (serviceId === 3) return "Studio Rental"

    const snapshot = booking?.package_name_snapshot
    if (snapshot) return serviceLabels[snapshot] || snapshot

    return getDisplayService(booking)
  }

  const getDisplayDateTime = (booking: any) => {
    const start = booking?.start_datetime as string | undefined
    if (start && typeof start === "string") {
      const normalized = start.includes("T") ? start : start.replace(" ", "T")
      const parsed = new Date(normalized)
      if (!Number.isNaN(parsed.getTime())) {
        return {
          date: parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          time: parsed.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
        }
      }
    }

    const rawDate = booking?.date as string | undefined
    const rawTime = booking?.time as string | undefined
    if (rawDate) {
      const parsedDate = new Date(rawDate)
      const formattedDate = Number.isNaN(parsedDate.getTime())
        ? rawDate
        : parsedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      const formattedTime = rawTime
        ? new Date(`1970-01-01T${rawTime}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
        : "—"
      return {
        date: formattedDate,
        time: formattedTime,
      }
    }

    return { date: "—", time: "—" }
  }

  const getDisplayTimeRange = (booking: any) => {
    const startRaw = booking?.start_datetime as string | undefined
    const endRaw = booking?.end_datetime as string | undefined
    if (startRaw && endRaw) {
      const start = new Date(String(startRaw).replace(" ", "T"))
      const end = new Date(String(endRaw).replace(" ", "T"))
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
        const fmt = (d: Date) =>
          d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
        return `${fmt(start)} - ${fmt(end)}`
      }
    }

    // fallback: show just start time if that’s all we can parse
    return getDisplayDateTime(booking).time
  }

  const getDisplayPrice = (booking: any) => {
    const raw = booking?.total_price ?? booking?.package_price_snapshot ?? 0
    const amount = Number(raw)
    return Number.isFinite(amount) ? amount : 0
  }

  const resolveBookingUserIds = async (user: any) => {
    const ids = new Set<string>()
    if (user?.id) ids.add(user.id)

    const email = user?.email?.toLowerCase?.()
    if (email) {
      const { data: matchedUsers } = await supabase
        .from("users")
        .select("id, email")
        .ilike("email", email)

      ;(matchedUsers || []).forEach((row: any) => {
        if (row?.id) ids.add(row.id)
      })
    }

    return Array.from(ids)
  }

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const bookingUserIds = await resolveBookingUserIds(user)
    if (bookingUserIds.length === 0) {
      setBookings([])
      return
    }
    const { data, error } = await supabase
      .from('bookings')
      .select('id, user_id, service_id, package_id, makeup_service_id, studio_rental_option_id, package_name_snapshot, package_price_snapshot, start_datetime, end_datetime, total_price, status')
      .in('user_id', bookingUserIds)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setBookings(data as any[])
      return
    }

    const { data: fallbackBookings, error: fallbackError } = await supabase
      .from("bookings")
      .select("id, user_id, service_id, package_id, makeup_service_id, studio_rental_option_id, package_name_snapshot, package_price_snapshot, start_datetime, end_datetime, total_price, status")
      .in("user_id", bookingUserIds)
      .order("start_datetime", { ascending: false })

    if (!fallbackError && fallbackBookings) {
      setBookings(fallbackBookings as any[])
    } else {
      setBookings([])
    }
  }

  const toDateInput = (value: string | null | undefined) => {
    if (!value) return ""
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10)

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return ""

    const localDate = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000)
    return localDate.toISOString().split("T")[0]
  }

  const toTimePart = (raw: any) => {
    if (!raw || typeof raw !== "string") return ""
    const parts = raw.split(" ")
    const timePart = parts[1] || ""
    if (/^\d{2}:\d{2}/.test(timePart)) return timePart.slice(0, 5)
    return ""
  }

  const buildHourlyTimeOptions = (dateIso: string) => {
    const { start, end } = getBusinessHours(dateIso)
    const options: Array<{ value: string; label: string }> = []
    for (let hour = start; hour <= end; hour++) {
      const value = `${String(hour).padStart(2, "0")}:00`
      options.push({ value, label: formatTimeLabel(value) })
    }
    return options
  }

  useEffect(() => {
    let channel: any

    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await load()

      try {
        channel = supabase
          .channel(`public:bookings:user_${user.id}:${Date.now()}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'bookings' },
            async () => {
              await load()
            }
          )
          .subscribe()
      } catch (err) {
        console.warn('Realtime subscription error', err)
      }
    }

    setup()

    const refreshOnFocus = () => {
      if (document.visibilityState !== "hidden") {
        void load()
      }
    }

    window.addEventListener("focus", refreshOnFocus)
    document.addEventListener("visibilitychange", refreshOnFocus)

    return () => {
      window.removeEventListener("focus", refreshOnFocus)
      document.removeEventListener("visibilitychange", refreshOnFocus)
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  const startEdit = (booking: any) => {
    const serviceType = normalizeServiceValue(booking)
    setEditingBooking({ ...booking, __draft: false })
    setEditStep(1)
    setEditDraft({
      serviceType,
      service: getServiceDetail(booking, serviceType),
      date: toDateInput(booking.start_datetime),
      startTime: toTimePart(booking.start_datetime),
      endTime: toTimePart(booking.end_datetime),
    })
  }

  const saveEdit = async () => {
    if (!editingBooking) return
    if (!editDraft.date || !editDraft.startTime || !editDraft.endTime) {
      return alert("Please select date, start time, and end time.")
    }

    const startDateTime = `${editDraft.date} ${editDraft.startTime}:00`
    const endDateTime = `${editDraft.date} ${editDraft.endTime}:00`

    const startParsed = new Date(startDateTime.replace(" ", "T"))
    const endParsed = new Date(endDateTime.replace(" ", "T"))
    if (Number.isNaN(startParsed.getTime()) || Number.isNaN(endParsed.getTime())) {
      return alert("Invalid start or end time.")
    }
    if (endParsed.getTime() <= startParsed.getTime()) {
      return alert("End time must be after start time.")
    }

    const payload: any = {
      package_name_snapshot: editDraft.service,
      start_datetime: startDateTime,
      end_datetime: endDateTime,
    }

    // Keep relational service columns in sync so user/admin dashboards reflect edits.
    if (editDraft.serviceType === "photoshoot") {
      payload.service_id = 1
      payload.makeup_service_id = null
      payload.studio_rental_option_id = null
      const packageMap: Record<string, number> = {
        "Package A — Indoor Set Design": 1,
        "Package B — Plain Background": 2,
        "Package C — Outdoor Shoot": 3,
      }
      payload.package_id = packageMap[editDraft.service] ?? null
    } else if (editDraft.serviceType === "makeup") {
      payload.service_id = 2
      payload.package_id = null
      payload.studio_rental_option_id = null
      payload.makeup_service_id = editingBooking.makeup_service_id ?? 1
    } else if (editDraft.serviceType === "studio-rental") {
      payload.service_id = 3
      payload.package_id = null
      payload.makeup_service_id = null
      payload.studio_rental_option_id = editingBooking.studio_rental_option_id ?? 1
    }

    const { error } = await supabase
      .from("bookings")
      .update(payload)
      .eq("id", editingBooking.id)

    if (error) return alert(`Failed to save booking changes: ${error.message}`)

    setBookings((prev) =>
      prev.map((item) =>
        item.id === editingBooking.id
          ? {
              ...item,
              ...payload,
              package_name_snapshot: editDraft.service,
            }
          : item
      )
    )
    setEditingBooking(null)
    setEditStep(1)
    await load()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    if (!deleteTarget?.id) return alert("Invalid booking selected.")

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return alert('You must be logged in')

    const bookingUserIds = await resolveBookingUserIds(user)
    if (bookingUserIds.length > 0 && deleteTarget?.user_id && !bookingUserIds.includes(deleteTarget.user_id)) {
      return alert("You can only delete your own bookings.")
    }

    const bookingId = deleteTarget.id
    const { data: { session } } = await supabase.auth.getSession()
    const accessToken = session?.access_token
    if (!accessToken) return alert("You must be logged in")

    const res = await fetch("/api/bookings/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ bookingId }),
    })

    const json = await res.json()
    if (!res.ok) {
      return alert(`Failed to delete booking: ${json?.error || "Unknown error"}`)
    }

    setBookings((prev) => prev.filter((b) => b.id !== bookingId))
    setDeleteTarget(null)
    await load()
  }

  return (
    <div className="text-[#1a1a1a]">
      <div className="mb-5 px-1 md:px-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#8f7a53]">Bookings</p>
            <h1 className="font-serif text-3xl font-semibold text-[#111111] md:text-4xl">My Schedule</h1>
          </div>
        </div>
      </div>

      {editingBooking && (
        <div className="mb-6 rounded-[24px] border border-[#ece4d7] bg-white p-5 shadow-[0_12px_30px_rgba(17,17,17,0.06)] md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#8f7a53]">Edit Booking</p>
              
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${editStep === 1 ? "bg-[#111111] text-white" : "bg-gray-100 text-gray-500"}`}>1 Service</span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${editStep === 2 ? "bg-[#111111] text-white" : "bg-gray-100 text-gray-500"}`}>2 Date & Time</span>
            </div>
          </div>

          <div className="mb-5 rounded-2xl border border-[#ece4d7] bg-[#fbf7f1] p-4 md:p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#8f7a53]">Current booking details</p>
            <div className="grid gap-3 md:grid-cols-5">
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-gray-500">Date</p>
                <p className="font-medium text-[#111111]">{getDisplayDateTime(editingBooking).date}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-gray-500">Time</p>
                <p className="font-medium text-[#111111]">{getDisplayTimeRange(editingBooking)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-gray-500">Service</p>
                  <p className="font-medium text-[#111111]">{getSyncedDisplayService(editingBooking)}</p>
              </div>
              <div className="md:text-right">
                <p className="text-xs uppercase tracking-[0.1em] text-gray-500">Price</p>
                <p className="font-semibold text-[#C8A96A]">₱{getDisplayPrice(editingBooking).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-gray-500">Status</p>
                <span
                  className={`inline-flex text-sm px-3 py-1 rounded-full ${
                    normalizeBookingStatus(editingBooking.status) === "approved"
                      ? "bg-green-100 text-green-600"
                      : normalizeBookingStatus(editingBooking.status) === "cancelled"
                      ? "bg-red-100 text-red-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {normalizeBookingStatus(editingBooking.status) === "approved"
                    ? "Approved"
                    : normalizeBookingStatus(editingBooking.status) === "cancelled"
                    ? "Cancelled"
                    : "Pending"}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-serif text-xl font-semibold text-[#111111]">Update specific service and date & time</h3>
            <p className="text-sm text-gray-500">Use the fields below to modify this booking.</p>
          </div>

          {editStep === 1 && (
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#1a1a1a]">Service Type</label>
                <select
                  value={editDraft.serviceType}
                  onChange={(e) => {
                    const nextType = e.target.value
                    setEditDraft({
                      ...editDraft,
                      serviceType: nextType,
                      service: serviceDetailOptions[nextType]?.[0]?.value || "",
                    })
                  }}
                  className="h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#C8A96A]"
                >
                  {serviceTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#1a1a1a]">Specific Service</label>
                <select
                  value={editDraft.service}
                  onChange={(e) => setEditDraft({ ...editDraft, service: e.target.value })}
                  className="h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#C8A96A]"
                >
                  {(serviceDetailOptions[editDraft.serviceType] || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={() => setEditStep(2)}
                className="h-12 bg-[#C8A96A] px-6 text-white hover:bg-[#b8935a]"
                disabled={!editDraft.service}
              >
                Continue to Date & Time
              </Button>
            </div>
          )}

          {editStep === 2 && (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end">
                <div className="grid min-w-0 gap-2">
                  <label className="text-sm font-medium text-[#1a1a1a]">Date</label>
                  <input
                    type="date"
                    value={editDraft.date}
                    onChange={(e) =>
                      setEditDraft({
                        ...editDraft,
                        date: e.target.value,
                        startTime: "",
                        endTime: "",
                      })
                    }
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#C8A96A]"
                  />
                </div>
                <div className="grid min-w-0 gap-2">
                  <label className="text-sm font-medium text-[#1a1a1a]">Start Time</label>
                  <select
                    value={editDraft.startTime}
                    onChange={(e) =>
                      setEditDraft({
                        ...editDraft,
                        startTime: e.target.value,
                        endTime: "",
                      })
                    }
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#C8A96A]"
                    disabled={!editDraft.date}
                  >
                    <option value="">Select start time</option>
                    {buildHourlyTimeOptions(editDraft.date).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid min-w-0 gap-2">
                  <label className="text-sm font-medium text-[#1a1a1a]">End Time</label>
                  <select
                    value={editDraft.endTime}
                    onChange={(e) => setEditDraft({ ...editDraft, endTime: e.target.value })}
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#C8A96A]"
                    disabled={!editDraft.date || !editDraft.startTime}
                  >
                    <option value="">Select end time</option>
                    {buildHourlyTimeOptions(editDraft.date)
                      .filter((opt) => opt.value > editDraft.startTime)
                      .map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => setEditStep(1)} className="h-12 border-gray-200 px-6 hover:bg-gray-50">
                  Back
                </Button>
                <Button onClick={saveEdit} className="h-12 bg-[#111111] px-6 text-white hover:bg-[#222222]">
                  Save changes
                </Button>
                <Button variant="ghost" onClick={() => setEditingBooking(null)} className="h-12 px-6 text-gray-500 hover:bg-gray-100">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* BOOKINGS LIST */}
      <div className="rounded-[28px] bg-[#fbf7f1] p-5 shadow-[0_18px_50px_rgba(17,17,17,0.08)] md:p-7">

        {bookings.length === 0 && (
          <p className="text-gray-500">No scheduled sessions yet.</p>
        )}

        <div className="space-y-3">
          {bookings.length > 0 && (
            <div className="hidden rounded-2xl border border-[#ece4d7] bg-[#f6efe2] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#7a6542] md:grid md:grid-cols-[1fr_1fr_1.5fr_1fr_auto_auto] md:items-center md:gap-4">
              <span>Date</span>
              <span>Time</span>
              <span>Service</span>
              <span className="justify-self-end text-right">Price</span>
              <span className="justify-self-start text-left">Status</span>
              <span className="justify-self-start pl-4 text-left">Actions</span>
            </div>
          )}

          {bookings.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border border-[#ece4d7] bg-white px-4 py-4 shadow-sm"
            >
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_1.5fr_1fr_auto_auto] md:items-center md:gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.1em] text-gray-500 md:hidden">Date</p>
                  <p className="font-medium text-[#111111]">{getDisplayDateTime(b).date}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.1em] text-gray-500 md:hidden">Time</p>
                  <p className="font-medium text-[#111111]">{getDisplayTimeRange(b)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.1em] text-gray-500 md:hidden">Service</p>
                  <p className="font-medium text-[#111111]">{getSyncedDisplayService(b)}</p>
                </div>
                <div className="md:justify-self-end md:text-right">
                  <p className="text-xs uppercase tracking-[0.1em] text-gray-500 md:hidden">Price</p>
                  <p className="font-semibold tabular-nums text-[#C8A96A]">₱{getDisplayPrice(b).toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.1em] text-gray-500 md:hidden">Status</p>
                  <span
                  className={`text-sm px-3 py-1 rounded-full ${
                    normalizeBookingStatus(b.status) === "approved"
                      ? "bg-green-100 text-green-600"
                      : normalizeBookingStatus(b.status) === "cancelled"
                      ? "bg-red-100 text-red-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {normalizeBookingStatus(b.status) === "approved"
                    ? "Approved"
                    : normalizeBookingStatus(b.status) === "cancelled"
                    ? "Cancelled"
                    : "Pending"}
                </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 md:justify-start md:pl-4">
                  <button onClick={() => startEdit(b)} className="text-[#C8A96A] hover:text-[#b8935a] transition-colors" title="Edit">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => setDeleteTarget(b)} className="text-red-400 hover:text-red-600 transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      <div className="mt-5 flex justify-end">
        <Link
          href="/booking"
          onClick={() => {
            if (typeof window !== "undefined") {
              localStorage.removeItem("bookingEditMeta")
            }
          }}
          className="rounded-full bg-[#C8A96A] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#b8935a]"
        >
          Add Booking
        </Link>
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete booking?</DialogTitle>
            <DialogDescription>This action cannot be undone. The booking will be removed permanently.</DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
