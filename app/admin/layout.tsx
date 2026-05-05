"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
  Calendar,
  CalendarDays,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
} from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const menu = [
    { name: "Calendar", href: "/admin", icon: Calendar },
    { name: "Appointments", href: "/admin/appointments", icon: CalendarDays },
    { name: "Clients", href: "/admin/clients", icon: Users },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Settings", href: "#", icon: Settings },
  ]

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">

      {/* ================= FLOATING BUTTON (CLOSED STATE) ================= */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md border hover:bg-gray-50 transition"
        >
          <Menu size={20} />
        </button>
      )}

      {/* ================= SIDEBAR ================= */}
      {isSidebarOpen && (
        <aside className="w-[300px] bg-[#111111] text-white p-6 flex flex-col justify-between transition-all duration-300">

          <div>
            {/* ================= SIDEBAR HEADER ================= */}
            <div className="flex items-center justify-between mb-8">

              {/* LEFT: branding */}
              <div className="flex items-center gap-3">
                <Image src="/favicon.png" alt="logo" width={36} height={36} />
                <div className="leading-tight">
                  <h2 className="font-serif text-lg">Studio 21</h2>
                  <p className="text-xs text-[#C8A96A]">Admin Dashboard</p>
                </div>
              </div>

              {/* RIGHT: hamburger */}
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-800 transition"
              >
                <Menu size={20} />
              </button>

            </div>

            <hr className="border-gray-800 mb-6" />

            {/* ================= MENU ================= */}
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

          {/* ================= USER FOOTER ================= */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                <span>N</span>
              </div>
            </div>
            
            <hr className="border-gray-800" />
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full group"
            >
              <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>

        </aside>
      )}

      {/* ================= CONTENT ================= */}
      <main className="flex-1 p-8 transition-all duration-300">
        {children}
      </main>

    </div>
  )
}