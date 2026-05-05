"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Calendar, User, LayoutDashboard, Settings, LogOut, Menu } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [userName, setUserName] = useState("User")
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [logoutSuccessOpen, setLogoutSuccessOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    let isActive = true

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!isActive) return

      if (!user) {
        router.replace("/")
        setIsCheckingAuth(false)
        return
      }

      const { data: dbUser } = await supabase
        .from("users")
        .select("first_name")
        .eq("id", user.id)
        .maybeSingle()

      const firstName = dbUser?.first_name || user.user_metadata?.first_name || user.email?.split("@")[0] || "User"
      setUserName(firstName)
      setIsCheckingAuth(false)
    }

    load()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/")
        return
      }

      const firstName =
        session.user.user_metadata?.first_name ||
        session.user.email?.split("@")[0] ||
        "User"
      setUserName(firstName)
    })

    return () => {
      isActive = false
      authListener.subscription.unsubscribe()
    }
  }, [router])

  const menu = [
    { name: "Dashboard", href: "/user", icon: LayoutDashboard },
    { name: "Schedule", href: "/user/schedule", icon: Calendar },
    { name: "Profile", href: "/user/profile", icon: User },
    { name: "Settings", href: "/user/settings", icon: Settings },
  ]

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5] text-sm text-gray-500">
        Loading...
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <aside
        className={`relative bg-[#111111] text-white p-4 md:p-6 flex flex-col justify-between transition-all duration-300 ${
          collapsed ? "w-[88px]" : "w-[300px]"
        }`}
      >
        

        <div>
          <div className={`mb-8 flex items-center ${collapsed ? "justify-between" : "justify-between gap-3"}`}>
            {!collapsed ? (
              <div className="flex items-center gap-3">
                <Image src="/favicon.png" alt="logo" width={40} height={40} />
                <div>
                  <h2 className="font-serif text-xl">Studio 21</h2>
                  <p className="text-sm text-[#C8A96A]">User Dashboard</p>
                </div>
              </div>
            ) : (
              <div />
            )}

            <button
              onClick={() => setCollapsed((prev) => !prev)}
              className="ml-auto flex items-center"
            >
              <Menu size={24} />
            </button>
          </div>

          <hr className="mb-6 border-gray-800" />

          <nav className="flex flex-col gap-2">
            {menu.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link key={item.name} href={item.href}>
                  <div
                    title={collapsed ? item.name : undefined}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition ${
                      isActive ? "bg-[#C8A96A] text-white" : "text-gray-300 hover:bg-gray-800"
                    } ${collapsed ? "justify-center px-2" : ""}`}
                  >
                    <Icon size={18} />
                    {!collapsed && item.name}
                  </div>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className={`flex items-center ${collapsed ? "justify-center" : ""} gap-3`}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black shrink-0">
            <span>{userName?.[0]?.toUpperCase() || "U"}</span>
          </div>
          {!collapsed && (
            <div className="flex-1">
              <p className="text-sm">{userName}</p>
              <p className="text-xs text-gray-400">Client</p>
            </div>
          )}
          <button
            onClick={() => setLogoutOpen(true)}
            title={collapsed ? "Log out" : undefined}
            className="flex items-center gap-2 text-gray-300 hover:text-white"
          >
            <LogOut size={16} />
            {!collapsed && <span className="text-sm">Log out</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <main className="flex-1 bg-[#F5F5F5] p-8">{children}</main>
        
      </div>

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="rounded-3xl border-[#ece4d7] bg-[#fffaf2] shadow-[0_18px_50px_rgba(17,17,17,0.16)]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-[#111111]">Log out?</DialogTitle>
            <DialogDescription className="text-gray-600">
              You will be signed out of your account and returned to the login page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutOpen(false)} className="rounded-full border-[#ded3c1] px-5">
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await supabase.auth.signOut()
                setLogoutOpen(false)
                setLogoutSuccessOpen(true)
                setTimeout(() => {
                  setLogoutSuccessOpen(false)
                  router.replace("/")
                }, 1500)
              }}
              className="rounded-full bg-[#111111] px-5 text-white hover:bg-[#222222]"
            >
              Log out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {logoutSuccessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-[320px] rounded-2xl bg-white p-6 text-center shadow-lg">
            <h2 className="mb-2 text-lg font-semibold">Log out Successful!</h2>
            <p className="text-sm text-gray-600">Redirecting to the landing page...</p>
          </div>
        </div>
      )}
    </div>
  )
}