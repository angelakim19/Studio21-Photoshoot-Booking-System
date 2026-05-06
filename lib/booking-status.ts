export type BookingUiStatus = "approved" | "pending" | "cancelled"

export const normalizeBookingStatus = (raw: string | null | undefined): BookingUiStatus => {
  const value = (raw || "").toLowerCase().trim()

  if (value === "approved" || value === "confirmed") {
    return "approved"
  }

  if (value === "cancelled") {
    return "cancelled"
  }

  return "pending"
}
