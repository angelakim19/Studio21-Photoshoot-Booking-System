import { AlertCircle } from "lucide-react"

export function BookingStep4() {
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
            <div className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold">✓</div>
            <span className="text-gray-400">Date & Time</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-800"></div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold">4</div>
            <span className="font-medium text-gray-800">Confirm</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h2 className="text-lg font-bold text-gray-800 text-center mb-6">Booking Summary</h2>
        
        {/* Summary Card */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-4">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Service</span>
              <span className="text-gray-800 font-medium">Photoshoot</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Package</span>
              <span className="text-gray-800 font-medium">Package A</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Number of Sets</span>
              <span className="text-gray-800 font-medium">2 Sets</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span className="text-gray-800 font-medium">Jan 15, 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Time</span>
              <span className="text-gray-800 font-medium">1:00 PM</span>
            </div>
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex justify-between font-bold text-gray-800">
                <span>Total Price</span>
                <span>$250</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes</h3>
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 text-sm text-gray-500">
            No special requests
          </div>
        </div>

        {/* Reminder */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-800">
            This studio operates strictly by appointment. Walk-ins are not accepted.
          </p>
        </div>

        <div className="flex justify-between">
          <button className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-md text-sm font-medium">
            ← Back
          </button>
          <button className="px-6 py-2.5 bg-gray-800 text-white rounded-md text-sm font-medium">
            Confirm Booking ✓
          </button>
        </div>
      </div>
    </div>
  )
}
