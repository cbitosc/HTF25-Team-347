"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Calendar, FileText, Gift, BarChart3, Settings, LogOut, Menu, X, Leaf, Users, Truck } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth/AuthContext"

interface SidebarProps {
  userRole?: "citizen" | "admin" | "collector" | "ngo"
}

export function Sidebar({ userRole = "citizen" }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getNavItems = () => {
    const baseItems = [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/dashboard/schedule", label: "Schedule Pickup", icon: Calendar },
      { href: "/dashboard/requests", label: "My Requests", icon: FileText },
      { href: "/dashboard/donations", label: "My Donations", icon: Gift },
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
    ]

    if (userRole === "admin") {
      return [
        { href: "/admin", label: "Overview", icon: Home },
        { href: "/admin/pickups", label: "Manage Pickups", icon: Truck },
        { href: "/admin/users", label: "Users", icon: Users },
        { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      ]
    }

    if (userRole === "collector") {
      return [
        { href: "/collector", label: "My Pickups", icon: Truck },
      ]
    }

    if (userRole === "ngo") {
      return [
        { href: "/ngo", label: "Donations", icon: Gift },
        { href: "/ngo/requests", label: "Requests", icon: FileText },
      ]
    }

    return baseItems
  }

  const navItems = getNavItems()

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="fixed top-20 left-4 z-40 md:hidden p-2 hover:bg-muted rounded-lg transition-all duration-300 ease-out"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-border bg-sidebar transition-transform duration-300 md:translate-x-0 z-30",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-6 space-y-8 h-full flex flex-col">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-all duration-300 ease-out"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span>EcoTrack</span>
          </Link>

          {/* Navigation */}
          <nav className="space-y-2 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 ease-out text-sm font-medium",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="space-y-2 border-t border-sidebar-border pt-4">
            <Button variant="ghost" className="w-full justify-start gap-3 text-sm" asChild>
              <Link href="/settings">
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sm text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
