"use client"

import { useState } from "react"
import { Pencil, Trash2, Plus } from "lucide-react"
import { appointmentOptions } from "@/lib/appointmentOptions"
import EditAppointmentDialog from "@/components/admin/EditAppointmentDialog"

type Status = "approved" | "pending" | "cancelled"

type Appointment = {
  id: number
  name: string
  date: string
  time: string
  duration: number
  service: string
  addons: {
    photographer: boolean
    makeup: boolean
  }
  totalPrice: number
  status: Status
}

const statusStyles: Record<Status, string> = {
  approved:  "bg-green-100 text-green-800",
  pending:   "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
}

const getEndTime = (time: string, duration: number) => {
  if (!time) return ""
  const [h, m] = time.split(":").map(Number)
  const d = new Date()
  d.setHours(h)
  d.setMinutes(m + duration)
  return d.toTimeString().slice(0, 5)
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [form, setForm] = useState({
    name: "",
    date: "",
    time: "",
    duration: 60,
    service: "",
    addons: { photographer: false, makeup: false },
    notes: "",
  })

  const openAdd = () => {
    setEditingId(null)
    setForm({ name: "", date: "", time: "", duration: 60, service: "", addons: { photographer: false, makeup: false }, notes: "" })
    setOpen(true)
  }

  const openEdit = (app: Appointment) => {
    setEditingId(app.id)
    setForm({
      name: app.name,
      date: app.date,
      time: app.time,
      duration: app.duration,
      service: app.service,
      addons: app.addons,
      notes: "",
    })
    setOpen(true)
  }

  const handleSave = () => {
    const selectedService = appointmentOptions.flatMap(g => g.options).find(opt => opt.value === form.service)
    const basePrice = selectedService?.price || 0
    const addonsPrice = (form.addons.photographer ? 1500 : 0) + (form.addons.makeup ? 1200 : 0)
    const totalPrice = basePrice + addonsPrice

    const existing = appointments.find(a => a.id === editingId)

    const newAppointment: Appointment = {
      id: editingId ?? Date.now(),
      name: form.name,
      date: form.date,
      time: form.time,
      duration: form.duration,
      service: form.service,
      addons: form.addons,
      totalPrice,
      status: existing?.status ?? "pending",
    }

    if (editingId) {
      setAppointments(prev => prev.map(a => (a.id === editingId ? newAppointment : a)))
    } else {
      setAppointments(prev => [...prev, newAppointment])
    }
    setOpen(false)
  }

  const handleDelete = (id: number) => {
    setAppointments(prev => prev.filter(a => a.id !== id))
  }

  const handleStatusChange = (id: number, status: Status) => {
    setAppointments(prev => prev.map(a => (a.id === id ? { ...a, status } : a)))
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Appointments</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#C8A96A] px-4 py-2 rounded text-black"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Client</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Time</th>
              <th className="p-3 text-left">Service</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(app => (
              <tr key={app.id} className="border-t">
                <td className="p-3">{app.name}</td>
                <td className="p-3">{app.date}</td>
                <td className="p-3">{app.time} – {getEndTime(app.time, app.duration)}</td>
                <td className="p-3">{app.service}</td>
                <td className="p-3 font-medium text-[#C8A96A]">₱{app.totalPrice.toLocaleString()}</td>

                {/* STATUS DROPDOWN */}
                <td className="p-3">
                  <select
                    value={app.status}
                    onChange={e => handleStatusChange(app.id, e.target.value as Status)}
                    className={`text-xs font-semibold px-3 py-1 rounded-full border-0 outline-none cursor-pointer appearance-none ${statusStyles[app.status]}`}
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>

                <td className="p-3 flex gap-3">
                  <button onClick={() => openEdit(app)} className="text-[#C8A96A]">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(app.id)} className="text-red-500">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ EXTERNAL DIALOG */}
      <EditAppointmentDialog
        open={open}
        onClose={() => setOpen(false)}
        form={form}
        setForm={setForm}
        onSave={handleSave}
      />

    </div>
  )
}