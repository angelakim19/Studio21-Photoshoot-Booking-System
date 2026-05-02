"use client"

import { createContext, useContext, useState, ReactNode } from "react"

export type ServiceType = "photoshoot" | "makeup" | "studio-rental" | null

export interface BookingData {
  service: ServiceType
  shootType: string

  duration: number

  addons: string[]
  date: Date | null
  time: string
  notes: string

  // NEW (for photoshoot packages)
  packageType?: string
  sets?: number
  price?: number
  persons?: number
  hmuaPersons?: number
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
  duration: 0,
  addons: [],
  date: null,
  time: "",
  notes: "",
  // NEW
  packageType: "",
  sets: 0,
  price: 0,
  persons: 1,
  hmuaPersons: 1
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
  // MAKEUP
    if (bookingData.service === "makeup") {
      const pricePerPerson = 1200
      const persons = bookingData.persons || 0
      return pricePerPerson * persons
    }

    // PHOTOSHOOT
    if (bookingData.service === "photoshoot") {
      return bookingData.price || 0
    }

    // STUDIO RENTAL
    if (bookingData.service === "studio-rental") {
      let price = bookingData.price || 0

      if (bookingData.addons.includes("photographer")) {
        price += 1500
      }

      if (bookingData.addons.includes("hmua")) {
        const persons = bookingData.hmuaPersons || 1
        price += persons * 1200
      }

      return price
    }
    return 0
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
