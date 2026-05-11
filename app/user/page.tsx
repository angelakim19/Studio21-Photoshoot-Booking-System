"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { normalizeBookingStatus } from "@/lib/booking-status"

function BackgroundSlider({ className = "" }: { className?: string }) {
  const images = ["/images/studio.jpg"]
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % images.length)
    }, 4500)
    return () => clearInterval(t)
  }, [])

  return (
    <div className={`relative h-[280px] overflow-hidden md:h-[360px] ${className}`}>
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`slide-${i}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/60" />

      <div className="absolute inset-0 flex flex-col justify-end px-6 py-6 text-white md:px-10 md:py-10">
        <p className="text-xs uppercase tracking-[0.35em] text-[#C8A96A]">Client Dashboard</p>
        <h1 className="font-serif text-3xl font-semibold md:text-5xl">Studio 21</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/85 md:text-base">
          Keep track of your bookings, profile, and account settings in one place.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs md:text-sm">
          
          <Link
            href="/booking"
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("bookingEditMeta")
              }
            }}
            className="rounded-full bg-[#C8A96A] px-5 py-2 text-sm font-semibold text-black transition hover:bg-[#e0c88c]"
          >
            Book Your Session
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [userName, setUserName] = useState<string>("User")
  const [bookings, setBookings] = useState<any[]>([])

  const serviceLabels: Record<string, string> = {
    pkg_a: "Package A - Indoor Set Design",
    pkg_b: "Package B - Plain Background",
    pkg_c: "Package C - Outdoor Shoot",
    studio_rental: "Studio Rental",
    photoshoot: "Photoshoot",
    makeup: "Makeup",
    "studio-rental": "Studio Rental",
    "Package A — Indoor Set Design": "Package A - Indoor Set Design",
    "Package B — Plain Background": "Package B - Plain Background",
    "Package C — Outdoor Shoot": "Package C - Outdoor Shoot",
    "Package A â€” Indoor Set Design": "Package A - Indoor Set Design",
    "Package B â€” Plain Background": "Package B - Plain Background",
    "Package C â€” Outdoor Shoot": "Package C - Outdoor Shoot",
    "1 Hour — Basic Setup": "1 Hour - Basic Setup",
    "1 Hour — With Backdrop": "1 Hour - With Backdrop",
    "2 Hours — Basic Setup": "2 Hours - Basic Setup",
    "2 Hours — With Backdrop": "2 Hours - With Backdrop",
    "3 Hours — Basic Setup": "3 Hours - Basic Setup",
    "3 Hours — With Backdrop": "3 Hours - With Backdrop",
    "Half Day (4 hrs) — With Backdrop": "Half Day (4 hrs) - With Backdrop",
    "Full Day (8 hrs) — With Backdrop": "Full Day (8 hrs) - With Backdrop",
    "Natural/Everyday Look": "Natural/Everyday Look",
    "Glamour/Evening": "Glamour/Evening",
    "Bridal Makeup": "Bridal Makeup",
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

  const getDisplayService = (booking: any) => {
    const value = booking?.package_name_snapshot || booking?.service
    if (!value) return "—"
    return serviceLabels[value] || value
  }

  const getSyncedDisplayService = (booking: any) => {
    if (booking?.package_name_snapshot) {
      return serviceLabels[booking.package_name_snapshot] || booking.package_name_snapshot
    }
    if (booking?.package_id) return packageLabels[Number(booking.package_id)] || "Photoshoot"
    if (booking?.makeup_service_id) return "Makeup"
    if (booking?.studio_rental_option_id) return "Studio Rental"

    const serviceId = Number(booking?.service_id)
    if (serviceId === 1) return "Photoshoot"
    if (serviceId === 2) return "Makeup"
    if (serviceId === 3) return "Studio Rental"

    return getDisplayService(booking)
  }

  const parseStartDateTime = (booking: any) => {
    const start = booking?.start_datetime as string | undefined
    if (!start || typeof start !== "string") return null
    const normalized = start.includes("T") ? start : start.replace(" ", "T")
    const parsed = new Date(normalized)
    return Number.isNaN(parsed.getTime()) ? null : parsed
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

    return {
      date: "—",
      time: "—",
    }
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

  useEffect(() => {
    let channel: any
    let isActive = true
    let refreshTimer: number | undefined

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
      if (!user) return null

      const { data: dbUser } = await supabase.from('users').select('first_name').eq('id', user.id).maybeSingle()
      const first = dbUser?.first_name || (user.user_metadata as any)?.first_name || user.email?.split('@')[0]
      if (first && isActive) setUserName(first)

      const bookingUserIds = await resolveBookingUserIds(user)
      if (bookingUserIds.length === 0) {
        if (isActive) setBookings([])
        return user.id
      }

      // fetch bookings for user
      const { data: userBookings, error } = await supabase
        .from('bookings')
        .select('id, service_id, package_id, package_variation_id, makeup_service_id, studio_rental_option_id, package_name_snapshot, package_price_snapshot, start_datetime, end_datetime, total_price, status')
        .in('user_id', bookingUserIds)
        .order('created_at', { ascending: false })

      if (!error && userBookings && isActive) {
        setBookings(userBookings as any[])
      } else {
        const { data: fallbackBookings, error: fallbackError } = await supabase
          .from("bookings")
          .select("id, service_id, package_id, package_variation_id, makeup_service_id, studio_rental_option_id, package_name_snapshot, package_price_snapshot, start_datetime, end_datetime, total_price, status")
          .in("user_id", bookingUserIds)
          .order("start_datetime", { ascending: false })

        if (!fallbackError && fallbackBookings && isActive) {
          setBookings(fallbackBookings as any[])
        } else if (isActive) {
          setBookings([])
        }
      }

      return user.id
    }

    const setup = async () => {
      const userId = await load()
      if (!userId || !isActive) return

      // setup realtime subscription for this user's bookings
      try {
        channel = supabase
          .channel(`public:bookings:user_${userId}:${Date.now()}`)
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
        <p className="text-sm uppercase tracking-[0.28em] text-[#8f7a53]">Welcome back</p>
        <h1 className="font-serif text-3xl font-semibold text-[#111111] md:text-4xl">Hi, {userName}</h1>
      </div>

      {/* HERO with background slider */}
      <section className="mb-6 relative rounded-[28px] shadow-[0_18px_50px_rgba(17,17,17,0.12)] overflow-hidden">
        <BackgroundSlider className="rounded-xl overflow-hidden" />
      </section>

      {/* BOOKINGS */}
      <section className="rounded-[28px] bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 md:px-7 py-5 md:py-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-[#111111]">My Bookings</h2>
          <p className="text-sm text-gray-500 mt-1">Your upcoming and recent sessions</p>
        </div>

        {bookings.length === 0 && (
          <div className="px-5 md:px-7 py-8 text-gray-500">You have no bookings yet.</div>
        )}

        {bookings.length > 0 && (
          <div>
            <div className="hidden bg-gray-50/50 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:grid md:grid-cols-[1fr_1fr_2fr_1fr_0.9fr] md:gap-0 border-b border-gray-100">
              <span className="px-5">Date</span>
              <span className="px-5">Time</span>
              <span className="px-5">Service</span>
              <span className="px-5">Price</span>
              <span className="px-5">Status</span>
            </div>

            <div className="divide-y divide-gray-100">
              {bookings.map((b) => (
                <div key={b.id} className="py-5">
                  <div className="grid gap-3 md:grid-cols-[1fr_1fr_2fr_1fr_0.9fr] md:items-center md:gap-0">
                    <div className="min-w-0 px-5">
                      <p className="text-xs uppercase tracking-[0.1em] text-gray-500 md:hidden mb-1">Date</p>
                      <p className="font-medium text-[#111111]">{getDisplayDateTime(b).date}</p>
                    </div>
                    <div className="min-w-0 px-5">
                      <p className="text-xs uppercase tracking-[0.1em] text-gray-500 md:hidden mb-1">Time</p>
                      <p className="font-medium text-[#111111]">{getDisplayTimeRange(b)}</p>
                    </div>
                    <div className="min-w-0 px-5">
                      <p className="text-xs uppercase tracking-[0.1em] text-gray-500 md:hidden mb-1">Service</p>
                      <p className="font-medium text-[#111111]">{getSyncedDisplayService(b)}</p>
                    </div>
                    <div className="min-w-0 px-5">
                      <p className="text-xs uppercase tracking-[0.1em] text-gray-500 md:hidden">Price</p>
                      <p className="font-semibold text-[#C8A96A]">₱{getDisplayPrice(b).toLocaleString()}</p>
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
      </section>

    </div>
  )
}
