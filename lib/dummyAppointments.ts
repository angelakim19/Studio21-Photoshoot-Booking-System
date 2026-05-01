export type Appointment = {
  id: number
  name: string
  date: string
  time: string
  duration: number
  endTime: string
  service: string
}

const getEndTime = (time: string, duration: number) => {
  const [h, m] = time.split(":").map(Number)
  const date = new Date()
  date.setHours(h)
  date.setMinutes(m + duration)
  return date.toTimeString().slice(0, 5)
}

export const dummyAppointments: Appointment[] = [
  {
    id: 1,
    name: "John Doe",
    date: "2026-05-01",
    time: "10:00",
    duration: 60,
    endTime: getEndTime("10:00", 60),
    service: "Photoshoot",
  },
  {
    id: 2,
    name: "Jane Smith",
    date: "2026-05-01",
    time: "11:00",
    duration: 60,
    endTime: getEndTime("11:00", 60),
    service: "Graduation",
  },
]