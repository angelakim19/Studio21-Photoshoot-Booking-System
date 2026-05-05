"use client"

import { useEffect, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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

    if (!previousPassword) {
      setPreviousPasswordError("Enter password")
      hasError = true
    }

    if (!password) {
      setPasswordError("Enter password")
      hasError = true
    }

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
      if (!user?.email) {
        setPreviousPasswordError("Not authenticated")
        return
      }

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
      if (error) {
        setPasswordError(error.message || "Failed to change password")
        return
      }

      setPreviousPassword("")
      setPassword("")
      setConfirmOpen(false)
      showSuccessToast()
    } finally {
      setPasswordSaving(false)
    }
  }

  const changePassword = async () => {
    setPreviousPasswordError("")
    setPasswordError("")

    let hasError = false

    if (!previousPassword) {
      setPreviousPasswordError("Enter password")
      hasError = true
    }

    if (!password) {
      setPasswordError("Enter password")
      hasError = true
    }

    if (previousPassword && password && previousPassword === password) {
      setPasswordError("New password cannot match previous password")
      hasError = true
    }

    if (hasError) return

    setPasswordSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        setPreviousPasswordError("Not authenticated")
        return
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: previousPassword,
      })

      if (signInError) {
        setPreviousPasswordError("Previous password is incorrect")
        return
      }

      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setPasswordError(error.message || "Failed to change password")
        return
      }

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
    const { error } = await supabase.from('users').delete().eq('id', user.id)
    if (error) return alert('Failed to delete account')
    await supabase.auth.signOut()
    setDeleteOpen(false)
    setDeleteSuccessOpen(true)
    setTimeout(() => {
      setDeleteSuccessOpen(false)
      window.location.replace('/')
    }, 1500)
  }

  return (
    <div className="text-[#1a1a1a]">
      <div className="mb-5 px-1 md:px-2">
        <p className="text-sm uppercase tracking-[0.28em] text-[#8f7a53]">Account</p>
        <h1 className="font-serif text-3xl font-semibold text-[#111111] md:text-4xl">Settings</h1>
      </div>

      <Card className="max-w-2xl rounded-[28px] border-[#ece4d7] bg-[#fbf7f1] shadow-[0_18px_50px_rgba(17,17,17,0.08)]">
        <CardHeader className="border-b border-[#ece4d7] pb-6">
          <CardTitle className="font-serif text-2xl text-[#111111]">Security</CardTitle>

        </CardHeader>

        <CardContent className="space-y-6 p-6 md:p-8">
          <div className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <div>
              <h3 className="font-semibold text-[#111111]">Change password</h3>
            </div>

            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="admin-previous-password">Current password</Label>
                <div className="relative">
                  <Input
                    id="admin-previous-password"
                    type={showPreviousPassword ? "text" : "password"}
                    value={previousPassword}
                    onChange={(e) => {
                      setPreviousPassword(e.target.value)
                      if (previousPasswordError) setPreviousPasswordError("")
                    }}
                    className="h-12 rounded-xl border-[#ded3c1] bg-white pr-12"
                    placeholder="Current password"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-[#C8A96A]"
                    onClick={() => setShowPreviousPassword((prev) => !prev)}
                  >
                    {showPreviousPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {previousPasswordError && (
                  <p className="text-xs font-medium text-red-600">{previousPasswordError}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="admin-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showNewPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (passwordError) setPasswordError("")
                    }}
                    className="h-12 rounded-xl border-[#ded3c1] bg-white pr-12"
                    placeholder="New password"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-[#C8A96A]"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-xs font-medium text-red-600">{passwordError}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={validateAndOpenConfirm}
                disabled={passwordSaving}
                className="h-12 rounded-full bg-[#111111] px-6 text-white hover:bg-[#222222]"
              >
                {passwordSaving ? "Changing..." : "Change"}
              </Button>
            </div>
          </div>

          <div className="grid gap-3 rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
            <div>
              <h3 className="font-semibold text-[#111111]">Delete Account</h3>
              <p className="text-sm text-gray-500">Delete your account permanently.</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setDeleteOpen(true)} className="h-12 rounded-full bg-red-600 px-6 text-white hover:bg-red-700">
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {toastOpen && (
        <div className="fixed right-6 top-6 z-50 w-[320px] rounded-2xl border border-emerald-200 bg-white p-4 shadow-[0_18px_50px_rgba(17,17,17,0.18)]">
          <p className="text-sm font-semibold text-emerald-700">Success</p>
          <p className="mt-1 text-sm text-gray-600">Your changes are saved successfully.</p>
        </div>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="rounded-3xl border-[#ece4d7] bg-[#fffaf2] shadow-[0_18px_50px_rgba(17,17,17,0.16)]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-[#111111]">Confirm change?</DialogTitle>
            <DialogDescription className="text-gray-600">
              This will update your admin password immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} className="rounded-full border-[#ded3c1] px-5">
              Cancel
            </Button>
            <Button
              onClick={confirmPasswordChange}
              className="rounded-full bg-[#111111] px-5 text-white hover:bg-[#222222]"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="rounded-3xl border-[#ece4d7] bg-[#fffaf2] shadow-[0_18px_50px_rgba(17,17,17,0.16)]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-[#111111]">Delete account?</DialogTitle>
            <DialogDescription className="text-gray-600">
              This will permanently remove your profile and all saved user data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} className="rounded-full border-[#ded3c1] px-5">
              Cancel
            </Button>
            <Button
              onClick={deleteAccount}
              className="rounded-full bg-red-600 px-5 text-white hover:bg-red-700"
            >
              Delete account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {deleteSuccessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-[320px] rounded-2xl bg-white p-6 text-center shadow-lg">
            <h2 className="mb-2 text-lg font-semibold">Account Deleted!</h2>
            <p className="text-sm text-gray-600">Redirecting to the landing page...</p>
          </div>
        </div>
      )}
    </div>
  )
}