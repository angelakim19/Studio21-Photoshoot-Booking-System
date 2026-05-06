"use client"

import Link from "next/link"
import Image from "next/image"
import { services, bookings } from "@/lib/mock-data"

export default function UserPage() {
  const userName = "User"

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#1a1a1a]">

      {/* HEADER */}
      <header className="flex justify-between items-center px-8 py-4 bg-white border-b">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="logo" width={45} height={45} />
          <span className="font-serif text-xl font-semibold">
            Studio <span className="text-[#C8A96A]">21</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm">Hi, {userName}</span>
          <button className="text-sm text-red-500">Logout</button>
        </div>
      </header>

      {/* HERO */}
      <section className="px-8 py-10">
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
      <section className="px-8 py-6">
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
      <section className="px-8 py-6">
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

      {/* QUICK ACTIONS */}
      <section className="px-8 py-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>

        <div className="flex gap-4 flex-wrap">
          <Link href="/booking">
            <button className="bg-[#C8A96A] text-white px-5 py-2 rounded-full">
              Book Now
            </button>
          </Link>

          <button className="border px-5 py-2 rounded-full">
            View Schedule
          </button>

          <button className="border px-5 py-2 rounded-full">
            Edit Profile
          </button>
        </div>
      </section>

    </div>
  )
}
