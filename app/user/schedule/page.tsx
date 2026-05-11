"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type BookingUiStatus = "approved" | "pending" | "cancelled"

const normalizeBookingStatus = (raw: string | null | undefined): BookingUiStatus => {
  const value = (raw || "").toLowerCase().trim()
  if (value === "approved" || value === "confirmed") return "approved"
  if (value === "cancelled") return "cancelled"
  return "pending"
}

export default function SchedulePage() {
  const [bookings, setBookings] = useState<any[]>([])

  const serviceLabels: Record<string, string> = {
    pkg_a: "Package A - Indoor Set Design",
    pkg_b: "Package B - Plain Background",
    pkg_c: "Package C - Outdoor Shoot",
    studio_rental: "Studio Rental",
    photoshoot: "Photoshoot",
    makeup: "Makeup",
    "studio-rental": "Studio Rental",
    "package a — indoor set design": "Package A - Indoor Set Design",
    "package b — plain background": "Package B - Plain Background",
    "package c — outdoor shoot": "Package C - Outdoor Shoot",
    "package a â€” indoor set design": "Package A - Indoor Set Design",
    "package b â€” plain background": "Package B - Plain Background",
    "package c â€” outdoor shoot": "Package C - Outdoor Shoot",
    "1 hour — basic setup": "1 Hour - Basic Setup",
    "1 hour — with backdrop": "1 Hour - With Backdrop",
    "2 hours — basic setup": "2 Hours - Basic Setup",
    "2 hours — with backdrop": "2 Hours - With Backdrop",
    "3 hours — basic setup": "3 Hours - Basic Setup",
    "3 hours — with backdrop": "3 Hours - With Backdrop",
    "half day (4 hrs) — with backdrop": "Half Day (4 hrs) - With Backdrop",
    "full day (8 hrs) — with backdrop": "Full Day (8 hrs) - With Backdrop",
    "natural/everyday look": "Natural/Everyday Look",
    "glamour/evening": "Glamour/Evening",
    "bridal makeup": "Bridal Makeup",
  }

  const packageLabels: Record<number, string> = {
    1: "Package A - Indoor Set Design",
    2: "Package B - Plain Background",
    3: "Package C - Outdoor Shoot",
  }

  const normalizeServiceLabel = (value: string) => {
    const key = value.toLowerCase().trim()
    return serviceLabels[key] || serviceLabels[value] || value
  }

  const getDisplayService = (booking: any) => {
    const snapshot = booking?.package_name_snapshot
    if (snapshot) return normalizeServiceLabel(snapshot)
    return booking?.service ? normalizeServiceLabel(String(booking.service)) : "—"
  }

  const parseStartDateTime = (booking: any) => {
    const start = booking?.start_datetime as string | undefined
    if (!start || typeof start !== "string") return null
    const normalized = start.includes("T") ? start : start.replace(" ", "T")
    const parsed = new Date(normalized)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  const getSyncedDisplayService = (booking: any) => {
    const snapshot = booking?.package_name_snapshot
    if (snapshot) return normalizeServiceLabel(snapshot)

    if (booking?.package_id) return packageLabels[Number(booking.package_id)] || "Photoshoot"
    if (booking?.makeup_service_id) return "Makeup"
    if (booking?.studio_rental_option_id) return "Studio Rental"

    const serviceId = Number(booking?.service_id)
    if (serviceId === 1) return "Photoshoot"
    if (serviceId === 2) return "Makeup"
    if (serviceId === 3) return "Studio Rental"

    return getDisplayService(booking)
  }

  const getDisplayDateTime = (booking: any) => {
    const startParsed = parseStartDateTime(booking)
    if (startParsed) {
      return {
        date: startParsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        time: startParsed.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
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
      .from("bookings")
      .select("id, user_id, service_id, package_id, makeup_service_id, studio_rental_option_id, package_name_snapshot, package_price_snapshot, start_datetime, end_datetime, total_price, status")
      .in("user_id", bookingUserIds)
      .order("created_at", { ascending: false })

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

  useEffect(() => {
    let channel: any
    let isActive = true
    let refreshTimer: number | undefined

    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !isActive) return

      await load()
      if (!isActive) return

      try {
        channel = supabase
          .channel(`public:bookings:user_${user.id}:${Date.now()}`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "bookings" },
            async () => {
              await load()
            }
          )
          .subscribe()
      } catch (err) {
        console.warn("Realtime subscription error", err)
      }
    }

    const refreshOnFocus = () => {
      if (document.visibilityState !== "hidden") {
        void load()
      }
    }

    setup()
    refreshTimer = window.setInterval(() => {
      void load()
    }, 5000)
    window.addEventListener("focus", refreshOnFocus)
    document.addEventListener("visibilitychange", refreshOnFocus)

    return () => {
      isActive = false
      if (refreshTimer) window.clearInterval(refreshTimer)
      window.removeEventListener("focus", refreshOnFocus)
      document.removeEventListener("visibilitychange", refreshOnFocus)
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

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

      <div className="rounded-[28px] bg-white border border-gray-100 shadow-sm overflow-hidden">
        {bookings.length === 0 ? (
          <div className="px-5 md:px-7 py-8 text-gray-500">No scheduled sessions yet.</div>
        ) : (
          <div>
            <div className="hidden bg-gray-50/50 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:grid md:grid-cols-[1.05fr_1.15fr_1.7fr_1fr_0.9fr] md:gap-0 border-b border-gray-100">
              <span className="px-5 whitespace-nowrap">Date</span>
              <span className="px-5 whitespace-nowrap">Time</span>
              <span className="px-5 whitespace-nowrap">Service</span>
              <span className="px-5 whitespace-nowrap">Price</span>
              <span className="px-5 whitespace-nowrap">Status</span>
            </div>

            <div className="divide-y divide-gray-100">
              {bookings.map((b) => (
                <div key={b.id} className="py-5">
                  <div className="grid gap-3 md:grid-cols-[1.05fr_1.15fr_1.7fr_1fr_0.9fr] md:items-center md:gap-0">
                    <div className="min-w-0 px-5">
                      <p className="text-xs uppercase tracking-[0.1em] text-gray-500 md:hidden mb-1">Date</p>
                      <p className="font-medium leading-6 text-[#111111]">{getDisplayDateTime(b).date}</p>
                    </div>
                    <div className="min-w-0 px-5">
                      <p className="text-xs uppercase tracking-[0.1em] text-gray-500 md:hidden mb-1">Time</p>
                      <p className="font-medium leading-6 text-[#111111]">{getDisplayTimeRange(b)}</p>
                    </div>
                    <div className="min-w-0 px-5">
                      <p className="text-xs uppercase tracking-[0.1em] text-gray-500 md:hidden mb-1">Service</p>
                      <p className="font-medium leading-6 text-[#111111]">{getSyncedDisplayService(b)}</p>
                    </div>
                    <div className="min-w-0 px-5">
                      <p className="text-xs uppercase tracking-[0.1em] text-gray-500 md:hidden mb-1">Price</p>
                      <p className="font-semibold leading-6 tabular-nums text-[#C8A96A]">₱{getDisplayPrice(b).toLocaleString()}</p>
                    </div>

                    <div className="min-w-0 px-5">
                      <p className="text-xs uppercase tracking-[0.1em] text-gray-500 md:hidden mb-1">Status</p>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
                          normalizeBookingStatus(b.status) === "approved"
                            ? "bg-green-100 text-green-700"
                            : normalizeBookingStatus(b.status) === "cancelled"
                              ? "bg-gray-100 text-gray-600"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {normalizeBookingStatus(b.status) === "approved"
                          ? "Approved"
                          : normalizeBookingStatus(b.status) === "cancelled"
                            ? "Cancelled"
                            : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex justify-end">
        <Link
          href="/booking"
          className="rounded-full bg-[#C8A96A] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#b8935a]"
        >
          Add Booking
        </Link>
      </div>
    </div>
  )
}
