import { Circle, MapPin, Mail, Phone, Facebook, Instagram, Twitter } from "lucide-react"

export function LandingPage() {
  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg shadow-md overflow-hidden">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Circle className="w-8 h-8 text-gray-400" />
          <span className="font-bold text-gray-700">Studio 21</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
          <span className="hover:text-gray-700 cursor-pointer">Home</span>
          <span className="hover:text-gray-700 cursor-pointer">Services</span>
          <span className="hover:text-gray-700 cursor-pointer">Book Now</span>
          <span className="hover:text-gray-700 cursor-pointer">My Bookings</span>
          <span className="hover:text-gray-700 cursor-pointer">Contact</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-600">Login</button>
          <button className="px-4 py-2 text-sm bg-gray-800 text-white rounded-md">Sign Up</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="grid md:grid-cols-2 gap-8 p-8 bg-gray-50">
        <div className="flex flex-col justify-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">CAPTURE YOUR BEST MOMENTS</h1>
          <p className="text-gray-500 mb-6 text-sm">Professional photography services for all your special occasions. Book your session today.</p>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-gray-800 text-white rounded-md text-sm font-medium">Book Now</button>
            <button className="px-6 py-3 border border-gray-300 rounded-md text-sm text-gray-600">View Services</button>
          </div>
        </div>
        <div className="bg-gray-200 rounded-lg h-40 flex items-center justify-center">
          <span className="text-gray-400 text-sm">[Image Placeholder]</span>
        </div>
      </section>

      {/* Services Section */}
      <section className="p-8">
        <h2 className="text-xl font-bold text-gray-800 text-center mb-6">Our Services</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {["Photoshoot", "Makeup Only", "Studio Rental"].map((service) => (
            <div key={service} className="border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Circle className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-700 text-sm">{service}</h3>
              <p className="text-xs text-gray-400 mt-1">Service description</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="p-8 bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800 text-center mb-6">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { step: "1", title: "Choose Service", desc: "Select your preferred service" },
            { step: "2", title: "Select Date & Time", desc: "Pick an available slot" },
            { step: "3", title: "Confirm Booking", desc: "Review and confirm" },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold text-sm mb-3">
                {item.step}
              </div>
              <h3 className="font-semibold text-gray-700 text-sm">{item.title}</h3>
              <p className="text-xs text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Map Section */}
      <section className="p-8">
        <h2 className="text-xl font-bold text-gray-800 text-center mb-4">Find Us</h2>
        <div className="bg-gray-200 rounded-lg h-32 flex items-center justify-center">
          <MapPin className="w-8 h-8 text-gray-400" />
          <span className="text-gray-400 text-sm ml-2">[Map Placeholder]</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 p-6">
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <h4 className="font-semibold text-white mb-2">Contact</h4>
            <div className="flex items-center gap-2 mb-1">
              <Phone className="w-4 h-4" />
              <span>+1 234 567 890</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>info@studio21.com</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Links</h4>
            <div className="space-y-1 text-gray-400">
              <p>Home</p>
              <p>Services</p>
              <p>Book Now</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Follow Us</h4>
            <div className="flex gap-3">
              <Facebook className="w-5 h-5" />
              <Instagram className="w-5 h-5" />
              <Twitter className="w-5 h-5" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
