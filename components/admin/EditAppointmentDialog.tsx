"use client"

import { appointmentOptions } from "@/lib/appointmentOptions"

type FormType = {
  name: string
  date: string
  time: string
  duration: number
  service: string
  addons: {
    photographer: boolean
    makeup: boolean
  }
  notes?: string
}

type Props = {
  open: boolean
  onClose: () => void
  form: FormType
  setForm: (form: FormType) => void
  onSave: () => void
}

const getEndTime = (time: string, duration: number) => {
  if (!time) return ""
  const [h, m] = time.split(":").map(Number)
  const d = new Date()
  d.setHours(h)
  d.setMinutes(m + duration)
  return d.toTimeString().slice(0, 5)
}

export default function EditAppointmentDialog({
  open,
  onClose,
  form,
  setForm,
  onSave,
}: Props) {
  if (!open) return null

  const endTime = getEndTime(form.time, form.duration)

  const selectedService = appointmentOptions
    .flatMap(g => g.options)
    .find(opt => opt.value === form.service)

  const basePrice = selectedService?.price || 0
  const addonsPrice =
    (form.addons.photographer ? 1500 : 0) +
    (form.addons.makeup ? 1200 : 0)
  const totalPrice = basePrice + addonsPrice

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white w-[420px] rounded-2xl shadow-xl p-6 space-y-5">

        {/* HEADER */}
        <div>
          <h2 className="text-xl font-semibold text-black">Appointment</h2>
          <p className="text-sm text-gray-500">Manage booking details</p>
        </div>

        {/* NAME */}
        <div>
          <label htmlFor="name" className="text-sm text-gray-600">Client Name</label>
          <input
            id="name"
            type="text"
            className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-[#C8A96A]"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        {/* DATE */}
        <div>
          <label htmlFor="date" className="text-sm text-gray-600">Date</label>
          <input
            id="date"
            type="date"
            className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-[#C8A96A]"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>

        {/* ✅ START TIME → END TIME + DURATION */}
        <div>
          <label className="text-sm text-gray-600 block mb-1">Time</label>
          <div className="flex items-center gap-2">
            {/* Start */}
            <input
              id="time"
              type="time"
              className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-[#C8A96A]"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />

            {/* Arrow */}
            <span className="text-gray-400 font-medium">→</span>

            {/* End (read-only, derived) */}
            <input
              type="time"
              readOnly
              className="flex-1 border rounded-lg p-2 bg-gray-50 text-gray-500 cursor-not-allowed"
              value={endTime}
            />

            {/* Duration */}
            <select
              className="border rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#C8A96A]"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
            >
              <option value={30}>30m</option>
              <option value={60}>1h</option>
              <option value={90}>1.5h</option>
              <option value={120}>2h</option>
            </select>
          </div>
        </div>

        {/* ✅ DATE + TIME PREVIEW */}
        {form.date && form.time && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm flex items-center gap-3">
            {/* Calendar icon */}
            <div className="text-[#C8A96A] text-xl">📅</div>
            <div>
              <p className="font-medium text-black">
                {new Date(form.date + "T00:00:00").toLocaleDateString("en-PH", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <p className="text-gray-600">
                {form.time} – {endTime}
                <span className="ml-2 text-xs text-[#C8A96A] font-medium">
                  ({form.duration} mins)
                </span>
              </p>
            </div>
          </div>
        )}

        {/* SERVICE */}
        <div>
          <label htmlFor="service" className="text-sm text-gray-600">Service</label>
          <select
            id="service"
            className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-[#C8A96A]"
            value={form.service}
            onChange={(e) => setForm({ ...form, service: e.target.value })}
          >
            <option value="">Select Service</option>
            {appointmentOptions.map((group) => (
              <optgroup key={group.category} label={group.category}>
                {group.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* BASE PRICE */}
        {selectedService && (
          <p className="text-sm text-gray-500">
            Base Price: ₱{basePrice.toLocaleString()}
          </p>
        )}

        {/* ADD-ONS */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-black">Add-ons</p>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.addons.photographer}
              onChange={(e) =>
                setForm({ ...form, addons: { ...form.addons, photographer: e.target.checked } })
              }
            />
            Photographer (+₱1,500)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.addons.makeup}
              onChange={(e) =>
                setForm({ ...form, addons: { ...form.addons, makeup: e.target.checked } })
              }
            />
            Hair & Makeup (+₱1,200)
          </label>
        </div>

        {/* TOTAL */}
        <div className="flex justify-between items-center border-t pt-3">
          <span className="text-sm text-gray-500">Total</span>
          <span className="text-lg font-semibold text-[#C8A96A]">
            ₱{totalPrice.toLocaleString()}
          </span>
        </div>

        {/* NOTES */}
        <textarea
          placeholder="Notes (optional)"
          className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#C8A96A]"
          value={form.notes || ""}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-500 hover:text-black">
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-5 py-2 bg-[#C8A96A] text-black rounded-lg hover:opacity-90"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  )
}