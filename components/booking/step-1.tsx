"use client"

import { ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useBooking, ServiceType } from "@/lib/booking-context"
import { bookingServices } from "@/lib/booking-services"

export function BookingStep1() {
  const { bookingData, updateBookingData, setStep } = useBooking()

  const handleServiceSelect = (serviceId: ServiceType) => {
    updateBookingData({ service: serviceId, shootType: "", duration: "", addons: [] })
  }

  const handleNext = () => {
    if (bookingData.service) {
      setStep(2)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <span className="text-[#C8A96A] text-sm font-medium uppercase tracking-wider">Step 1 of 4</span>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold mt-2 mb-3 text-[#1a1a1a]">
          Choose Your Service
        </h1>
        <p className="text-muted-foreground">
          Select the type of service you&apos;d like to book
        </p>
      </div>

      <div className="grid gap-5">
        {bookingServices.map((service) => (
          <Card 
            key={service.id}
            className={`
              cursor-pointer transition-all duration-200 border-2
              ${bookingData.service === service.id 
                ? "border-[#C8A96A] bg-[#C8A96A]/5 shadow-lg" 
                : "border-gray-100 hover:border-[#C8A96A]/50 hover:shadow-md"
              }
            `}
            onClick={() => handleServiceSelect(service.id)}
          >
            <CardHeader className="p-6">
              <div className="flex items-start gap-5">
                <div className={`
                  w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors
                  ${bookingData.service === service.id 
                    ? "bg-[#C8A96A] text-white" 
                    : "bg-[#C8A96A]/10 text-[#C8A96A]"
                  }
                `}>
                  <service.icon className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="font-serif text-xl text-[#1a1a1a]">{service.title}</CardTitle>
                      <CardDescription className="mt-1.5 leading-relaxed">{service.description}</CardDescription>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {service.features.map((feature) => (
                          <span key={feature} className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded-full">
                            <Check className="h-3 w-3 text-[#C8A96A]" />
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-semibold text-[#C8A96A]">{service.price}</span>
                      <div className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center mt-3 ml-auto transition-colors
                        ${bookingData.service === service.id 
                          ? "border-[#C8A96A] bg-[#C8A96A]" 
                          : "border-gray-300"
                        }
                      `}>
                        {bookingData.service === service.id && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="flex justify-end mt-10">
        <Button 
          size="lg" 
          onClick={handleNext}
          disabled={!bookingData.service}
          className="bg-[#C8A96A] hover:bg-[#B8995A] text-white px-8 h-12"
        >
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
