import { ChevronDown } from "lucide-react"

export function BookingStep2() {
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
            <div className="w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold">2</div>
            <span className="font-medium text-gray-800">Details</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300"></div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-bold">3</div>
            <span className="text-gray-400">Date & Time</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300"></div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-bold">4</div>
            <span className="text-gray-400">Confirm</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h2 className="text-lg font-bold text-gray-800 text-center mb-6">Booking Details</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Side - Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Package</label>
              <div className="h-10 bg-gray-50 border border-gray-200 rounded-md flex items-center justify-between px-3">
                <span className="text-sm text-gray-500">Package A</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Number of Sets</label>
              <div className="h-10 bg-gray-50 border border-gray-200 rounded-md flex items-center justify-between px-3">
                <span className="text-sm text-gray-500">2 Sets</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Notes</label>
              <div className="h-20 bg-gray-50 border border-gray-200 rounded-md"></div>
            </div>
          </div>

          {/* Right Side - Price Summary */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-700 mb-4 text-sm">Price Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Package A</span>
                <span>$200</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Additional Set</span>
                <span>$50</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Add-ons</span>
                <span>$0</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between font-bold text-gray-800">
                  <span>Total</span>
                  <span>$250</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <button className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-md text-sm font-medium">
            ← Back
          </button>
          <button className="px-6 py-2.5 bg-gray-800 text-white rounded-md text-sm font-medium">
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}
