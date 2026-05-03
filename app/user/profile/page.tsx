"use client"

import { useEffect, useState } from "react"
import { CheckCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [authUser, setAuthUser] = useState<any>(null)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return
      }

      setAuthUser(user)

      const metadata = user.user_metadata ?? {}

      const { data: legacyProfile } = await supabase
        .from("users")
        .select("first_name, last_name, phone")
        .eq("id", user.id)
        .maybeSingle()

      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("address")
        .eq("user_id", user.id)
        .maybeSingle()

      const firstName = metadata.first_name || legacyProfile?.first_name || ""
      const lastName = metadata.last_name || legacyProfile?.last_name || ""
      const phone = metadata.phone || legacyProfile?.phone || ""
      const address = profileData?.address || metadata.address || ""

      setUser({
        firstName,
        lastName,
        email: user.email || "",
        phone,
        address,
      })
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleSaveChanges = async () => {
    if (!authUser) {
      setMessage({ type: "error", text: "Please sign in to save changes" })
      return
    }

    try {
      setSaving(true)
      setMessage(null)

      const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim()

      const { error: usersError } = await supabase
        .from("users")
        .update({
          first_name: user.firstName,
          last_name: user.lastName,
          phone: user.phone,
        })
        .eq("id", authUser.id)

      if (usersError) throw usersError

      const { error: profileError } = await supabase
        .from("user_profiles")
        .upsert({
          user_id: authUser.id,
          name: fullName,
          email: user.email,
          phone: user.phone,
          address: user.address,
          updated_at: new Date().toISOString(),
        })

      if (profileError) throw profileError

      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: user.firstName,
          last_name: user.lastName,
          full_name: fullName,
          phone: user.phone,
          address: user.address,
        },
      })

      if (error) throw error

      setMessage({
        type: "success",
        text: "Profile saved successfully!",
      })

      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error("Error saving profile:", error)
      setMessage({
        type: "error",
        text: "Failed to save profile. Please try again.",
      })
    } finally {
      setSaving(false)
    }
  }

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "User"

  return (
    <div>
      <h1 className="text-2xl font-serif mb-6">My Profile</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm max-w-lg space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C8A96A] to-[#8F6C2A] flex items-center justify-center text-xl font-semibold text-white">
            {displayName ? displayName.charAt(0).toUpperCase() : "U"}
          </div>

          <div>
            <p className="font-semibold text-lg">{displayName}</p>
            <p className="text-sm text-gray-500">Client</p>
          </div>
        </div>

        {message && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">First Name</label>
            <input
              className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-[#C8A96A]/30"
              value={user.firstName}
              onChange={(e) => setUser({ ...user, firstName: e.target.value })}
              placeholder="Enter your first name"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Last Name</label>
            <input
              className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-[#C8A96A]/30"
              value={user.lastName}
              onChange={(e) => setUser({ ...user, lastName: e.target.value })}
              placeholder="Enter your last name"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              className="w-full border border-gray-300 p-2 rounded mt-1 bg-gray-50"
              value={user.email}
              disabled
              placeholder="Your email address"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="text-sm text-gray-600">Phone</label>
            <input
              className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-[#C8A96A]/30"
              value={user.phone}
              onChange={(e) => setUser({ ...user, phone: e.target.value })}
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Address</label>
            <input
              className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-[#C8A96A]/30"
              value={user.address}
              onChange={(e) => setUser({ ...user, address: e.target.value })}
              placeholder="Enter your address"
            />
          </div>
        </div>

        <Button
          onClick={handleSaveChanges}
          disabled={saving}
          className="bg-[#C8A96A] hover:bg-[#B8995A] text-white px-6 py-3 rounded-lg w-full font-medium tracking-wide transition-all"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  )
}