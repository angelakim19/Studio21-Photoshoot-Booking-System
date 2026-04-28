"use client"

import { createContext, useContext, useState, ReactNode } from "react"

export type ServiceType = "photoshoot" | "makeup" | "studio-rental" | null

export interface BookingData {
  service: ServiceType
  shootType: string
  duration: string
  addons: string[]
  date: Date | null
  time: string
  notes: string
}

interface BookingContextType {
  step: number
  setStep: (step: number) => void
  bookingData: BookingData
  updateBookingData: (data: Partial<BookingData>) => void
  resetBooking: () => void
  getPrice: () => number
}

const defaultBookingData: BookingData = {
  service: null,
  shootType: "",
  duration: "",
  addons: [],
  date: null,
  time: "",
  notes: "",
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(1)
  const [bookingData, setBookingData] = useState<BookingData>(defaultBookingData)

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }))
  }

  const resetBooking = () => {
    setStep(1)
    setBookingData(defaultBookingData)
  }

  const getPrice = () => {
    let price = 0
    
    // Base price by service
    if (bookingData.service === "photoshoot") {
      price = 150
      if (bookingData.shootType === "portrait") price = 150
      if (bookingData.shootType === "fashion") price = 250
      if (bookingData.shootType === "product") price = 200
      if (bookingData.shootType === "event") price = 350
    } else if (bookingData.service === "makeup") {
      price = 75
      if (bookingData.shootType === "natural") price = 75
      if (bookingData.shootType === "glamour") price = 100
      if (bookingData.shootType === "bridal") price = 150
    } else if (bookingData.service === "studio-rental") {
      price = 100
    }

    // Duration multiplier
    if (bookingData.duration === "2hr") price *= 1.5
    if (bookingData.duration === "half-day") price *= 2.5
    if (bookingData.duration === "full-day") price *= 4

    // Add-ons
    if (bookingData.addons.includes("extra-retouching")) price += 50
    if (bookingData.addons.includes("rush-delivery")) price += 75
    if (bookingData.addons.includes("prints")) price += 100
    if (bookingData.addons.includes("digital-gallery")) price += 40

    return Math.round(price)
  }

  return (
    <BookingContext.Provider value={{ step, setStep, bookingData, updateBookingData, resetBooking, getPrice }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const context = useContext(BookingContext)
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider")
  }
  return context
}
