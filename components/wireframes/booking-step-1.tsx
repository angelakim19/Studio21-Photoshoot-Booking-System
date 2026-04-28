import { Camera, Brush, Home, Circle } from "lucide-react"

export function BookingStep1() {
  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg shadow-md overflow-hidden">
      {/* Step Indicator */}
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <div className="flex items-center justify-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold">1</div>
            <span className="font-medium text-gray-800">Service</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300"></div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-bold">2</div>
            <span className="text-gray-400">Details</span>
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
        <h2 className="text-lg font-bold text-gray-800 text-center mb-6">Select Service Type</h2>
        
        <div className="space-y-3">
          {[
            { icon: Camera, name: "Photoshoot", desc: "Professional photo session", selected: true },
            { icon: Brush, name: "Makeup Only", desc: "Professional makeup service", selected: false },
            { icon: Home, name: "Studio Rental", desc: "Rent our studio space", selected: false },
          ].map((service) => (
            <div 
              key={service.name} 
              className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer ${
                service.selected ? "border-gray-800 bg-gray-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                service.selected ? "border-gray-800" : "border-gray-300"
              }`}>
                {service.selected && <Circle className="w-3 h-3 fill-gray-800 text-gray-800" />}
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                <service.icon className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 text-sm">{service.name}</h3>
                <p className="text-xs text-gray-400">{service.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button className="px-6 py-2.5 bg-gray-800 text-white rounded-md text-sm font-medium">
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}
