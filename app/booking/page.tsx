"use client"

import Link from "next/link"
import Image from "next/image"
import { useBooking } from "@/lib/booking-context"
import { BookingStep1 } from "@/components/booking/step-1"
import { BookingStep2 } from "@/components/booking/step-2"
import { BookingStep3 } from "@/components/booking/step-3"
import { BookingStep4 } from "@/components/booking/step-4"
import { Check } from "lucide-react"

const steps = [
  { number: 1, title: "Service" },
  { number: 2, title: "Details" },
  { number: 3, title: "Schedule" },
  { number: 4, title: "Confirm" },
]

export default function BookingPage() {
  const { step } = useBooking()

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/favicon.png"
                  alt="Studio 21 Logo"
                  width={45}
                  height={45}
                  className="rounded-full"
                />
              <span className="font-serif text-xl font-semibold text-[#1a1a1a]">Studio 21</span>
            </Link>
            <span className="text-sm text-muted-foreground font-medium">Book a Session</span>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-[#F5F5F5] border-b border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            {steps.map((s, index) => (
              <div key={s.number} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div 
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                      ${step > s.number 
                        ? "bg-[#C8A96A] text-white" 
                        : step === s.number
                        ? "bg-[#C8A96A] text-white ring-4 ring-[#C8A96A]/20" 
                        : "bg-white text-muted-foreground border-2 border-gray-200"
                      }
                    `}
                  >
                    {step > s.number ? <Check className="h-5 w-5" /> : s.number}
                  </div>
                  <span className={`
                    hidden sm:block text-sm font-medium
                    ${step >= s.number ? "text-[#1a1a1a]" : "text-muted-foreground"}
                  `}>
                    {s.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    w-8 md:w-16 h-0.5 mx-2 md:mx-4 rounded-full transition-all
                    ${step > s.number ? "bg-[#C8A96A]" : "bg-gray-200"}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 container mx-auto px-4 py-10">
        {step === 1 && <BookingStep1 />}
        {step === 2 && <BookingStep2 />}
        {step === 3 && <BookingStep3 />}
        {step === 4 && <BookingStep4 />}
      </main>
    </div>
  )
}
