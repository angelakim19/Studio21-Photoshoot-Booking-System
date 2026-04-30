"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Calendar, User, LayoutDashboard, Settings } from "lucide-react"

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const menu = [
    { name: "Dashboard", href: "/user", icon: LayoutDashboard },
    { name: "Schedule", href: "/user/schedule", icon: Calendar },
    { name: "Profile", href: "/user/profile", icon: User },
    { name: "Settings", href: "#", icon: Settings },
  ]

  return (
    <div className="flex min-h-screen">

      {/* SIDEBAR */}
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
          </nav>
        </div>

        {/* BOTTOM USER (same as admin style) */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
            <span>N</span>
          </div>
          <div>
            <p className="text-sm">User</p>
            <p className="text-xs text-gray-400">Client</p>
          </div>
        </div>

      </aside>

      {/* CONTENT */}
      <main className="flex-1 bg-[#F5F5F5] p-8">
        {children}
      </main>

    </div>
  )
}