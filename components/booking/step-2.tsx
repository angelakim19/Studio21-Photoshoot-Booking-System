"use client"
import { useEffect, useState } from "react";
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
  { value: "portrait", label: "Family Portrait Photoshoot" },
  { value: "fashion", label: "Fashion & Editorial Photoshoot" },
  { value: "product", label: "Product Photoshoot" },
  { value: "event", label: "Event Coverage" },
  { value: "graduation", label: "Graduation Photoshoot" },
  { value: "fun", label: "Fun Photoshoot" },
  { value: "birthday", label: "Birthday Photoshoot" },
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

const photoPackages = [
  {
    type: "Indoor-Set-Sesign",
    label: "Package A — Indoor Set Design",
    inclusions: [
      "Photographer",
      "Hair & Makeup",
      "Creative Direction",
      "Studio Use",
      "Set Design",
      "Soft Copy (20–150 edited photos)"
    ],
    options: [
      { sets: 1, price: 8500 },
      { sets: 2, price: 15500 },
      { sets: 3, price: 22500 }
    ]
  },
  {
    type: "Plain-Background",
    label: "Package B — Plain Background",
    inclusions: [
      "Photographer",
      "Hair & Makeup",
      "Creative Direction",
      "Studio Use",
      "Soft Copy (20–150 edited photos)"
    ],
    options: [
      { sets: 1, price: 6000 },
      { sets: 2, price: 11000 },
      { sets: 3, price: 17000 }
    ]
  },
  {
    type: "Outdoor",
    label: "Package C — Outdoor Shoot",
    inclusions: [
      "Photographer",
      "Hair & Makeup",
      "Creative Direction",
      "Soft Copy (20–150 edited photos)"
    ],
    options: [
      { sets: 1, price: 7500 },
      { sets: 2, price: 14500 },
      { sets: 3, price: 21500 }
    ]
  }
]

const rentalAddons = [
  {
    value: "photographer",
    label: "Photographer",
    price: "+₱1,500",
    description: "Professional photographer included"
  },
  {
    value: "hmua",
    label: "Hair and Makeup Artist",
    price: "+₱1,200",
    description: "Includes basic glam setup"
  },
]

const rentalPackages = [
  {
    label: "1 Hour",
    duration: 1,
    options: [
      { type: "basic", label: "Basic Setup", price: 500 },
      { type: "full", label: "With Backdrop", price: 700 }
    ]
  },
  {
    label: "2 Hours",
    duration: 2,
    options: [
      { type: "basic", label: "Basic Setup", price: 1000 },
      { type: "full", label: "With Backdrop", price: 1400 }
    ]
  },
  {
    label: "3 Hours",
    duration: 3,
    options: [
      { type: "basic", label: "Basic Setup", price: 1500 },
      { type: "full", label: "With Backdrop", price: 2100 }
    ]
  },
  {
    label: "Half Day (4 hrs)",
     duration: 4,
    options: [
      { type: "full", label: "With Backdrop", price: 2500 }
    ]
  },
  {
    label: "Full Day (8 hrs)",
    duration: 8,
    options: [
      { type: "full", label: "With Backdrop", price: 5000 }
    ]
  }
]

const packageIdMap: Record<string, number> = {
  "Indoor-Set-Sesign": 1,
  "Plain-Background": 2,
  "Outdoor": 3
}

const rentalOptionMap: Record<string, number> = {
  basic: 1,
  backdrop: 2
}

export function BookingStep2() {
  const { bookingData, updateBookingData, setStep, getPrice } = useBooking()

  useEffect(() => {
    if (bookingData.service === "makeup" && !bookingData.duration) {
      updateBookingData({
        duration: 1,
        persons: 1
      })
    }
  }, [bookingData.service])

  const currentShootTypes = bookingData.service ? shootTypes[bookingData.service] : []

  const handleAddonToggle = (addon: string) => {
    let newAddons

    if (bookingData.addons.includes(addon)) {
      newAddons = bookingData.addons.filter((a) => a !== addon)

      // reset hmua persons when removed
      if (addon === "hmua") {
        updateBookingData({ addons: newAddons, hmuaPersons: 1 })
        return
      }
    } else {
      newAddons = [...bookingData.addons, addon]
    }

    updateBookingData({ 
      addons: newAddons,
      selectedAddonIds: newAddons // ⭐ ADD
    })
  }

const handleNext = () => {
    updateBookingData({
      serviceType: bookingData.service // ✅ NEW (safe)
    })

    if (bookingData.service === "photoshoot") {
      if (bookingData.packageType && bookingData.sets) {
        setStep(3)
      }
    } else {
      if (bookingData.shootType) {
        setStep(3)
      }
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
              {/* Types of session (shared) */}
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

         {/* ================= MAKEUP LOGIC ================= */} 
              {bookingData.service === "makeup" && (
                <>
                  {/* Number of Persons */}
                  <div className="space-y-2">
                    <Label className="text-[#1a1a1a]">Number of Persons</Label>

                    <Select
                      value={bookingData.persons?.toString()}
                      onValueChange={(value) => {
                        const persons = parseInt(value)

                        updateBookingData({
                          persons,
                          duration: persons,
                          makeupServiceId: 1 // ⭐ since isa lang
                        })
                      }}
                    >
                      <SelectTrigger className="h-12 border-gray-200 focus:border-[#C8A96A] focus:ring-[#C8A96A]">
                        <SelectValue placeholder="Select number of persons" />
                      </SelectTrigger>

                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? "Person" : "Persons"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Notes for Makeup */}
                  <div className="space-y-2">
                    <Label className="text-[#1a1a1a]">
                      Describe your desired look, style, or any special request
                    </Label>
                    <Textarea
                      placeholder="Tell us more..."
                      value={bookingData.notes}
                      onChange={(e) => updateBookingData({ notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                </>
              )}
                            
         {/* ================= PHOTOSHOOT LOGIC ================= */} 
            {bookingData.service === "photoshoot" && (
              <div className="space-y-2">
                <Label className="text-[#1a1a1a]">
                  Describe your Photoshoot Inspo and Location if Outdoor
                </Label>
                <Textarea
                  placeholder="Tell us more..."
                  value={bookingData.notes}
                  onChange={(e) => updateBookingData({ notes: e.target.value })}
                  rows={3}
                  className="border-gray-200 focus:border-[#C8A96A] focus:ring-[#C8A96A]"
                />
              </div>
            )}
            </CardContent>
          </Card>
          {bookingData.service === "photoshoot" ? (
            <Card className="border-gray-100 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-[#1a1a1a]">Packages</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Note: Outfits are not included
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {photoPackages.map((pkg) => (
                  <div key={pkg.type} className="border rounded-xl p-4 space-y-3">

                    <p className="font-semibold text-[#1a1a1a]">{pkg.label}</p>

                    <ul className="text-sm text-muted-foreground list-disc pl-5">
                      {pkg.inclusions.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>

                    <div className="space-y-2">
                      {pkg.options.map((opt) => {
                        const isSelected =
                          bookingData.packageType === pkg.type &&
                          bookingData.sets === opt.sets

                        return (
                          <div
                            key={opt.sets}
                            onClick={() =>
                              updateBookingData({
                                packageType: pkg.type,

                                // ✅ FIXED
                                packageId: packageIdMap[pkg.type],
                                packageVariationId: opt.sets,

                                sets: opt.sets,
                                price: opt.price,
                                total_price: opt.price, // ✅ IMPORTANT

                                duration: opt.sets * 2,
                                addons: [],

                                // ✅ SNAPSHOTS
                                package_name_snapshot: pkg.label,
                                package_price_snapshot: opt.price,
                                inclusions_snapshot: pkg.inclusions.join(", ")
                              })
                            }
                            className={`
                              flex justify-between items-center p-3 rounded-lg border cursor-pointer transition
                              ${
                                isSelected
                                  ? "border-[#C8A96A] bg-[#C8A96A]/5"
                                  : "border-gray-200 hover:border-[#C8A96A]/50"
                              }
                            `}
                          >
                            <span className="text-sm font-medium">
                              {opt.sets} Set{opt.sets > 1 ? "s" : ""}
                            </span>
                            <span className="text-sm font-semibold text-[#C8A96A]">
                              ₱{opt.price.toLocaleString()}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

          ) : bookingData.service === "makeup" ? null : bookingData.service === "studio-rental" ? ( 

            <>
              {/* ✅ NEW — RENTAL DURATION (SAME STYLE AS PACKAGES) */}
              <Card className="border-gray-100 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-[#1a1a1a]">Rental Duration</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {rentalPackages.map((pkg) => (
                    <div key={pkg.label} className="border rounded-xl p-4 space-y-3">

                      <p className="font-semibold text-[#1a1a1a]">{pkg.label}</p>

                      <div className="space-y-2">
                        {pkg.options.map((opt) => {
                          const isSelected =
                            bookingData.duration === pkg.duration &&
                            bookingData.shootType === opt.type

                          return (
                            <div
                              key={opt.type}
                              onClick={() =>
                                updateBookingData({
                                  duration: pkg.duration,
                                  shootType: opt.type,
                                  // ✅ FIXED
                                   rentalOptionId: rentalOptionMap[opt.type],
                                  price: opt.price,
                                  addons: []
                                })
                              }
                              className={`
                                flex justify-between items-center p-3 rounded-lg border cursor-pointer transition
                                ${
                                  isSelected
                                    ? "border-[#C8A96A] bg-[#C8A96A]/5"
                                    : "border-gray-200 hover:border-[#C8A96A]/50"
                                }
                              `}
                            >
                              <span className="text-sm font-medium">
                                {opt.label}
                              </span>
                              <span className="text-sm font-semibold text-[#C8A96A]">
                                ₱{opt.price.toLocaleString()}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

          {/* YOUR EXISTING ADD-ONS (UNCHANGED) */}
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[#1a1a1a]">Add-ons</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              {rentalAddons.map((addon) => (
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
                      <span className="text-sm font-semibold text-[#C8A96A]">
                        {addon.price}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {addon.description}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          {bookingData.service === "studio-rental" &&
            bookingData.addons.includes("hmua") && (
              <Card className="border-gray-100 shadow-sm">
                <CardContent className="space-y-2 pt-4">
                  <Label className="text-[#1a1a1a]">
                    Number of Persons for Hair & Makeup
                  </Label>

                  <Select
                    value={bookingData.hmuaPersons?.toString()}
                    onValueChange={(value) =>
                      updateBookingData({
                        hmuaPersons: parseInt(value)
                      })
                    }
                  >
                    <SelectTrigger className="h-12 border-gray-200 focus:border-[#C8A96A] focus:ring-[#C8A96A]">
                      <SelectValue placeholder="Select number of persons" />
                    </SelectTrigger>

                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "Person" : "Persons"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}
        </>

      ) : null}
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
                    {bookingData.service === "photoshoot" && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Package</span>
                        <span className="font-medium text-[#1a1a1a]">
                          {bookingData.packageType
                            ? bookingData.packageType.replace("-", " ")
                            : "-"}
                        </span>
                      </div>
                    )}
                    {bookingData.service === "photoshoot" && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sets</span>
                        <span className="font-medium text-[#1a1a1a]">
                          {bookingData.sets ? `${bookingData.sets} set(s)` : "-"}
                        </span>
                      </div>
                    )}
                    {bookingData.addons.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Add-ons</span>
                        <span className="font-medium text-[#1a1a1a]">{bookingData.addons.length} selected</span>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-[#1a1a1a]">Estimated Total</span>
                      <span className="text-2xl font-bold text-[#C8A96A]">
                        ₱ {getPrice().toLocaleString()}
                      </span>
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
          disabled={
            bookingData.service === "photoshoot"
              ? !bookingData.packageType || !bookingData.sets
              : bookingData.service === "studio-rental"
              ? !bookingData.price
              : bookingData.service === "makeup"
              ? !bookingData.shootType || !bookingData.persons
              : !bookingData.shootType
          }
          className="bg-[#C8A96A] hover:bg-[#B8995A] text-white px-8 h-12"
        >
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
