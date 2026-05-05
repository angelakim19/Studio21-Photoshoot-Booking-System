"use client"

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
} from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const menu = [
    { name: "Calendar", href: "/admin", icon: Calendar },

    // ✅ NEW: Appointments
    { name: "Appointments", href: "/admin/appointments", icon: CalendarDays },

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
        <div className="flex flex-col gap-3">
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

      {/* CONTENT */}
      <main className="flex-1 bg-[#F5F5F5] p-8">
        {children}
      </main>

    </div>
  )
}