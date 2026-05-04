"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { services, bookings } from "../../lib/mock-data"

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
    <div className={`relative h-64 md:h-96 ${className}`}>
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

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/30 mix-blend-multiply" />

      <div className="absolute inset-0 flex flex-col items-start justify-center px-6 md:px-24 text-white">
        <p className="text-sm md:text-base uppercase tracking-wider text-[#F5F5F5]/90">Studio 21 Interior</p>
        <h3 className="text-lg md:text-2xl font-medium mt-2">Premium Photography Studio</h3>
        <h1 className="font-serif text-2xl md:text-4xl font-semibold mt-2">Capture Your Perfect Moment at Studio 21</h1>
        <p className="mt-3 max-w-xl text-sm md:text-base text-white/90">
          Book professional photoshoots, makeup services, and studio rentals with ease. Our luxurious facilities and expert team ensure stunning results every time.
        </p>
        <div className="mt-6">
          <Link href="/booking">
            <button className="bg-[#C8A96A] text-black px-5 py-2 rounded-full font-semibold">Book a Session</button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const userName = "User"

  return (
    <div className="text-[#1a1a1a]">

      {/* HERO with background slider */}
      <section className="mb-10 relative">
        <BackgroundSlider className="rounded-xl overflow-hidden" />
      </section>

      {/* BackgroundSlider component (kept in this file to avoid touching other files) */}
      
      

      {/* SERVICES */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Services</h2>

        <div className="grid md:grid-cols-4 gap-4">
          {services.map((service) => (
            <Link href="/booking" key={service.id}>
              <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition">
                <div className="h-32 bg-gray-200 rounded-lg mb-4" />

                <h3 className="font-medium">{service.name}</h3>

                <p className="text-[#C8A96A] font-semibold mt-1">
                  {new Intl.NumberFormat("en-PH", {
                    style: "currency",
                    currency: "PHP",
                    minimumFractionDigits: 0,
                  }).format(service.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BOOKINGS */}
      <section>
        <h2 className="text-xl font-semibold mb-4">My Bookings</h2>

        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="flex justify-between items-center border-b pb-3"
            >
              <div>
                <p className="font-medium">{b.service}</p>
                <p className="text-sm text-gray-500">
                  {b.date} • {b.time}
                </p>
              </div>

              <span
                className={`text-sm px-3 py-1 rounded-full ${
                  b.status === "Confirmed"
                    ? "bg-green-100 text-green-600"
                    : "bg-yellow-100 text-yellow-600"
                }`}
              >
                {b.status}
              </span>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}