"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle, Calendar, Clock, Camera, AlertCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useBooking } from "@/lib/booking-context"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
export function BookingStep4() {
  const { bookingData, setStep, getPrice, resetBooking } = useBooking()
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  
  const serviceMap: Record<string, number> = {
    photoshoot: 1,
    makeup: 2,
    "studio-rental": 3
  }

  const handleConfirm = async () => {
    if (!paymentMethod || !referenceNumber) {
      setErrorMessage("Please complete payment details")
      setShowError(true)
      return
    }

    if (!/^\d{12}$/.test(referenceNumber)) {
      setErrorMessage("Reference number must be exactly 12 digits")
      setShowError(true)
      return
    }

    if (paymentMethod === "Other" && !otherPaymentMethod) {
      alert("Please specify your payment method")
      return
    }

    try {
      setIsSubmitting(true)

      // ✅ ADD THIS BLOCK HERE
      const {
        data: { session }
      } = await supabase.auth.getSession()

      const access_token = session?.access_token

      console.log("SESSION:", session)

      if (!access_token) {
        alert("You must be logged in")
        setIsSubmitting(false)
        return
      }

      const localDate = new Date(
        bookingData.date!.getTime() -
        bookingData.date!.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split("T")[0]
      let packageNameSnapshot = bookingData.package_name_snapshot

      if (bookingData.service === "makeup") {
        packageNameSnapshot = "Makeup Service"
      }

      if (bookingData.service === "studio-rental") {
        packageNameSnapshot = "Studio Rental"
      }

      const res = await fetch("/api/availability/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}` // ✅ IMPORTANT
        },
        body: JSON.stringify({
        date: localDate,
        time: bookingData.time,
        duration: bookingData.duration,

        // ✅ REQUIRED
        service_id: serviceMap[bookingData.service!],

        // ✅ depends on service
        package_id: bookingData.packageId || null,
        package_variation_id: bookingData.packageVariationId || null,
        studio_rental_option_id: bookingData.rentalOptionId || null,
        makeup_service_id: bookingData.makeupServiceId || null,

        // ✅ makeup only
        number_of_persons: bookingData.persons || null,

        // ✅ price
        total_price: getPrice(),

        // ✅ snapshots
        package_name_snapshot: packageNameSnapshot,
        package_price_snapshot: bookingData.package_price_snapshot,
        inclusions_snapshot: bookingData.inclusions_snapshot,

        // ✅ notes
        notes: bookingData.notes,

        // ✅ payment
        payment_method:
          paymentMethod === "Other" ? otherPaymentMethod : paymentMethod,
        reference_number: referenceNumber
      })
            })
      
      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Failed to book")
        setIsSubmitting(false)
        return
      }

      setIsSubmitting(false)
      setIsConfirmed(true)

    } catch (err) {
      console.error(err)
      alert("Something went wrong")
      setIsSubmitting(false)
    }
  }
    
  const [paymentMethod, setPaymentMethod] = useState("")
  const [referenceNumber, setReferenceNumber] = useState("")
  const [otherPaymentMethod, setOtherPaymentMethod] = useState("")

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
              Your session has been successfully booked. Please check your Dashboard for the confirmation.

              Thank you for choosing Studio 21!
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
                    <p className="font-medium text-[#1a1a1a]">
                      {new Date(`1970-01-01T${bookingData.time}`).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                      {" - "}
                      {new Date(
                        new Date(`1970-01-01T${bookingData.time}`).getTime() +
                        bookingData.duration * 60 * 60 * 1000
                      ).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
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
                <Link href="/user">View My Bookings</Link>
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
              <p className="font-semibold -[#1a1a1a]">{bookingData.duration} hr/hrs</p>
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
                <p className="font-semibold text-[#1a1a1a]">
                  {new Date(`1970-01-01T${bookingData.time}`).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                  {" - "}
                  {new Date(
                    new Date(`1970-01-01T${bookingData.time}`).getTime() +
                    bookingData.duration * 60 * 60 * 1000
                  ).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
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

          <div className="border-t border-gray-100 pt-6 space-y-5">

            {/* 🔔 DOWNPAYMENT NOTICE */}
            <div className="bg-[#F5F5F5] rounded-xl p-4">
              <p className="text-sm text-[#1a1a1a]">
                A <span className="font-semibold text-[#C8A96A]">50% downpayment</span> is required to secure your booking. 
                The remaining balance will be paid at the studio on your appointment day.
              </p>
              <div className="text-sm space-y-1 border-t pt-3">
                <p className="font-semibold">Payment Details</p>

                <p>
                  <span className="font-medium">GCash:</span> 09266000600
                </p>
                <p className="text-muted-foreground">
                  Account Name: Mark Angelo Flores
                </p>

                <p className="mt-2">
                  <span className="font-medium">BPI:</span> 9011-3386-926
                </p>
                <p className="text-muted-foreground">
                  Account Name: Brent Kyle Tago
                </p>
              </div>
            </div>

            {/* 💳 PAYMENT INPUTS */}
            <div className="grid md:grid-cols-2 gap-3">

              {/* Payment Method */}
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Payment Method
                </label>
                <select
                  className="w-full mt-1 p-3 rounded-xl border border-gray-200"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="">Select method</option>
                  <option value="GCash">GCash</option>
                  <option value="Maya">Maya</option>
                  <option value="BPI">BPI</option>
                  <option value="BDO">BDO</option>
                  <option value="UnionBank">UnionBank</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              {paymentMethod === "Other" && (
                <input
                  type="text"
                  placeholder="Enter payment method"
                  className="w-full mt-7 p-2 rounded-xl border border-gray-200"
                  value={otherPaymentMethod}
                  onChange={(e) => setOtherPaymentMethod(e.target.value)}
                />
              )}

              {/* Reference Number */}
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Reference Number
                </label>
                <input
                  type="text"
                  inputMode="numeric"   
                  maxLength={12}        
                  placeholder="Enter reference number"
                  className="w-full mt-1 p-3 rounded-xl border border-gray-200"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                />
              </div>

            </div>

            {/* 💰 TOTAL */}
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-[#1a1a1a]">Total</span>
              <span className="text-3xl font-bold text-[#C8A96A]">
                ₱{getPrice()}
              </span>
            </div>

            <p className="text-xs text-muted-foreground mt-1">
              Downpayment: ₱{getPrice() * 0.5}
            </p>

          </div>
        </CardContent>
      </Card>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8 flex gap-4">
        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-amber-800">Cancellation Policy</p>
          <p className="text-amber-700 mt-1">
            Appointments are non-cancellable once booked. If you wish to request a cancellation or rescheduling, please visit the studio directly for assistance.
            <br />
            <br />
            If you opted to pay for the appointment in cash, please visit the studio directly. Kindly ensure that the selected payment method and reference number provided are correct. Submission of an incorrect payment method or invalid reference number may result in the automatic cancellation of your appointment.
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

      {showError && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-xl p-6 w-[300px] text-center shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p className="text-sm text-gray-600 mb-4">{errorMessage}</p>

            <button
              onClick={() => setShowError(false)}
              className="px-4 py-2 bg-[#C8A96A] text-white rounded-lg"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  )
}