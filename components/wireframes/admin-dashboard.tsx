import { LayoutDashboard, Calendar, List, Plus, Ban, Settings, ChevronLeft, ChevronRight } from "lucide-react"

export function AdminDashboard() {
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
    <div className="bg-white border-2 border-gray-300 rounded-lg shadow-md overflow-hidden flex min-h-[400px]">
      {/* Sidebar */}
      <aside className="w-48 bg-gray-800 text-gray-300 p-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
          <div>
            <p className="text-sm font-semibold text-white">Admin</p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>
        </div>
        <nav className="space-y-1">
          {[
            { icon: LayoutDashboard, label: "Dashboard", active: false },
            { icon: Calendar, label: "Calendar", active: true },
            { icon: List, label: "Bookings", active: false },
            { icon: Plus, label: "Add Booking", active: false },
            { icon: Ban, label: "Block Time Slots", active: false },
            { icon: Settings, label: "Settings", active: false },
          ].map((item) => (
            <div 
              key={item.label}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-pointer ${
                item.active 
                  ? "bg-gray-700 text-white" 
                  : "text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 flex gap-4">
        {/* Calendar */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Calendar</h2>
            <div className="flex items-center gap-2">
              <ChevronLeft className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
              <span className="font-medium text-gray-700 text-sm">January 2025</span>
              <ChevronRight className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
              {days.map((day) => (
                <div key={day} className="py-2 text-center text-xs font-medium text-gray-500">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calendarData.flat().map((date, i) => (
                <div 
                  key={i} 
                  className={`min-h-[50px] border-b border-r border-gray-100 p-1 ${
                    date === 15 ? "bg-gray-100" : ""
                  }`}
                >
                  {date && (
                    <>
                      <span className={`text-xs ${date === 15 ? "font-bold text-gray-800" : "text-gray-500"}`}>
                        {date}
                      </span>
                      {datesWithBookings.includes(date) && (
                        <div className="mt-1 space-y-0.5">
                          <div className="bg-gray-800 text-white text-[8px] px-1 py-0.5 rounded truncate">
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

        {/* Right Panel - Bookings for Selected Day */}
        <div className="w-56 border-l border-gray-200 pl-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700 text-sm">Jan 15, 2025</h3>
          </div>
          
          <div className="space-y-2 mb-4">
            {bookingsForDay.map((booking, i) => (
              <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                <p className="text-xs font-medium text-gray-800">{booking.time}</p>
                <p className="text-xs text-gray-600">{booking.client}</p>
                <p className="text-xs text-gray-400">{booking.service}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <button className="w-full px-3 py-2 bg-gray-800 text-white rounded-md text-xs font-medium flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" />
              Add Booking
            </button>
            <button className="w-full px-3 py-2 border border-gray-300 text-gray-600 rounded-md text-xs font-medium flex items-center justify-center gap-1">
              <Ban className="w-3 h-3" />
              Block Time Slot
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
