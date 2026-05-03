"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Globe, Lock, Save, Shield } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

const LAST_UPDATED_KEY = "studio21_user_settings_last_updated"

type UserSettings = {
  language: "English" | "Filipino"
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [authUser, setAuthUser] = useState<any>(null)
  const [settings, setSettings] = useState<UserSettings>({
    language: "English",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  useEffect(() => {
    const loadSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      setAuthUser(user)

      const { data } = await supabase
        .from("user_settings")
        .select("language")
        .eq("user_id", user.id)
        .maybeSingle()

      if (data?.language === "English" || data?.language === "Filipino") {
        setSettings((current) => ({ ...current, language: data.language }))
      }

      const storedLastUpdated = window.localStorage.getItem(LAST_UPDATED_KEY)
      if (storedLastUpdated) {
        setLastUpdated(storedLastUpdated)
      }
    }

    loadSettings()
  }, [router])

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }))
  }

  const handleSaveSettings = async () => {
    if (!authUser) {
      setMessage("Please sign in to save settings")
      return
    }

    if (settings.newPassword && settings.newPassword !== settings.confirmPassword) {
      setMessage("Passwords do not match")
      return
    }

    try {
      setSaving(true)
      setMessage(null)

      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: authUser.id,
          language: settings.language,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      if (settings.newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: settings.newPassword,
        })

        if (passwordError) throw passwordError
      }

      const nowIso = new Date().toISOString()
      window.localStorage.setItem(LAST_UPDATED_KEY, nowIso)
      setLastUpdated(nowIso)
      setMessage("Settings saved successfully")
      setSettings((current) => ({
        ...current,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))
    } catch (error) {
      console.error("Error saving settings:", error)
      setMessage("Failed to save settings. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!authUser) {
      setMessage("Please sign in to delete account")
      return
    }

    try {
      setDeleting(true)
      setMessage(null)

      const response = await fetch("/api/user/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: authUser.id }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete account")
      }

      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("Error deleting account:", error)
      setMessage("Failed to delete account. Please try again.")
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <div className="space-y-8 text-[#1a1a1a]">
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Delete Account
              </CardTitle>
              <CardDescription>
                This action cannot be undone. Your account, profile, and bookings will be removed.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 text-white hover:bg-red-700"
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Account"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-serif font-semibold">Settings</h1>
        <p className="mt-2 text-sm text-gray-500">Manage your language, security, and account preferences.</p>
      </div>

      {message && (
        <div className="rounded-xl border border-[#C8A96A]/30 bg-[#C8A96A]/10 px-4 py-3 text-sm text-[#1a1a1a]">
          {message}
        </div>
      )}

      <Card className="border-0 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-[#C8A96A]" />
            Language Preferences
          </CardTitle>
          <CardDescription>Choose your preferred language for the dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {(["English", "Filipino"] as const).map((language) => (
            <button
              key={language}
              type="button"
              onClick={() => updateSetting("language", language)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                settings.language === language
                  ? "border-[#C8A96A] bg-[#C8A96A]/10"
                  : "border-gray-200 bg-white hover:border-[#C8A96A]/40"
              }`}
            >
              <p className="font-medium">{language}</p>
              <p className="text-sm text-gray-500">
                {language === "English"
                  ? "Use English throughout the app."
                  : "Gamitin ang Filipino sa mga label at mensahe."}
              </p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="border-0 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#C8A96A]" />
            Security
          </CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Current Password</label>
            <Input
              type="password"
              value={settings.currentPassword}
              onChange={(e) => updateSetting("currentPassword", e.target.value)}
              placeholder="Enter current password"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">New Password</label>
            <Input
              type="password"
              value={settings.newPassword}
              onChange={(e) => updateSetting("newPassword", e.target.value)}
              placeholder="Enter new password"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Confirm New Password</label>
            <Input
              type="password"
              value={settings.confirmPassword}
              onChange={(e) => updateSetting("confirmPassword", e.target.value)}
              placeholder="Confirm new password"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-[#C8A96A]" />
            Account Actions
          </CardTitle>
          <CardDescription>Save your changes or remove your account permanently.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border p-4">
            <p className="font-medium">Last updated</p>
            <p className="mt-1 text-sm text-gray-500">
              {lastUpdated
                ? new Intl.DateTimeFormat("en-PH", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  }).format(new Date(lastUpdated))
                : "Not saved yet"}
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-100 bg-red-50 p-4">
            <div>
              <p className="font-medium text-red-700">Delete account</p>
              <p className="text-sm text-red-600/80">Permanently remove your account and booking history.</p>
            </div>
            <Button
              variant="ghost"
              className="text-red-600 hover:bg-red-100 hover:text-red-700"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          disabled={saving}
          className="bg-[#C8A96A] px-6 text-white hover:bg-[#B8995A]"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}