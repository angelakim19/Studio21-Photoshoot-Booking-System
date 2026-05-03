"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { AlertCircle, Calendar, User, LayoutDashboard, Settings, LogOut, Menu, ChevronLeft } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const menu = [
    { name: "Dashboard", href: "/user", icon: LayoutDashboard },
    { name: "Schedule", href: "/user/schedule", icon: Calendar },
    { name: "Profile", href: "/user/profile", icon: User },
    { name: "Settings", href: "/user/settings", icon: Settings },
  ]

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      setShowLogoutDialog(false)
      await supabase.auth.signOut()
      router.push("/login")
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="relative flex min-h-screen">
      {showLogoutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#1a1a1a]">
                <AlertCircle className="h-5 w-5 text-[#C8A96A]" />
                Logout
              </CardTitle>
              <CardDescription>
                Are you sure you want to log out?
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowLogoutDialog(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#C8A96A] text-white hover:bg-[#B8995A]"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* FLOATING TOGGLE BUTTON */}
      <button
        type="button"
        onClick={() => setSidebarOpen((current) => !current)}
        className="absolute left-0 top-8 z-40 -translate-x-1/2 p-3 rounded-full bg-white border-2 border-gray-300 text-[#1a1a1a] hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl"
        style={{ left: sidebarOpen ? "300px" : "0px" }}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {sidebarOpen ? (
          <ChevronLeft className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {/* SIDEBAR */}
      {sidebarOpen && (
        <aside className="w-[300px] bg-[#111111] text-white flex flex-col justify-between p-6">

        {/* TOP */}
        <div>
          {/* LOGO (same style as admin) */}
          <div className="flex items-center gap-3 mb-8">
            <Image src="/favicon.png" alt="logo" width={40} height={40} />
            <div>
              <h2 className="font-serif text-xl">Studio 21</h2>
              <p className="text-sm text-[#C8A96A]">User Dashboard</p>
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

            <button
              onClick={() => setShowLogoutDialog(true)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition cursor-pointer text-gray-300 hover:bg-gray-800"
            >
              <LogOut size={18} />
              Logout
            </button>
          </nav>
        </div>

          {/* BOTTOM USER (same as admin style) */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                <span>U</span>
              </div>
              <div>
                <p className="text-sm">User</p>
                <p className="text-xs text-gray-400">Client</p>
              </div>
            </div>
          </div>

        </aside>
      )}

      {/* CONTENT */}
      <main className="flex-1 bg-[#F5F5F5] p-8">
        {children}
      </main>

    </div>
  )
}