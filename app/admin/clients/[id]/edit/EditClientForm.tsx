// app/admin/clients/[id]/edit/EditClientForm.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function EditClientForm({ client }: any) {
  const router = useRouter()

  const [firstName, setFirstName] = useState(client.first_name)
  const [lastName, setLastName] = useState(client.last_name)
  const [email, setEmail] = useState(client.email)
  const [phone, setPhone] = useState(client.phone)

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!firstName || !lastName || !email || !phone) {
      setError("All fields are required.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const { error } = await supabase
        .from("users") // ⚠️ your actual table
        .update({
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
        })
        .eq("id", client.id)

      if (error) throw error

      alert("Client updated successfully")

      router.push("/admin/clients")
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setError("Failed to update client.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
      
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <div>
        <label className="block text-sm">First Name</label>
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm">Last Name</label>
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm">Phone</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </div>
  )
}