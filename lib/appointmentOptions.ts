export type AppointmentOption = {
  label: string
  value: string
  price: number
}

export type AppointmentGroup = {
  category: string
  options: AppointmentOption[]
}

export const appointmentOptions: AppointmentGroup[] = [
  {
    category: "Indoor Set Design",
    options: [
      { label: "1 Set", value: "A-1", price: 8500 },
      { label: "2 Sets", value: "A-2", price: 15500 },
      { label: "3 Sets", value: "A-3", price: 22500 },
    ],
  },
  {
    category: "Plain Background",
    options: [
      { label: "1 Set", value: "B-1", price: 6000 },
      { label: "2 Sets", value: "B-2", price: 11000 },
      { label: "3 Sets", value: "B-3", price: 17000 },
    ],
  },
  {
    category: "Outdoor Shoot",
    options: [
      { label: "1 Set", value: "C-1", price: 7500 },
      { label: "2 Sets", value: "C-2", price: 14500 },
      { label: "3 Sets", value: "C-3", price: 21500 },
    ],
  },
  {
    category: "Studio Rental",
    options: [
      { label: "1 Hour", value: "R-1", price: 500 },
      { label: "1 Hour + Backdrop", value: "R-2", price: 700 },
      { label: "Half Day (4 hrs)", value: "R-3", price: 2500 },
      { label: "Full Day (8 hrs)", value: "R-4", price: 5000 },
    ],
  },
]