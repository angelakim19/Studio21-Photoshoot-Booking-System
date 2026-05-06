// app/admin/clients/page.tsx

"use client"

import { useEffect, useState, useCallback } from "react"
import { Pencil, Trash2, AlertTriangle, Search, ChevronDown } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

type Client = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
}

// ─── Hook: Search + Sort ─────────────────────────────
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
      if (sortBy === "name_az") {
        return (a.last_name ?? "").localeCompare(b.last_name ?? "")
      }

      if (sortBy === "name_za") {
        return (b.last_name ?? "").localeCompare(a.last_name ?? "")
      }

      return 0
    })
  }

  return {
    search,
    setSearch,
    sortBy,
    setSortBy,
    data: processed,
  }
}

// ─── Page ────────────────────────────────────────────
export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  // 🔹 Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Dialog state 
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [targetClientId, setTargetClientId] = useState<string | null>(null)
  const [isBulkDelete, setIsBulkDelete] = useState(false)

  const [editingClient, setEditingClient] = useState<Client | null>(null)

  // Form state
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  })

  const resetForm = () => {
    setForm({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
    })
  }

  // 🔹 Fetch clients (role = client)
  const loadClients = useCallback(async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("role", "client")

    if (error) {
      console.error("fetchClients:", error.message)
      setClients([])
    } else {
      setClients(data ?? [])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  // 🔹 Hook usage
  const { search, setSearch, sortBy, setSortBy, data } =
    useClients(clients)

  // ─── Selection Helpers ─────────────────────────────

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(data.map((client) => client.id))
    }
  }

  const clearSelection = () => setSelectedIds([])

  // ─── Dialog Handlers ─────────────────────────────
  const handleOpenAdd = () => {
    resetForm()
    setOpenAddDialog(true)
  }

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

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // ─── CRUD ─────────────────────────────

  const handleAddClient = async () => {
    const { first_name, last_name, email, phone } = form

    console.log("Attempting to add client with:", form)

    if (!first_name || !last_name || !email || !phone) {
      console.warn("Validation failed: missing fields")
      alert("Please fill in all fields.")
      return
    }

    const newClientId = crypto.randomUUID()

    const { data, error } = await supabase.from("users").insert({
      id: newClientId,
      first_name,
      last_name,
      email,
      phone,
      role: "client",
    })

    /* if (error) {
      alert(error.message.includes("duplicate")
        ? "Email already exists."
        : "Failed to add client.")
      return
    } */

    console.log("Supabase response:", { data, error })

    if (error) {
      console.error("Insert failed:", error)
      alert(error.message)
      return
    }

    console.log("Insert successful:", data)

    setOpenAddDialog(false)
    resetForm()
    await loadClients()
  }

  const handleEditClient = async () => {
    if (!editingClient) return

    const { first_name, last_name, email, phone } = form

    if (!first_name || !last_name || !email || !phone) {
      alert("Please fill in all fields.")
      return
    }

    const { error } = await supabase
      .from("users")
      .update({ first_name, last_name, email, phone })
      .eq("id", editingClient.id)

    if (error) {
      alert(error.message.includes("duplicate")
        ? "Email already exists."
        : "Failed to update client.")
      return
    }

    setOpenEditDialog(false)
    setEditingClient(null)
    resetForm()
    await loadClients()
  }

  // ─── DELETE HANDLERS ─────────────────────────────

  const openSingleDelete = (id: string) => {
    setTargetClientId(id)
    setIsBulkDelete(false)
    setOpenDeleteDialog(true)
  }

  const openBulkDelete = () => {
    setIsBulkDelete(true)
    setOpenDeleteDialog(true)
  }

  const handleDelete = async () => {
    let idsToDelete: string[] = []

    if (isBulkDelete) {
      idsToDelete = selectedIds
    } else if (targetClientId) {
      idsToDelete = [targetClientId]
    }

    // STEP 1: CHECK BOOKINGS
    const { data: bookings, error: bookingError } = await supabase
      .from("bookings") // adjust if your table name differs
      .select("user_id")
      .in("user_id", idsToDelete)

    if (bookingError) {
      alert("Failed to verify bookings.")
      return
    }

    if (bookings && bookings.length > 0) {
      alert("Cannot delete client with existing bookings.")
      return
    }

    // STEP 2: DELETE
    const { error } = await supabase
      .from("users")
      .delete()
      .in("id", idsToDelete)

    if (error) {
      alert("Failed to delete client.")
      return
    }

    // CLEANUP
    setOpenDeleteDialog(false)
    setTargetClientId(null)
    setSelectedIds([])
    await loadClients()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header + Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">
            {clients.length} total clients
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-[#C8A96A] hover:bg-[#b8935a] transition-colors px-4 py-2 rounded-lg text-white font-medium shadow-sm"  
        >
          + Add Client 
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A96A]/40 focus:border-[#C8A96A] transition"
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A96A]/40 focus:border-[#C8A96A] transition bg-white"
          >
            <option value="none">Sort: Default</option>
            <option value="name_az">A → Z</option>
            <option value="name_za">Z → A</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Search Result Indicator */}
      {search && (
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-700">
            {data.length}
          </span>{" "}
          result{data.length !== 1 ? "s" : ""} for{" "}
          <span className="font-semibold text-gray-700">
            "{search}"
          </span>
        </p>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        
        {/* Selected Count */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 bg-red-50 border-b text-sm">
            <span className="text-red-600 font-medium">{selectedIds.length} selected</span>

            <div className="flex gap-2">
              <button
                onClick={openBulkDelete}
                className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              ><Trash2 size={14} /> Delete Selected</button>

              <button
                onClick={clearSelection}
                className="text-gray-500 hover:text-gray-700 underline"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="p-10 text-center text-gray-400">
            Loading clients...
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                {/* Checkbox column */}
                <th className="p-4">
                  <input
                    type="checkbox"
                    checked={data.length > 0 && selectedIds.length === data.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Last Name</th>
                <th>First Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-400">
                    No clients found.
                  </td>
                </tr>
              ) : (
                data.map((client) => (
                  <tr key={client.id} className="border-t hover:bg-gray-50">
                    {/* Row checkbox */}
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(client.id)}
                        onChange={() => toggleSelect(client.id)}
                      />
                    </td>

                    <td className="p-4 font-medium">{client.last_name}</td>
                    <td>{client.first_name}</td>
                    <td>{client.email}</td>
                    <td>{client.phone}</td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex gap-3 text-sm">
                        <button
                          onClick={() => handleOpenEdit(client)}
                          className="text-[#C8A96A] hover:text-[#b8935a] transition-colors" title="Edit"><Pencil size={16} /></button>

                        <button
                          onClick={() => openSingleDelete(client.id)}
                          className="text-red-400 hover:text-red-600 transition-colors" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Add Dialog */}
      {openAddDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-y-auto py-4">
          <div className="bg-white w-[600px] max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

            {/* HEADER */}
            <div className="bg-gradient-to-r from-[#F5F5F5] to-white border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-bold text-[#1A1A1A]">Add Client</h2>
              <p className="text-xs text-[#6B6B6B] mt-0.5">Add details for walk-in client</p>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

              {/* CLIENT DETAILS */}
              <div className="space-y-2.5">
                <p className="text-xs font-semibold text-[#1A1A1A] uppercase tracking-wide">Client Information</p>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs text-[#6B6B6B] font-medium">First Name</label>
                    <input type="text" className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#C8A96A] focus:border-transparent"
                      value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-[#6B6B6B] font-medium">Last Name</label>
                    <input type="text" className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#C8A96A] focus:border-transparent"
                      value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-[#6B6B6B] font-medium">Email</label>
                    <input type="email" className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#C8A96A] focus:border-transparent"
                      value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-[#6B6B6B] font-medium">Phone</label>
                    <input type="tel" className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#C8A96A] focus:border-transparent"
                      value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="border-t bg-[#F5F5F5] px-6 py-3 flex justify-end gap-2">
              <button onClick={() => setOpenAddDialog(false)} className="px-3.5 py-2 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors text-sm font-medium">Cancel</button>
              <button
                onClick={handleAddClient}
                className="px-4 py-2 bg-[#C8A96A] text-black rounded-lg hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm transition-opacity"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {openEditDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-y-auto py-4">
          <div className="bg-white w-[600px] max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

            {/* HEADER */}
            <div className="bg-gradient-to-r from-[#F5F5F5] to-white border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-bold text-[#1A1A1A]">Edit Client</h2>
              <p className="text-xs text-[#6B6B6B] mt-0.5">Update client details</p>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

              {/* CLIENT DETAILS */}
              <div className="space-y-2.5">
                <p className="text-xs font-semibold text-[#1A1A1A] uppercase tracking-wide">Client Information</p>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs text-[#6B6B6B] font-medium">First Name</label>
                    <input type="text" className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#C8A96A] focus:border-transparent"
                      value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-[#6B6B6B] font-medium">Last Name</label>
                    <input type="text" className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#C8A96A] focus:border-transparent"
                      value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-[#6B6B6B] font-medium">Email</label>
                    <input type="email" className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#C8A96A] focus:border-transparent"
                      value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-[#6B6B6B] font-medium">Phone</label>
                    <input type="tel" className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#C8A96A] focus:border-transparent"
                      value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="border-t bg-[#F5F5F5] px-6 py-3 flex justify-end gap-2">
              <button onClick={() => setOpenEditDialog(false)} className="px-3.5 py-2 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors text-sm font-medium">Cancel</button>
              <button
                onClick={handleEditClient}
                className="px-4 py-2 bg-[#C8A96A] text-black rounded-lg hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm transition-opacity"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {openDeleteDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-lg">

            {/* Close Button */}
            <button
              onClick={() => setOpenDeleteDialog(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg"
            >
              ✕
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="text-red-500" size={24} strokeWidth={1.8} />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-center text-lg font-semibold text-gray-800">
              Confirm Deletion
            </h2>

            {/* Description */}
            <p className="text-center text-sm text-gray-500 mt-2">
              Are you sure you want to delete the item/s? This action cannot be undone.
            </p>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setOpenDeleteDialog(false)}
                className="
                  flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                  bg-gray-100 text-gray-700 border border-gray-200
                  hover:bg-gray-200 hover:border-gray-300
                  focus:outline-none focus:ring-2 focus:ring-gray-300
                  transition-all disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="
                  flex-1 flex items-center justify-center gap-2
                  px-4 py-2.5 rounded-xl text-sm font-semibold
                  bg-red-500 text-white
                  hover:bg-red-600 active:scale-[0.98]
                  focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1
                  transition-all disabled:opacity-70 disabled:cursor-not-allowed
                  shadow-sm shadow-red-200
                "
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}