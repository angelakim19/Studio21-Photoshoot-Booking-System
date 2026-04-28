import Link from "next/link"
import Image from "next/image"
import { Mail, Phone, MapPin, Instagram, Facebook } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white/90">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-0McGs7RZl6BZHsb6KgS3JK5SUdnNz1.png"
                alt="Studio 21 Logo"
                width={60}
                height={60}
                className="rounded-full bg-white p-1"
              />
              <div>
                <span className="font-serif text-xl font-semibold text-white">Studio 21</span>
                <span className="block text-xs text-[#C8A96A] tracking-wider">M N&apos; B PHOTOGRAPHY</span>
              </div>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed">
              Professional photography studio offering premium photoshoots, makeup services, and studio rentals in a luxurious setting.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="text-white/60 hover:text-[#C8A96A] transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-[#C8A96A] transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-[#C8A96A] mb-6 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-3 text-sm text-white/60">
              <li>
                <Link href="/#services" className="hover:text-[#C8A96A] transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-[#C8A96A] transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/booking" className="hover:text-[#C8A96A] transition-colors">
                  Book Now
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#C8A96A] transition-colors">
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-[#C8A96A] mb-6 text-sm uppercase tracking-wider">Contact Info</h3>
            <ul className="space-y-4 text-sm text-white/60">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#C8A96A]/10 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-[#C8A96A]" />
                </div>
                <span>(555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#C8A96A]/10 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-[#C8A96A]" />
                </div>
                <span>hello@studio21.com</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#C8A96A]/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 text-[#C8A96A]" />
                </div>
                <span>123 Creative Ave<br />New York, NY 10001</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-[#C8A96A] mb-6 text-sm uppercase tracking-wider">Studio Hours</h3>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex justify-between">
                <span>Mon - Fri</span>
                <span className="text-white/80">9:00 AM - 8:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday</span>
                <span className="text-white/80">10:00 AM - 6:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>
                <span className="text-white/80">11:00 AM - 5:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} Studio 21 M N&apos; B Photography. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-white/40">
            <a href="#" className="hover:text-[#C8A96A] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#C8A96A] transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
