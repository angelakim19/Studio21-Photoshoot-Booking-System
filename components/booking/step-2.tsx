"use client"

import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { useBooking } from "@/lib/booking-context"

const shootTypes = {
  photoshoot: [
    { value: "portrait", label: "Portrait Photography" },
    { value: "fashion", label: "Fashion & Editorial" },
    { value: "product", label: "Product Photography" },
    { value: "event", label: "Event Coverage" },
  ],
  makeup: [
    { value: "natural", label: "Natural/Everyday Look" },
    { value: "glamour", label: "Glamour/Evening" },
    { value: "bridal", label: "Bridal Makeup" },
  ],
  "studio-rental": [
    { value: "basic", label: "Basic Setup" },
    { value: "full", label: "Full Equipment Access" },
  ],
}

const durations = [
  { value: "1hr", label: "1 Hour" },
  { value: "2hr", label: "2 Hours" },
  { value: "half-day", label: "Half Day (4 Hours)" },
  { value: "full-day", label: "Full Day (8 Hours)" },
]

const addons = [
  { value: "extra-retouching", label: "Extra Retouching", price: "+$50", description: "Additional post-processing" },
  { value: "rush-delivery", label: "Rush Delivery", price: "+$75", description: "Get your photos within 24 hours" },
  { value: "prints", label: "Print Package", price: "+$100", description: "10 professional prints included" },
  { value: "digital-gallery", label: "Digital Gallery", price: "+$40", description: "Online gallery for sharing" },
]

export function BookingStep2() {
  const { bookingData, updateBookingData, setStep, getPrice } = useBooking()

  const currentShootTypes = bookingData.service ? shootTypes[bookingData.service] : []

  const handleAddonToggle = (addon: string) => {
    const newAddons = bookingData.addons.includes(addon)
      ? bookingData.addons.filter((a) => a !== addon)
      : [...bookingData.addons, addon]
    updateBookingData({ addons: newAddons })
  }

  const handleNext = () => {
    if (bookingData.shootType && bookingData.duration) {
      setStep(3)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <span className="text-[#C8A96A] text-sm font-medium uppercase tracking-wider">Step 2 of 4</span>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold mt-2 mb-3 text-[#1a1a1a]">
          Booking Details
        </h1>
        <p className="text-muted-foreground">
          Customize your session to fit your needs
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[#1a1a1a]">Session Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="shootType" className="text-[#1a1a1a]">Type of Session</Label>
                <Select
                  value={bookingData.shootType}
                  onValueChange={(value) => updateBookingData({ shootType: value })}
                >
                  <SelectTrigger id="shootType" className="h-12 border-gray-200 focus:border-[#C8A96A] focus:ring-[#C8A96A]">
                    <SelectValue placeholder="Select session type" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentShootTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-[#1a1a1a]">Duration</Label>
                <Select
                  value={bookingData.duration}
                  onValueChange={(value) => updateBookingData({ duration: value })}
                >
                  <SelectTrigger id="duration" className="h-12 border-gray-200 focus:border-[#C8A96A] focus:ring-[#C8A96A]">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {durations.map((duration) => (
                      <SelectItem key={duration.value} value={duration.value}>
                        {duration.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-[#1a1a1a]">Special Requests (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requirements or notes for your session..."
                  value={bookingData.notes}
                  onChange={(e) => updateBookingData({ notes: e.target.value })}
                  rows={3}
                  className="border-gray-200 focus:border-[#C8A96A] focus:ring-[#C8A96A]"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[#1a1a1a]">Add-ons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {addons.map((addon) => (
                <div 
                  key={addon.value}
                  className={`
                    flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${bookingData.addons.includes(addon.value) 
                      ? "border-[#C8A96A] bg-[#C8A96A]/5" 
                      : "border-gray-100 hover:border-[#C8A96A]/50"
                    }
                  `}
                  onClick={() => handleAddonToggle(addon.value)}
                >
                  <Checkbox 
                    checked={bookingData.addons.includes(addon.value)}
                    onCheckedChange={() => handleAddonToggle(addon.value)}
                    className="mt-0.5 border-gray-300 data-[state=checked]:bg-[#C8A96A] data-[state=checked]:border-[#C8A96A]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-[#1a1a1a]">{addon.label}</p>
                      <span className="text-sm font-semibold text-[#C8A96A]">{addon.price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{addon.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-4 border-gray-100 shadow-md bg-[#F5F5F5]">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[#1a1a1a]">Price Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service</span>
                  <span className="capitalize font-medium text-[#1a1a1a]">{bookingData.service?.replace("-", " ") || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="capitalize font-medium text-[#1a1a1a]">{bookingData.shootType || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium text-[#1a1a1a]">{bookingData.duration || "-"}</span>
                </div>
                {bookingData.addons.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Add-ons</span>
                    <span className="font-medium text-[#1a1a1a]">{bookingData.addons.length} selected</span>
                  </div>
                )}
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#1a1a1a]">Estimated Total</span>
                  <span className="text-2xl font-bold text-[#C8A96A]">${getPrice()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-between mt-10">
        <Button variant="outline" size="lg" onClick={() => setStep(1)} className="border-gray-200 hover:border-[#C8A96A] hover:bg-[#C8A96A]/5 h-12 px-6">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </Button>
        <Button 
          size="lg" 
          onClick={handleNext}
          disabled={!bookingData.shootType || !bookingData.duration}
          className="bg-[#C8A96A] hover:bg-[#B8995A] text-white px-8 h-12"
        >
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
