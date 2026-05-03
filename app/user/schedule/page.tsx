"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type BookingRecord = {
  id: string | number
  service: string
  date: string
  time: string
  status: string
}

export default function SchedulePage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBookingId, setEditingBookingId] = useState<string | number | null>(null)
  const [draft, setDraft] = useState({ service: "", date: "", time: "", status: "Pending" })

  useEffect(() => {
    const loadBookings = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("bookings")
        .select("id, service, date, time, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (!error && data) {
        setBookings(data as BookingRecord[])
      }

      setLoading(false)
    }

    loadBookings()
  }, [])

  const startEdit = (booking: BookingRecord) => {
    setEditingBookingId(booking.id)
    setDraft({
      service: booking.service,
      date: booking.date,
      time: booking.time,
      status: booking.status,
    })
  }

  const cancelEdit = () => {
    setEditingBookingId(null)
  }

  const saveEdit = async (bookingId: string | number) => {
    const { error } = await supabase
      .from("bookings")
      .update({
        service: draft.service,
        date: draft.date,
        time: draft.time,
        status: draft.status,
      })
      .eq("id", bookingId)

    if (!error) {
      setBookings((current) =>
        current.map((booking) =>
          booking.id === bookingId ? { ...booking, ...draft } : booking,
        ),
      )
      setEditingBookingId(null)
    }
  }

  const deleteBooking = async (bookingId: string | number) => {
    const confirmed = window.confirm("Delete this booking?")
    if (!confirmed) return

    const { error } = await supabase.from("bookings").delete().eq("id", bookingId)

    if (!error) {
      setBookings((current) => current.filter((booking) => booking.id !== bookingId))
    }
  }

  return (
    <div>
      {/* TITLE */}
      <h1 className="text-2xl font-serif mb-6">My Schedule</h1>

      {/* BOOKINGS LIST */}
      <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">

        {loading && <p className="text-gray-500">Loading your bookings...</p>}

        {!loading && bookings.length === 0 && (
          <p className="text-gray-500">No scheduled sessions yet.</p>
        )}

        {!loading && bookings.map((booking) => (
          <div
            key={booking.id}
            className="border-b pb-4 last:border-b-0 last:pb-0"
          >
            {editingBookingId === booking.id ? (
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-sm text-gray-600">Service</label>
                    <Input value={draft.service} onChange={(e) => setDraft({ ...draft, service: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Date</label>
                    <Input value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Time</label>
                    <Input value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Status</label>
                    <Input value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => saveEdit(booking.id)} className="bg-[#C8A96A] hover:bg-[#B8995A] text-white">
                    Save
                  </Button>
                  <Button variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center gap-4">
                <div>
                  <p className="font-medium">{booking.service}</p>
                  <p className="text-sm text-gray-500">
                    {booking.date} • {booking.time}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm px-3 py-1 rounded-full ${
                      booking.status?.toLowerCase() === "confirmed"
                        ? "bg-green-100 text-green-600"
                        : booking.status?.toLowerCase() === "cancelled"
                        ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {booking.status}
                  </span>

                  <Button variant="outline" size="sm" onClick={() => startEdit(booking)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteBooking(booking.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

      </div>
    </div>
  )
}