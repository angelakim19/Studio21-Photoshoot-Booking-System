"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { bookingServices } from "@/lib/booking-services"

type BookingRecord = {
  id: string | number
  service: string
  date: string
  time: string
  status: string
}

export default function Dashboard() {
  const [userName, setUserName] = useState("User")
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const metadata = user.user_metadata ?? {}
      const { data: dbUser } = await supabase
        .from("users")
        .select("first_name")
        .eq("id", user.id)
        .maybeSingle()

      const firstName = dbUser?.first_name || metadata.first_name || user.email?.split("@")[0] || "User"
      setUserName(firstName)

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

    loadDashboard()
  }, [])

  return (
    <div className="text-[#1a1a1a]">

      {/* HERO */}
      <section className="mb-10">
        <h1 className="text-3xl font-serif mb-2">
          Welcome back, <span className="text-[#C8A96A]">{userName}</span>
        </h1>
        <p className="text-gray-500 mb-6">
          Ready to capture your next moment?
        </p>

        <Link href="/booking">
          <button className="bg-[#C8A96A] text-white px-6 py-3 rounded-full">
            Book a Session
          </button>
        </Link>
      </section>

      {/* SERVICES */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Services</h2>

        <div className="grid md:grid-cols-4 gap-4">
          {bookingServices.map((service) => (
            <Link href="/booking" key={service.id}>
              <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition">
                <div className="h-32 bg-gray-200 rounded-lg mb-4" />

                <h3 className="font-medium">{service.title}</h3>

                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{service.description}</p>

                <p className="text-[#C8A96A] font-semibold mt-3">{service.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BOOKINGS */}
      <section>
        <h2 className="text-xl font-semibold mb-4">My Bookings</h2>

        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          {loading && <p className="text-gray-500">Loading your bookings...</p>}

          {!loading && bookings.length === 0 && (
            <p className="text-gray-500">You have no bookings yet.</p>
          )}

          {!loading && bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex justify-between items-center border-b pb-3 last:border-b-0 last:pb-0"
            >
              <div>
                <p className="font-medium">{booking.service}</p>
                <p className="text-sm text-gray-500">
                  {booking.date} • {booking.time}
                </p>
              </div>

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
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}