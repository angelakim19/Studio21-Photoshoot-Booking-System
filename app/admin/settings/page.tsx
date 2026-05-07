"use client"

import { useState } from "react"
import { Eye, EyeOff, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

export default function AdminSettingsPage() {
  const [previousPassword, setPreviousPassword] = useState("")
  const [password, setPassword] = useState("")
  const [previousPasswordError, setPreviousPasswordError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [showPreviousPassword, setShowPreviousPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteSuccessOpen, setDeleteSuccessOpen] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastTimer, setToastTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const showSuccessToast = () => {
    setToastOpen(true)
    if (toastTimer) clearTimeout(toastTimer)
    const timer = setTimeout(() => setToastOpen(false), 3000)
    setToastTimer(timer)
  }

  const validateAndOpenConfirm = () => {
    setPreviousPasswordError("")
    setPasswordError("")
    let hasError = false
    if (!previousPassword) { setPreviousPasswordError("Enter password"); hasError = true }
    if (!password) { setPasswordError("Enter password"); hasError = true }
    if (previousPassword && password && previousPassword === password) {
      setPasswordError("New password cannot match previous password")
      hasError = true
    }
    if (hasError) return
    setConfirmOpen(true)
  }

  const confirmPasswordChange = async () => {
    setPasswordSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) { setPreviousPasswordError("Not authenticated"); return }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: previousPassword,
      })
      if (signInError) {
        setPreviousPasswordError("Previous password is incorrect")
        setConfirmOpen(false)
        return
      }

      const { error } = await supabase.auth.updateUser({ password })
      if (error) { setPasswordError(error.message || "Failed to change password"); return }

      setPreviousPassword("")
      setPassword("")
      setConfirmOpen(false)
      showSuccessToast()
    } finally {
      setPasswordSaving(false)
    }
  }

  const deleteAccount = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from("users").delete().eq("id", user.id)
    if (error) return alert("Failed to delete account")
    await supabase.auth.signOut()
    setDeleteOpen(false)
    setDeleteSuccessOpen(true)
    setTimeout(() => { setDeleteSuccessOpen(false); window.location.replace("/") }, 1500)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-[#8f7a53]">Account</p>
          <h1 className="font-serif text-3xl font-semibold text-[#111111] md:text-4xl">Settings</h1>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-[#111111]">Change Password</h2>
          <p className="text-sm text-gray-500 mt-0.5">Update your admin account password.</p>
        </div>

        <div className="px-6 py-5 space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label className="text-xs text-[#6B6B6B] font-medium">Current Password</label>
            <div className="relative">
              <input
                type={showPreviousPassword ? "text" : "password"}
                value={previousPassword}
                onChange={(e) => { setPreviousPassword(e.target.value); if (previousPasswordError) setPreviousPasswordError("") }}
                placeholder="Current password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-[#C8A96A]/40 focus:border-[#C8A96A] transition"
              />
              <button
                type="button"
                onClick={() => setShowPreviousPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C8A96A] transition-colors"
              >
                {showPreviousPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {previousPasswordError && <p className="text-xs text-red-500">{previousPasswordError}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#6B6B6B] font-medium">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError("") }}
                placeholder="New password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-[#C8A96A]/40 focus:border-[#C8A96A] transition"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C8A96A] transition-colors"
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={validateAndOpenConfirm}
              disabled={passwordSaving}
              className="flex items-center gap-2 bg-[#C8A96A] hover:bg-[#b8935a] transition-colors px-4 py-2 rounded-lg text-white font-medium shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {passwordSaving ? "Changing..." : "Change Password"}
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100">
          <h2 className="text-base font-semibold text-red-600">Danger Zone</h2>
          <p className="text-sm text-gray-500 mt-0.5">Irreversible actions for your account.</p>
        </div>
        <div className="px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#111111]">Delete Account</p>
            <p className="text-sm text-gray-500">Permanently remove your profile and all data.</p>
          </div>
          <button
            onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Trash2 size={14} />
            Delete Account
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {toastOpen && (
        <div className="fixed right-6 top-6 z-50 w-[300px] rounded-xl border border-emerald-200 bg-white px-4 py-3 shadow-lg">
          <p className="text-sm font-semibold text-emerald-700">Password updated</p>
          <p className="text-xs text-gray-500 mt-0.5">Your password has been changed successfully.</p>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-[#111111]">Confirm Password Change</h2>
            <p className="text-sm text-gray-500 mt-1">This will update your admin password immediately.</p>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmPasswordChange}
                disabled={passwordSaving}
                className="px-4 py-2 text-sm font-medium bg-[#C8A96A] hover:bg-[#b8935a] text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {passwordSaving ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-lg">
            <button
              onClick={() => setDeleteOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg"
            >
              x
            </button>
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="text-red-500" size={24} strokeWidth={1.8} />
              </div>
            </div>
            <h2 className="text-center text-lg font-semibold text-gray-800">Delete Account?</h2>
            <p className="text-center text-sm text-gray-500 mt-2">
              This will permanently remove your profile and all saved data. This action cannot be undone.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-all shadow-sm"
              >
                <Trash2 size={14} />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success */}
      {deleteSuccessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-[320px] rounded-2xl bg-white p-6 text-center shadow-lg">
            <h2 className="mb-2 text-lg font-semibold">Account Deleted</h2>
            <p className="text-sm text-gray-500">Redirecting to the landing page...</p>
          </div>
        </div>
      )}
    </div>
  )
}
