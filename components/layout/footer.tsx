"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link"
import Image from "next/image"
import { Mail, Phone, MapPin, Instagram, Facebook } from "lucide-react"

export function Footer() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  const handleBooking = () => {
    if (!user) {
      setShowPopup(true);
    } else {
      router.push("/booking");
    }
  };

  const [modal, setModal] = useState<"privacy" | "terms" | null>(null)


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
              <a 
                href="https://www.instagram.com/studio21.official_/" 
                target="_blank"
                className="text-white/60 hover:text-[#C8A96A] transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>

              <a 
                href="https://www.facebook.com/profile.php?id=100092244162982" 
                target="_blank"
                className="text-white/60 hover:text-[#C8A96A] transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>

              <a 
                href="https://www.tiktok.com/@studio_twentyone" 
                target="_blank"
                className="text-white/60 hover:text-[#C8A96A] transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M12.5 2c.3 1.7 1.5 3.2 3.2 3.8.8.3 1.7.4 2.5.4v3.2c-1 0-2-.2-2.9-.6v6.2c0 3.1-2.5 5.6-5.6 5.6S4 18.1 4 15s2.5-5.6 5.6-5.6c.4 0 .8 0 1.2.1v3.3c-.4-.2-.8-.3-1.2-.3-1.5 0-2.7 1.2-2.7 2.7s1.2 2.7 2.7 2.7 2.7-1.2 2.7-2.7V2h3.2z"/>
                </svg>
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
                <button
                  onClick={handleBooking}
                  className="hover:text-[#C8A96A] transition-colors text-left"
                >
                  Book Now
                </button>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#C8A96A] transition-colors">
               
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
                <span>0906 150 0095</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#C8A96A]/10 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-[#C8A96A]" />
                </div>
                <span>angelomark9019@gmail.com</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#C8A96A]/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 text-[#C8A96A]" />
                </div>
                <span>P-10 Poblacion Quillo Bldg.<br />Valencia City, Bukidnon</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-[#C8A96A] mb-6 text-sm uppercase tracking-wider">Studio Hours</h3>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex justify-between">
                <span>Mon - Fri</span>
                <span className="text-white/80">8:00 AM - 10:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday</span>
                <span className="text-white/80">7:00 AM - 11:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>
                <span className="text-white/80">7:00 AM - 11:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} Studio 21 M N&apos; B Photography. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-white/40">
            <button
              onClick={() => setModal("privacy")}
              className="hover:text-[#C8A96A] transition-colors"
            >
              Privacy Policy
            </button>

            <button
              onClick={() => setModal("terms")}
              className="hover:text-[#C8A96A] transition-colors"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm text-center shadow-xl">
            
            <h2 className="text-lg font-semibold mb-2 text-[#1a1a1a]">
              Login Required
            </h2>

            <p className="text-sm text-gray-500 mb-6">
              You need to log in first before booking a session.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPopup(false)}
                className="flex-1 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={() => router.push("/login")}
                className="flex-1 py-2 rounded-lg bg-[#C8A96A] text-white hover:bg-[#B8995A]"
              >
                Go to Login
              </button>
            </div>

          </div>
        </div>
      )}          
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

          {/* DARK BACKDROP */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500"
            onClick={() => setModal(null)}
          />

          {/* CONTENT (NO CARD) */}
          <div
            className="relative w-full max-w-3xl px-6 pb-20 text-center text-white animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE */}
            <button
              onClick={() => setModal(null)}
              className="absolute right-6 top-0 text-white/60 hover:text-white text-xl"
            >
              ✕
            </button>

            {modal === "privacy" && (
              <>
                <h2 className="text-3xl font-serif mb-6">Privacy Policy</h2>
                <p className="text-white/80 leading-relaxed space-y-4">
                  Your privacy matters to us. Studio 21 is committed to protecting the information you share when using our website and booking services.
                  <br /><br />

                  We collect only the necessary details required to process your bookings, including your name, contact information, and session preferences. 
                  This information allows us to provide a smooth and personalized experience.
                  <br /><br />

                  Your data is handled with care and will never be sold or shared with third parties without your consent, unless required by law or necessary to complete your requested service.
                  <br /><br />

                  We implement appropriate security measures to protect your information and ensure it remains confidential.
                  <br /><br />

                  By using our platform, you agree to the collection and use of your information in accordance with this policy.
                </p>
              </>
            )}

            {modal === "terms" && (
              <>
                <h2 className="text-3xl font-serif mb-6">Terms of Service</h2>
                <p className="text-white/80 leading-relaxed space-y-4">
                  By using Studio 21’s services, you agree to provide accurate and complete booking information.
                  <br /><br />

                  All bookings are subject to availability and confirmation. Clients are expected to follow agreed schedules to ensure a smooth session.
                  <br /><br />

                  Studio 21 reserves the right to manage, reschedule, or cancel bookings when necessary, including cases of unforeseen circumstances or policy violations.
                  <br /><br />

                  Clients are responsible for respecting studio rules, equipment, and staff during sessions.
                  <br /><br />

                  Continued use of our services indicates your agreement to these terms and any future updates.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </footer >
  )
}
