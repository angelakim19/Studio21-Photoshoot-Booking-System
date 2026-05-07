"use client"

import { useEffect, useState, useCallback } from "react"
import { Pencil, Trash2, Search, ChevronDown, Users } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import Pagination from "@/components/admin/client/Pagination"

type Client = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
}

const PAGE_SIZE = 10

function useClients(initialData: Client[]) {
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("default")

  let processed = initialData.filter((client) => {
    const query = search.toLowerCase()
    return (
      (client.first_name ?? "").toLowerCase().includes(query) ||
      (client.last_name ?? "").toLowerCase().includes(query) ||
      (client.email ?? "").toLowerCase().includes(query)
    )
  })

  if (sortBy !== "default") {
    processed = [...processed].sort((a, b) => {
      if (sortBy === "name_az") return (a.last_name ?? "").localeCompare(b.last_name ?? "")
      if (sortBy === "name_za") return (b.last_name ?? "").localeCompare(a.last_name ?? "")
      return 0
    })
  }

  return { search, setSearch, sortBy, setSortBy, data: processed }
}

// Generate a consistent avatar background color from a string
function getAvatarColor(name: string) {
  const colors = [
    "bg-amber-100 text-amber-700",
    "bg-emerald-100 text-emerald-700",
    "bg-sky-100 text-sky-700",
    "bg-violet-100 text-violet-700",
    "bg-rose-100 text-rose-700",
    "bg-teal-100 text-teal-700",
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i)
  return colors[hash % colors.length]
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [targetClientId, setTargetClientId] = useState<string | null>(null)
  const [isBulkDelete, setIsBulkDelete] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  })

  const resetForm = () => {
    setForm({ first_name: "", last_name: "", email: "", phone: "" })
  }

  const loadClients = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from("users").select("*").eq("role", "client")
    if (error) {
      console.error("fetchClients:", error.message)
      setClients([])
    } else {
      setClients(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadClients() }, [loadClients])

  const { search, setSearch, sortBy, setSortBy, data } = useClients(clients)

  useEffect(() => { setCurrentPage(1) }, [search, sortBy])

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE))
  const pagedData = data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === data.length) setSelectedIds([])
    else setSelectedIds(data.map((c) => c.id))
  }

  const clearSelection = () => setSelectedIds([])

  const handleOpenAdd = () => { resetForm(); setOpenAddDialog(true) }

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client)
    setForm({
      first_name: client.first_name ?? "",
      last_name: client.last_name ?? "",
      email: client.email ?? "",
      phone: client.phone ?? "",
    })
    setOpenEditDialog(true)
  }

  const handleAddClient = async () => {
    const { first_name, last_name, email, phone } = form
    if (!first_name || !last_name || !email || !phone) { alert("Please fill in all fields."); return }
    const newClientId = crypto.randomUUID()
    const { error } = await supabase.from("users").insert({ id: newClientId, first_name, last_name, email, phone, role: "client" })
    if (error) { alert(error.message); return }
    setOpenAddDialog(false); resetForm(); await loadClients()
  }

  const handleEditClient = async () => {
    if (!editingClient) return
    const { first_name, last_name, email, phone } = form
    if (!first_name || !last_name || !email || !phone) { alert("Please fill in all fields."); return }
    const { error } = await supabase.from("users").update({ first_name, last_name, email, phone }).eq("id", editingClient.id)
    if (error) { alert(error.message.includes("duplicate") ? "Email already exists." : "Failed to update client."); return }
    setOpenEditDialog(false); setEditingClient(null); resetForm(); await loadClients()
  }

  const openSingleDelete = (id: string) => { setTargetClientId(id); setIsBulkDelete(false); setOpenDeleteDialog(true) }
  const openBulkDelete = () => { setIsBulkDelete(true); setOpenDeleteDialog(true) }

  const handleDelete = async () => {
    let idsToDelete: string[] = []
    if (isBulkDelete) idsToDelete = selectedIds
    else if (targetClientId) idsToDelete = [targetClientId]

    const { data: bookings, error: bookingError } = await supabase.from("bookings").select("user_id").in("user_id", idsToDelete)
    if (bookingError) { alert("Failed to verify bookings."); return }
    if (bookings && bookings.length > 0) { alert("Cannot delete client with existing bookings."); return }

    const { error } = await supabase.from("users").delete().in("id", idsToDelete)
    if (error) { alert("Failed to delete client."); return }

    setOpenDeleteDialog(false); setTargetClientId(null); setSelectedIds([]); await loadClients()
  }

  const inputClass =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8A96A]/40 focus:border-[#C8A96A] transition bg-gray-50 focus:bg-white"

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-[#8f7a53]">Management</p>
          <h1 className="font-serif text-3xl font-semibold text-[#111111] md:text-4xl">Clients</h1>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
            <Users size={13} className="text-gray-500" />
            <span>{clients.length} total clients</span>
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-[#C8A96A] hover:bg-[#b8935a] transition-colors px-4 py-2 rounded-lg text-white font-medium shadow-sm"
        >
          <span className="text-lg leading-none">+</span> Add Client
        </button>
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A96A]/40 focus:border-[#C8A96A] transition"
          />
        </div>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A96A]/40 focus:border-[#C8A96A] transition bg-white"
          >
            <option value="default">Sort: Default</option>
            <option value="name_az">A → Z</option>
            <option value="name_za">Z → A</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {search && (
        <p className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-800">{data.length}</span> result{data.length !== 1 ? "s" : ""} for{" "}
          <span className="font-semibold text-gray-800">"{search}"</span>
        </p>
      )}

      {/* Table */}
      <div className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">

        {/* Bulk action bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 px-5 py-3 bg-red-50 border-b border-red-100 text-sm">
            <span className="text-red-600 font-semibold">{selectedIds.length} selected</span>
            <div className="flex gap-2 ml-1">
              <button
                onClick={openBulkDelete}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors shadow-sm"
              >
                <Trash2 size={13} /> Delete Selected
              </button>
              <button onClick={clearSelection} className="text-gray-400 hover:text-gray-600 text-xs underline underline-offset-2 transition-colors">
                Clear
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-[#C8A96A] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Loading clients...</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="pl-5 pr-3 py-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={data.length > 0 && selectedIds.length === data.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-[#C8A96A] focus:ring-[#C8A96A]/30 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Client</th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Email</th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Phone</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pagedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-400 text-sm">
                    <Users size={32} className="mx-auto mb-3 text-gray-200" />
                    No clients found.
                  </td>
                </tr>
              ) : (
                pagedData.map((client) => {
                  const initials = `${(client.first_name ?? "?")[0]}${(client.last_name ?? "?")[0]}`.toUpperCase()
                  const avatarColor = getAvatarColor(client.first_name + client.last_name)
                  const isSelected = selectedIds.includes(client.id)
                  return (
                    <tr
                      key={client.id}
                      className={`group transition-colors ${isSelected ? "bg-amber-50/60" : "hover:bg-gray-50/80"}`}
                    >
                      <td className="pl-5 pr-3 py-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(client.id)}
                          className="rounded border-gray-300 text-[#C8A96A] focus:ring-[#C8A96A]/30 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColor}`}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 leading-tight">
                              {client.first_name} {client.last_name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-500">{client.email}</td>
                      <td className="px-4 py-3.5 text-gray-500 font-mono text-xs tracking-wide">{client.phone}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(client)}
                            title="Edit"
                            className="p-2 rounded-lg text-gray-400 hover:text-[#C8A96A] hover:bg-amber-50 transition-all"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => openSingleDelete(client.id)}
                            title="Delete"
                            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div className="border-t border-gray-100 px-5 py-3">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>

      {/* ── Add Dialog ── */}
      {openAddDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 py-4">
          <div className="bg-white w-[560px] max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Add Client</h2>
              <p className="text-xs text-gray-400 mt-0.5">Add details for a walk-in client</p>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Client Information</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">First Name</label>
                  <input type="text" className={inputClass} value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Last Name</label>
                  <input type="text" className={inputClass} value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-medium text-gray-600">Email</label>
                  <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-medium text-gray-600">Phone</label>
                  <input type="tel" className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-2 bg-gray-50/60">
              <button onClick={() => setOpenAddDialog(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
                Cancel
              </button>
              <button onClick={handleAddClient} className="px-5 py-2 bg-[#C8A96A] hover:bg-[#b8935a] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm shadow-[#C8A96A]/20">
                Save Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Dialog ── */}
      {openEditDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 py-4">
          <div className="bg-white w-[560px] max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Edit Client</h2>
              <p className="text-xs text-gray-400 mt-0.5">Update client details</p>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Client Information</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">First Name</label>
                  <input type="text" className={inputClass} value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Last Name</label>
                  <input type="text" className={inputClass} value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-medium text-gray-600">Email</label>
                  <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-medium text-gray-600">Phone</label>
                  <input type="tel" className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-2 bg-gray-50/60">
              <button onClick={() => setOpenEditDialog(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
                Cancel
              </button>
              <button onClick={handleEditClient} className="px-5 py-2 bg-[#C8A96A] hover:bg-[#b8935a] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm shadow-[#C8A96A]/20">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Dialog ── */}
      {openDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative shadow-2xl">
            <button
              onClick={() => setOpenDeleteDialog(false)}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-sm"
            >
              ✕
            </button>
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
                <Trash2 className="text-red-400" size={22} strokeWidth={1.8} />
              </div>
            </div>
            <h2 className="text-center text-base font-bold text-gray-800">Confirm Deletion</h2>
            <p className="text-center text-sm text-gray-400 mt-2 leading-relaxed">
              Are you sure you want to delete {isBulkDelete ? `${selectedIds.length} clients` : "this client"}? This action cannot be undone.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setOpenDeleteDialog(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 active:scale-[0.98] transition-all shadow-sm shadow-red-200"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <><Trash2 size={14} /> Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
