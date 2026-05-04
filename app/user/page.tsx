"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Footer } from "@/components/layout/footer"

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
          
          <Link href="/booking" className="rounded-full bg-[#C8A96A] px-5 py-2 text-sm font-semibold text-black transition hover:bg-[#e0c88c]">
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

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: dbUser } = await supabase.from('users').select('first_name').eq('id', user.id).maybeSingle()
      const first = dbUser?.first_name || (user.user_metadata as any)?.first_name || user.email?.split('@')[0]
      if (first) setUserName(first)

      // fetch bookings for user
      const { data: userBookings, error } = await supabase
        .from('bookings')
        .select('id, service, date, time, status, total_price')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && userBookings) setBookings(userBookings as any[])
    }

    load()
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
      <section className="rounded-[28px] bg-[#fbf7f1] p-5 shadow-[0_18px_50px_rgba(17,17,17,0.08)] md:p-7">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#111111]">My Bookings</h2>
            <p className="text-sm text-gray-500">Your upcoming and recent sessions</p>
          </div>
          <div className="rounded-full bg-[#111111] px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white">
            {bookings.length} total
          </div>
        </div>

        <div className="space-y-3">
          {bookings.length === 0 && <p className="text-gray-500">You have no bookings yet.</p>}

          {bookings.map((b) => (
            <div key={b.id} className="flex flex-col gap-4 rounded-2xl border border-[#ece4d7] bg-white px-4 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <p className="font-medium text-[#111111]">{b.service}</p>
                <p className="text-sm text-gray-500">{b.date} • {b.time}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full bg-[#f7f1e5] px-4 py-2 text-sm text-[#111111]">
                  <span className="text-xs uppercase tracking-[0.18em] text-gray-500">Total</span>{" "}
                  <span className="font-semibold text-[#C8A96A]">
                    ₱{Number(b.total_price || 0).toLocaleString("en-PH")}
                  </span>
                </div>

                <span className={`text-sm px-3 py-1 rounded-full ${b.status?.toLowerCase() === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                  {b.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}