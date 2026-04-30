"use client"

import { bookings } from "../../../lib/mock-data"

export default function SchedulePage() {
  return (
    <div>
      {/* TITLE */}
      <h1 className="text-2xl font-serif mb-6">My Schedule</h1>

      {/* BOOKINGS LIST */}
      <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">

        {bookings.length === 0 && (
          <p className="text-gray-500">No scheduled sessions yet.</p>
        )}

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
    </div>
  )
}