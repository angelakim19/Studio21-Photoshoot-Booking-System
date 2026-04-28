import { ChevronLeft, ChevronRight } from "lucide-react"

export function BookingStep3() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const dates = [
    [null, null, 1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10, 11, 12],
    [13, 14, 15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24, 25, 26],
    [27, 28, 29, 30, 31, null, null],
  ]

  const timeSlots = [
    { time: "9:00 AM", available: true },
    { time: "10:00 AM", available: true },
    { time: "11:00 AM", available: false },
    { time: "12:00 PM", available: true },
    { time: "1:00 PM", available: true, selected: true },
    { time: "2:00 PM", available: false },
    { time: "3:00 PM", available: true },
    { time: "4:00 PM", available: true },
    { time: "5:00 PM", available: false },
  ]

  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg shadow-md overflow-hidden">
      {/* Step Indicator */}
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <div className="flex items-center justify-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold">✓</div>
            <span className="text-gray-400">Service</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-800"></div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold">✓</div>
            <span className="text-gray-400">Details</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-800"></div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold">3</div>
            <span className="font-medium text-gray-800">Date & Time</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300"></div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-bold">4</div>
            <span className="text-gray-400">Confirm</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Calendar */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <ChevronLeft className="w-5 h-5 text-gray-400 cursor-pointer" />
              <span className="font-semibold text-gray-700 text-sm">January 2025</span>
              <ChevronRight className="w-5 h-5 text-gray-400 cursor-pointer" />
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {days.map((day) => (
                <div key={day} className="py-1 text-gray-500 font-medium">{day}</div>
              ))}
              {dates.flat().map((date, i) => (
                <div 
                  key={i} 
                  className={`py-2 rounded ${
                    date === null 
                      ? "" 
                      : date === 15 
                        ? "bg-gray-800 text-white font-bold" 
                        : "text-gray-600 hover:bg-gray-100 cursor-pointer"
                  }`}
                >
                  {date}
                </div>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <div>
            <h3 className="font-semibold text-gray-700 text-sm mb-3">Available Time Slots</h3>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {timeSlots.map((slot) => (
                <div 
                  key={slot.time}
                  className={`py-2 px-3 rounded text-xs text-center ${
                    slot.selected 
                      ? "bg-gray-800 text-white font-medium" 
                      : slot.available 
                        ? "bg-gray-50 border border-gray-200 text-gray-600 cursor-pointer hover:border-gray-400" 
                        : "bg-gray-100 text-gray-300 line-through cursor-not-allowed"
                  }`}
                >
                  {slot.time}
                </div>
              ))}
            </div>
            {/* Legend */}
            <div className="mt-3 flex gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded"></div>
                <span className="text-gray-500">Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-100 rounded"></div>
                <span className="text-gray-400">Not Available</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          <button className="px-5 py-2 border border-gray-300 text-gray-600 rounded-md text-sm font-medium">
            ← Back
          </button>
          <button className="px-5 py-2 bg-gray-800 text-white rounded-md text-sm font-medium">
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}
