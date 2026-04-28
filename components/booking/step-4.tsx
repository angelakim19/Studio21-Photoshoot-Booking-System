"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle, Calendar, Clock, Camera, AlertCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useBooking } from "@/lib/booking-context"

export function BookingStep4() {
  const { bookingData, setStep, getPrice, resetBooking } = useBooking()
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsConfirmed(true)
  }

  if (isConfirmed) {
    return (
      <div className="max-w-lg mx-auto text-center">
        <Card className="border-gray-100 shadow-lg">
          <CardContent className="pt-10 pb-10">
            <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h1 className="font-serif text-3xl font-semibold mb-3 text-[#1a1a1a]">Booking Confirmed!</h1>
            <p className="text-muted-foreground mb-8">
              Your session has been successfully booked. We&apos;ve sent a confirmation email with all the details.
            </p>
            
            <div className="bg-[#F5F5F5] rounded-2xl p-6 mb-8 text-left">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#C8A96A]/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-[#C8A96A]" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="font-medium text-[#1a1a1a]">
                      {bookingData.date?.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#C8A96A]/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-[#C8A96A]" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Time</p>
                    <p className="font-medium text-[#1a1a1a]">{bookingData.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#C8A96A]/10 flex items-center justify-center">
                    <Camera className="h-5 w-5 text-[#C8A96A]" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Service</p>
                    <p className="font-medium text-[#1a1a1a] capitalize">{bookingData.service?.replace("-", " ")}</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-8">
              Booking Reference: <span className="font-mono font-semibold text-[#1a1a1a]">STD-{Date.now().toString().slice(-8)}</span>
            </p>

            <div className="flex flex-col gap-3">
              <Button asChild className="bg-[#C8A96A] hover:bg-[#B8995A] text-white h-12">
                <Link href="/dashboard">View My Bookings</Link>
              </Button>
              <Button variant="outline" onClick={resetBooking} asChild className="border-gray-200 hover:border-[#C8A96A] h-12">
                <Link href="/booking">Book Another Session</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <span className="text-[#C8A96A] text-sm font-medium uppercase tracking-wider">Step 4 of 4</span>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold mt-2 mb-3 text-[#1a1a1a]">
          Confirm Your Booking
        </h1>
        <p className="text-muted-foreground">
          Please review your booking details before confirming
        </p>
      </div>

      <Card className="mb-6 border-gray-100 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-[#1a1a1a] flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#C8A96A]" />
            Booking Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#F5F5F5] rounded-xl p-4">
              <h3 className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Service</h3>
              <p className="font-semibold capitalize text-[#1a1a1a]">{bookingData.service?.replace("-", " ")}</p>
              <p className="text-sm text-muted-foreground capitalize">{bookingData.shootType}</p>
            </div>
            <div className="bg-[#F5F5F5] rounded-xl p-4">
              <h3 className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Duration</h3>
              <p className="font-semibold capitalize text-[#1a1a1a]">{bookingData.duration}</p>
            </div>
            <div className="bg-[#F5F5F5] rounded-xl p-4">
              <h3 className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Date</h3>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#C8A96A]" />
                <p className="font-semibold text-[#1a1a1a]">
                  {bookingData.date?.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="bg-[#F5F5F5] rounded-xl p-4">
              <h3 className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Time</h3>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#C8A96A]" />
                <p className="font-semibold text-[#1a1a1a]">{bookingData.time}</p>
              </div>
            </div>
          </div>

          {bookingData.addons.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Add-ons</h3>
              <div className="flex flex-wrap gap-2">
                {bookingData.addons.map((addon) => (
                  <span key={addon} className="inline-flex items-center gap-1.5 text-sm bg-[#C8A96A]/10 text-[#C8A96A] px-3 py-1.5 rounded-full font-medium">
                    <CheckCircle className="h-3.5 w-3.5" />
                    {addon.replace("-", " ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {bookingData.notes && (
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Special Requests</h3>
              <p className="text-sm bg-[#F5F5F5] p-4 rounded-xl text-[#1a1a1a]">{bookingData.notes}</p>
            </div>
          )}

          <div className="border-t border-gray-100 pt-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-[#1a1a1a]">Total</span>
              <span className="text-3xl font-bold text-[#C8A96A]">${getPrice()}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Payment will be collected at the studio</p>
          </div>
        </CardContent>
      </Card>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8 flex gap-4">
        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-amber-800">Cancellation Policy</p>
          <p className="text-amber-700 mt-1">
            Free cancellation up to 24 hours before your appointment. 
            Cancellations within 24 hours may be subject to a fee.
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" size="lg" onClick={() => setStep(3)} className="border-gray-200 hover:border-[#C8A96A] hover:bg-[#C8A96A]/5 h-12 px-6">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </Button>
        <Button 
          size="lg" 
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="bg-[#C8A96A] hover:bg-[#B8995A] text-white px-8 h-12"
        >
          {isSubmitting ? "Confirming..." : "Confirm Booking"}
        </Button>
      </div>
    </div>
  )
}
