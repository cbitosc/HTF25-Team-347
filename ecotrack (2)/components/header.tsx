"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Leaf, Menu, X, Bell, LogOut } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth/AuthContext"

interface HeaderProps {
  isLoggedIn?: boolean
  userRole?: "citizen" | "admin" | "collector" | "ngo"
}

export function Header({ isLoggedIn = false, userRole = "citizen" }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href={isLoggedIn ? (userRole === "citizen" ? "/dashboard" : `/${userRole}`) : "/"}
          className="flex items-center gap-2 font-bold text-xl transition-all duration-300 ease-out hover:opacity-80"
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="hidden sm:inline">EcoTrack</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium transition-all duration-300 ease-out hover:text-primary">
            Home
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-medium transition-all duration-300 ease-out hover:text-primary"
          >
            How It Works
          </Link>
          <Link
            href="#features"
            className="text-sm font-medium transition-all duration-300 ease-out hover:text-primary"
          >
            Features
          </Link>
          <Link href="#impact" className="text-sm font-medium transition-all duration-300 ease-out hover:text-primary">
            Impact
          </Link>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {isLoggedIn && (
            <>
              <Button variant="ghost" size="icon" className="btn-hover">
                <Bell className="w-5 h-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer btn-hover">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 transition-all duration-300 ease-out hover:bg-muted rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
            <Link href="/" className="text-sm font-medium transition-all duration-300 ease-out hover:text-primary py-2">
              Home
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium transition-all duration-300 ease-out hover:text-primary py-2"
            >
              How It Works
            </Link>
            <Link
              href="#features"
              className="text-sm font-medium transition-all duration-300 ease-out hover:text-primary py-2"
            >
              Features
            </Link>
            <Link
              href="#impact"
              className="text-sm font-medium transition-all duration-300 ease-out hover:text-primary py-2"
            >
              Impact
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
