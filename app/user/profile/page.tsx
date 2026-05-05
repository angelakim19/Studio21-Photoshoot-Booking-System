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
  address?: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<Profile>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
  })

  useEffect(() => {
    const load = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      const metadata = authUser.user_metadata as {
        first_name?: string
        last_name?: string
        phone?: string
      }

      // Match dashboard strategy: fetch profile row by authenticated user id.
      const { data: dbUser } = await supabase
        .from('users')
        .select('first_name,last_name,email,phone,address')
        .eq('id', authUser.id)
        .maybeSingle()

      setUser({
        first_name: dbUser?.first_name || metadata.first_name || "",
        last_name: dbUser?.last_name || metadata.last_name || "",
        email: dbUser?.email || authUser.email || "",
        phone: dbUser?.phone || metadata.phone || "",
        address: dbUser?.address || "",
      })
    }

    load()
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
            </div>
          </div>

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

            <div className="grid gap-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                className="h-12 rounded-xl border-[#ded3c1] bg-white"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
              />
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

              <div className="grid gap-2">
                <Label htmlFor="profile-address">Address</Label>
                <Input
                  id="profile-address"
                  className="h-12 rounded-xl border-[#ded3c1] bg-white"
                  value={user.address}
                  onChange={(e) => setUser({ ...user, address: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={async () => {
                const { data: { user: authUser } } = await supabase.auth.getUser()
                if (!authUser) return alert('Not authenticated')
                const { error } = await supabase.from('users').update({
                  first_name: user.first_name,
                  last_name: user.last_name,
                  email: user.email,
                  phone: user.phone,
                  address: user.address,
                }).eq('id', authUser.id)
                if (error) return alert('Failed to save')
                alert('Profile saved')
              }}
              className="h-12 rounded-full bg-[#111111] px-6 text-white hover:bg-[#222222]"
            >
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}