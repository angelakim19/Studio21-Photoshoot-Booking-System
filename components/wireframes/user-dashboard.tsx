import { User, Calendar, Lock, LogOut } from "lucide-react"

export function UserDashboard() {
  const bookings = [
    { service: "Photoshoot", date: "Jan 15, 2025", time: "1:00 PM", status: "Confirmed" },
    { service: "Makeup Only", date: "Jan 20, 2025", time: "10:00 AM", status: "Pending" },
    { service: "Studio Rental", date: "Jan 25, 2025", time: "2:00 PM", status: "Confirmed" },
  ]

  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg shadow-md overflow-hidden flex min-h-[400px]">
      {/* Sidebar */}
      <aside className="w-48 bg-gray-50 border-r border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          <div>
            <p className="text-sm font-semibold text-gray-700">John Doe</p>
            <p className="text-xs text-gray-400">User</p>
          </div>
        </div>
        <nav className="space-y-1">
          {[
            { icon: User, label: "Profile", active: false },
            { icon: Calendar, label: "My Bookings", active: true },
            { icon: Lock, label: "Change Password", active: false },
            { icon: LogOut, label: "Logout", active: false },
          ].map((item) => (
            <div 
              key={item.label}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-pointer ${
                item.active 
                  ? "bg-gray-800 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800">My Bookings</h2>
          <button className="px-4 py-2 bg-gray-800 text-white rounded-md text-sm font-medium">
            + New Booking
          </button>
        </div>

        {/* Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Service</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Date</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Time</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 text-gray-700">{booking.service}</td>
                  <td className="px-4 py-3 text-gray-500">{booking.date}</td>
                  <td className="px-4 py-3 text-gray-500">{booking.time}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === "Confirmed" 
                        ? "bg-gray-800 text-white" 
                        : "bg-gray-200 text-gray-600"
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="px-3 py-1 border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-50">
                        Edit
                      </button>
                      <button className="px-3 py-1 border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-50">
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
