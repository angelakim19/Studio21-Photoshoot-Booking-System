"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { supabase } from "@/lib/supabaseClient"

export type ServiceType = "photoshoot" | "makeup" | "studio-rental" | null

export interface BookingData {
  service: ServiceType
  serviceType?: ServiceType
  shootType?: string

  duration: number
  addons: string[]
  selectedAddonIds?: string[] // ⭐ ADD

  date: Date | null
  time: string
  notes: string

  packageType?: string
  packageId?: number
  packageVariationId?: number
  rentalOptionId?: number
  makeupServiceId?: number

  sets?: number
  price?: number
  persons?: number
  hmuaPersons?: number

  total_price?: number

  package_name_snapshot?: string
  package_price_snapshot?: number
  inclusions_snapshot?: string
}

interface BookingContextType {
  step: number
  setStep: (step: number) => void
  bookingData: BookingData
  updateBookingData: (data: Partial<BookingData>) => void
  resetBooking: () => void
  getPrice: () => number
}

export const getBookingDraftStorageKey = (userId?: string | null) => {
  return userId ? `bookingDraft:${userId}` : "bookingDraft:guest"
}

const normalizeStoredDuration = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const raw = value.trim().toLowerCase()
    if (raw === "half-day") return 4
    if (raw === "full-day") return 8
    if (raw.endsWith("hr")) {
      const parsed = Number(raw.replace("hr", ""))
      return Number.isFinite(parsed) ? parsed : 0
    }
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

const readStoredBookingDraft = (userId: string | null) => {
  if (typeof window === "undefined") return defaultBookingData
  const raw = localStorage.getItem(getBookingDraftStorageKey(userId))
  if (!raw) return defaultBookingData

  const parsed = JSON.parse(raw)
  if (parsed.date) parsed.date = new Date(parsed.date)
  return {
    ...defaultBookingData,
    ...parsed,
    duration: normalizeStoredDuration(parsed.duration),
  }
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [bookingData, setBookingData] = useState<BookingData>(defaultBookingData)

  useEffect(() => {
    let mounted = true

    const loadUserDraft = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!mounted) return
      const nextUserId = user?.id ?? null
      setCurrentUserId(nextUserId)
      setBookingData(readStoredBookingDraft(nextUserId))
    }

    loadUserDraft()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUserId = session?.user?.id ?? null
      setCurrentUserId(nextUserId)
      setBookingData(readStoredBookingDraft(nextUserId))
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }))
    try {
      const next = { ...bookingData, ...data }
      const toStore = { ...next, date: next.date ? next.date.toISOString() : null }
      if (typeof window !== "undefined") {
        localStorage.setItem(getBookingDraftStorageKey(currentUserId), JSON.stringify(toStore))
      }
    } catch (err) {
      // ignore
    }
  }

  const resetBooking = () => {
    setStep(1)
    setBookingData(defaultBookingData)
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(getBookingDraftStorageKey(currentUserId))
      }
    } catch (err) {}
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
