import type { LucideIcon } from "lucide-react"
import { Building, Camera, Palette } from "lucide-react"

export type BookingServiceId = "photoshoot" | "makeup" | "studio-rental"

export interface BookingService {
  id: BookingServiceId
  icon: LucideIcon
  title: string
  description: string
  price: string
  features: string[]
}

export const bookingServices: BookingService[] = [
  {
    id: "photoshoot",
    icon: Camera,
    title: "Professional Photoshoot",
    description:
      "High-quality photography with professional lighting and equipment. Perfect for portfolios, headshots, and creative projects.",
    price: "From $150",
    features: ["Professional lighting", "Multiple backdrops", "Edited photos included"],
  },
  {
    id: "makeup",
    icon: Palette,
    title: "Makeup Services",
    description:
      "Expert makeup artists to ensure you look your absolute best. Available as standalone service or add-on to any shoot.",
    price: "From $75",
    features: ["Professional products", "Consultation included", "Touch-up kit"],
  },
  {
    id: "studio-rental",
    icon: Building,
    title: "Studio Rental",
    description:
      "Rent our fully-equipped studio space for your own projects. Includes lighting equipment and backdrop options.",
    price: "From $100/hr",
    features: ["Full equipment access", "Flexible hours", "Private space"],
  },
]