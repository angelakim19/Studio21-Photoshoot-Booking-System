"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { Calendar, Users, BarChart3, Settings, LogOut } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [logoutOpen, setLogoutOpen] = useState(false)

  const menu = [
    { name: "Calendar", href: "/admin", icon: Calendar },
    { name: "Clients", href: "/admin/clients", icon: Users },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Settings", href: "#", icon: Settings },
  ]

  return (
    <div className="flex min-h-screen">

      {/* SIDEBAR */}
      <aside className="w-[300px] bg-[#111111] text-white p-6 flex flex-col justify-between">

        <div>
          {/* LOGO */}
          <div className="flex items-center gap-3 mb-8">
            <Image src="/favicon.png" alt="logo" width={40} height={40} />
            <div>
              <h2 className="font-serif text-xl">Studio 21</h2>
              <p className="text-sm text-[#C8A96A]">Admin Dashboard</p>
            </div>
          </div>

          <hr className="border-gray-800 mb-6" />

          {/* MENU */}
          <nav className="flex flex-col gap-2">
            {menu.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition cursor-pointer
                    ${
                      isActive
                        ? "bg-[#C8A96A] text-white"
                        : "text-gray-300 hover:bg-gray-800"
                    }`}
                  >
                    <Icon size={18} />
                    {item.name}
                  </div>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* USER FOOTER */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
              <span>A</span>
            </div>
            <div>
              <p className="text-sm">Admin</p>
              <p className="text-xs text-gray-400">Studio 21</p>
            </div>
          </div>

          <button
            onClick={() => setLogoutOpen(true)}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition"
          >
            <LogOut size={16} />
            <span className="text-sm">Log out</span>
          </button>
        </div>

      </aside>

      {/* CONTENT */}
      <main className="flex-1 bg-[#F5F5F5] p-8">
        {children}
      </main>

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="rounded-3xl border-[#ece4d7] bg-[#fffaf2] shadow-[0_18px_50px_rgba(17,17,17,0.16)]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-[#111111]">Log out?</DialogTitle>
            <DialogDescription className="text-gray-600">
              You will be signed out of your admin account and returned to the login page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutOpen(false)} className="rounded-full border-[#ded3c1] px-5">
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await supabase.auth.signOut()
                router.push("/")
              }}
              className="rounded-full bg-[#111111] px-5 text-white hover:bg-[#222222]"
            >
              Log out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}