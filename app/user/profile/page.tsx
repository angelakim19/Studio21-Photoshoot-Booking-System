"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Profile = {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<Profile>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastTimer, setToastTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const showSuccessToast = () => {
    setToastOpen(true)
    if (toastTimer) clearTimeout(toastTimer)
    const timer = setTimeout(() => setToastOpen(false), 3000)
    setToastTimer(timer)
  }

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setIsLoading(true)
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        if (isMounted) setIsLoading(false)
        return
      }

      const metadata = authUser.user_metadata as {
        first_name?: string
        last_name?: string
        phone?: string
      }

      // Match dashboard strategy: fetch profile row by authenticated user id.
      const { data: dbUser } = await supabase
        .from('users')
        .select('first_name,last_name,email,phone')
        .eq('id', authUser.id)
        .maybeSingle()

      if (!isMounted) return

      setUser({
        first_name: dbUser?.first_name || metadata.first_name || "",
        last_name: dbUser?.last_name || metadata.last_name || "",
        email: dbUser?.email || authUser.email || "",
        phone: dbUser?.phone || metadata.phone || "",
      })
      setIsLoading(false)
    }

    load()

    const { data: authSubscription } = supabase.auth.onAuthStateChange(() => {
      load()
    })

    return () => {
      isMounted = false
      authSubscription.subscription.unsubscribe()
    }
  }, [])

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ")

  return (
    <div className="text-[#1a1a1a]">
      <div className="mb-5 px-1 md:px-2">
        <p className="text-sm uppercase tracking-[0.28em] text-[#8f7a53]">Account</p>
        <h1 className="font-serif text-3xl font-semibold text-[#111111] md:text-4xl">My Profile</h1>
      </div>

      <Card className="max-w-2xl rounded-[28px] border-[#ece4d7] bg-[#fbf7f1] shadow-[0_18px_50px_rgba(17,17,17,0.08)]">
        <CardHeader className="border-b border-[#ece4d7] pb-6">
          <CardTitle className="font-serif text-2xl text-[#111111]">Personal information</CardTitle>
          <p className="text-sm text-gray-500">Update your profile so your details stay current.</p>
        </CardHeader>

        <CardContent className="space-y-6 p-6 md:p-8">
          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#111111] text-xl font-semibold text-white">
              {(fullName || user.first_name || "U").slice(0, 1).toUpperCase()}
            </div>

            <div>
              <p className="font-semibold text-lg text-[#111111]">{fullName || "Your name"}</p>
              <p className="text-sm text-gray-500">Client</p>
              <p className="text-xs text-gray-400">{user.email || ""}</p>
            </div>
          </div>

          {isLoading ? (
            <p className="text-sm text-gray-500">Loading profile...</p>
          ) : null}

          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="profile-first-name">First Name</Label>
                <Input
                  id="profile-first-name"
                  className="h-12 rounded-xl border-[#ded3c1] bg-white"
                  value={user.first_name}
                  onChange={(e) => setUser({ ...user, first_name: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="profile-last-name">Last Name</Label>
                <Input
                  id="profile-last-name"
                  className="h-12 rounded-xl border-[#ded3c1] bg-white"
                  value={user.last_name}
                  onChange={(e) => setUser({ ...user, last_name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="profile-phone">Phone</Label>
                <Input
                  id="profile-phone"
                  className="h-12 rounded-xl border-[#ded3c1] bg-white"
                  value={user.phone}
                  onChange={(e) => setUser({ ...user, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={async () => {
                const { data: { user: authUser } } = await supabase.auth.getUser()
                if (!authUser) return alert('Not authenticated')
                setIsSaving(true)
                try {
                  const { error } = await supabase
                    .from('users')
                    .upsert({
                      id: authUser.id,
                      first_name: user.first_name,
                      last_name: user.last_name,
                      phone: user.phone,
                    }, { onConflict: 'id' })

                  if (error) return alert('Failed to save')
                  showSuccessToast()
                } finally {
                  setIsSaving(false)
                }
              }}
              disabled={isSaving}
              className="h-12 rounded-full bg-[#111111] px-6 text-white hover:bg-[#222222]"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {toastOpen && (
        <div className="fixed right-6 top-6 z-50 w-[320px] rounded-2xl border border-emerald-200 bg-white p-4 shadow-[0_18px_50px_rgba(17,17,17,0.18)]">
          <p className="text-sm font-semibold text-emerald-700">Success</p>
          <p className="mt-1 text-sm text-gray-600">Your changes are saved successfully.</p>
        </div>
      )}
    </div>
  )
}