"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const getDisplayService = (booking: any) => {
    return booking?.package_name_snapshot || booking?.service || "—"
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

  const getSyncedDisplayService = (booking: any) => {
    const snapshot = booking?.package_name_snapshot
    if (snapshot) return serviceLabels[snapshot] || snapshot

    if (booking?.package_id) return packageLabels[Number(booking.package_id)] || "Photoshoot"
    if (booking?.makeup_service_id) return "Makeup"
    if (booking?.studio_rental_option_id) return "Studio Rental"

    const serviceId = Number(booking?.service_id)
    if (serviceId === 1) return "Photoshoot"
    if (serviceId === 2) return "Makeup"
    if (serviceId === 3) return "Studio Rental"

    return getDisplayService(booking)
  }

  const toUiStatus = (raw: string | undefined) => {
    const value = (raw || "").toLowerCase()

    if (value === "approved" || value === "confirmed") {
      return "Approved"
    }

    if (value === "cancelled") {
      return "Cancelled"
    }

    return "Pending"
  }

  const load = async () => {
    setLoading(true)

    const [
      { data: clientRows, error: clientError },
      { data: bookingRows, error: bookingError },
    ] = await Promise.all([
      supabase.from("users").select("id, first_name, last_name, email, phone"),
      supabase
        .from("bookings")
        .select(
          "id, user_id, service_id, package_id, makeup_service_id, studio_rental_option_id, package_name_snapshot, date, time, status, total_price, created_at"
        ),
    ])

    if (!clientError && clientRows) {
      setClients(clientRows as any[])
    }

    if (!bookingError && bookingRows) {
      setBookings(bookingRows as any[])
    }

    setLoading(false)
  }

  useEffect(() => {
    let channel: any

    const setupRealtime = async () => {
      await load()

      try {
        channel = supabase
          .channel("public:bookings")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "bookings",
            },
            async () => {
              await load()
            }
          )
          .subscribe()
      } catch (err) {
        console.warn("Realtime subscription error", err)
      }
    }

    setupRealtime()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  const rows = useMemo(() => {
    return clients.map((client: any) => {
      const clientBookings = bookings
        .filter((booking: any) => booking.user_id === client.id)
        .sort((a: any, b: any) => {
          const left = new Date(b.created_at || b.date || 0).getTime()
          const right = new Date(a.created_at || a.date || 0).getTime()

          return left - right
        })

      const latestBooking = clientBookings[0] || null

      return {
        ...client,
        bookingCount: clientBookings.length,
        latestBooking,
      }
    })
  }, [clients, bookings])

  if (loading) {
    return <div className="p-6 text-gray-500">Loading clients...</div>
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl">Clients</h1>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-sm text-gray-500">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Bookings</th>
              <th className="p-4">Latest booking</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="p-4 text-gray-500" colSpan={6}>
                  No clients found.
                </td>
              </tr>
            ) : (
              rows.map((client: any) => (
                <tr key={client.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium">
                    {client.first_name} {client.last_name}
                  </td>

                  <td className="p-4">{client.email}</td>

                  <td className="p-4">{client.phone}</td>

                  <td className="p-4">{client.bookingCount}</td>

                  <td className="p-4">
                    {client.latestBooking ? (
                      <div className="space-y-1">
                        <div className="font-medium text-[#111111]">
                          {getSyncedDisplayService(client.latestBooking)}
                        </div>

                        <div className="text-sm text-gray-500">
                          {client.latestBooking.date} •{" "}
                          {client.latestBooking.time}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500">
                        No bookings yet
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    {client.latestBooking
                      ? toUiStatus(client.latestBooking.status)
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
