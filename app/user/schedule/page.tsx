"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Footer } from "@/components/layout/footer"

export default function SchedulePage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [editingBooking, setEditingBooking] = useState<any | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [draft, setDraft] = useState({ service: "", date: "", time: "", status: "Pending" })

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase
      .from('bookings')
      .select('id, service, date, time, status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) setBookings(data as any[])
  }

  useEffect(() => { load() }, [])

  const startEdit = (booking: any) => {
    setEditingBooking(booking)
    setDraft({
      service: booking.service ?? "",
      date: booking.date ?? "",
      time: booking.time ?? "",
      status: booking.status ?? "Pending",
    })
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const { error } = await supabase.from('bookings').delete().eq('id', deleteTarget.id)
    if (error) return alert('Failed to delete booking')
    setDeleteTarget(null)
    await load()
  }

  const saveEdit = async () => {
    if (!editingBooking) return
    const { error } = await supabase
      .from('bookings')
      .update({
        service: draft.service,
        date: draft.date,
        time: draft.time,
        status: draft.status,
      })
      .eq('id', editingBooking.id)

    if (error) return alert('Failed to save booking changes')
    setEditingBooking(null)
    await load()
  }

  return (
    <div className="text-[#1a1a1a]">
      <div className="mb-5 px-1 md:px-2">
        <p className="text-sm uppercase tracking-[0.28em] text-[#8f7a53]">Bookings</p>
        <h1 className="font-serif text-3xl font-semibold text-[#111111] md:text-4xl">My Schedule</h1>
      </div>

      {/* BOOKINGS LIST */}
      <div className="rounded-[28px] bg-[#fbf7f1] p-5 shadow-[0_18px_50px_rgba(17,17,17,0.08)] md:p-7">

        {bookings.length === 0 && (
          <p className="text-gray-500">No scheduled sessions yet.</p>
        )}

        <div className="space-y-3">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="flex flex-col gap-4 rounded-2xl border border-[#ece4d7] bg-white px-4 py-4 shadow-sm md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-medium text-[#111111]">{b.service}</p>
                <p className="text-sm text-gray-500">
                  {b.date} • {b.time}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button onClick={() => startEdit(b)} className="rounded-full border border-[#111111] px-4 py-2 text-sm font-medium text-[#111111] transition hover:bg-[#111111] hover:text-white">Edit</button>
                <button onClick={() => setDeleteTarget(b)} className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-600 hover:text-white">Delete</button>

                <span
                  className={`text-sm px-3 py-1 rounded-full ${
                    b.status === "Confirmed"
                      ? "bg-green-100 text-green-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {b.status}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      <Dialog open={!!editingBooking} onOpenChange={(open) => !open && setEditingBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit booking</DialogTitle>
            <DialogDescription>Update the booking details and save the changes.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="service">Service</Label>
              <Input id="service" value={draft.service} onChange={(e) => setDraft({ ...draft, service: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Input id="status" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingBooking(null)}>Cancel</Button>
            <Button onClick={saveEdit} className="bg-[#C8A96A] text-white hover:bg-[#b8985d]">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete booking?</DialogTitle>
            <DialogDescription>This action cannot be undone. The booking will be removed permanently.</DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}