import { Ban, Calendar, ChevronLeft, ChevronRight, LayoutDashboard, List, Plus, Settings } from "lucide-react"

export default function AdminPage() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const calendarData = [
    [null, null, 1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10, 11, 12],
    [13, 14, 15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24, 25, 26],
    [27, 28, 29, 30, 31, null, null],
  ]

  const bookingsForDay = [
    { time: "9:00 AM", client: "Jane Smith", service: "Photoshoot" },
    { time: "1:00 PM", client: "John Doe", service: "Makeup Only" },
    { time: "3:00 PM", client: "Alice Brown", service: "Studio Rental" },
  ]

  const datesWithBookings = [8, 10, 15, 18, 22, 25]

  return (
    <div className="space-y-6 text-[#1a1a1a]">
      <div className="mb-5 px-1 md:px-2">
        <p className="text-sm uppercase tracking-[0.28em] text-[#8f7a53]">Admin Dashboard</p>
        <h1 className="font-serif text-3xl font-semibold text-[#111111] md:text-4xl">Calendar</h1>
      </div>

      <section className="grid gap-6 rounded-[28px] bg-[#fbf7f1] p-5 shadow-[0_18px_50px_rgba(17,17,17,0.08)] lg:grid-cols-[1fr_280px] md:p-7">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#111111]">Calendar</h2>
            <div className="flex items-center gap-2 text-gray-500">
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm font-medium text-[#111111]">January 2025</span>
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#ece4d7] bg-white">
            <div className="grid grid-cols-7 border-b border-[#ece4d7] bg-[#f7f1e5]">
              {days.map((day) => (
                <div key={day} className="py-2 text-center text-xs font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarData.flat().map((date, index) => (
                <div
                  key={index}
                  className={`min-h-[72px] border-b border-r border-[#f0ece3] p-2 ${date === 15 ? "bg-[#f8f5ee]" : ""}`}
                >
                  {date && (
                    <>
                      <span className={`text-xs ${date === 15 ? "font-bold text-[#111111]" : "text-gray-500"}`}>
                        {date}
                      </span>
                      {datesWithBookings.includes(date) && (
                        <div className="mt-1 space-y-1">
                          <div className="truncate rounded-md bg-[#111111] px-2 py-0.5 text-[10px] text-white">
                            Booking
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#ece4d7] bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#111111]">Jan 15, 2025</h3>
            <LayoutDashboard className="h-4 w-4 text-gray-400" />
          </div>

          <div className="mb-4 space-y-2">
            {bookingsForDay.map((booking) => (
              <div key={`${booking.time}-${booking.client}`} className="rounded-xl border border-[#ece4d7] bg-[#fbf7f1] p-3">
                <p className="text-xs font-medium text-[#111111]">{booking.time}</p>
                <p className="text-xs text-gray-600">{booking.client}</p>
                <p className="text-xs text-gray-400">{booking.service}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <button className="flex w-full items-center justify-center gap-1 rounded-full bg-[#111111] px-3 py-2 text-xs font-medium text-white">
              <Plus className="h-3 w-3" />
              Add Booking
            </button>
            <button className="flex w-full items-center justify-center gap-1 rounded-full border border-[#ded3c1] px-3 py-2 text-xs font-medium text-gray-700">
              <Ban className="h-3 w-3" />
              Block Time Slot
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Today", value: "12", subtitle: "appointments" },
          { title: "This Week", value: "48", subtitle: "scheduled" },
          { title: "Pending", value: "6", subtitle: "requests" },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl bg-white p-4 shadow-sm border border-[#ece4d7]">
            <p className="text-sm text-gray-500">{item.title}</p>
            <p className="mt-1 font-serif text-3xl font-semibold text-[#111111]">{item.value}</p>
            <p className="text-sm text-gray-500">{item.subtitle}</p>
          </div>
        ))}
      </section>
    </div>
  )
}