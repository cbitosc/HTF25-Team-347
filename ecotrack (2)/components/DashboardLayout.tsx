import { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { Recycle, LogOut, User } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth/AuthContext'

interface DashboardLayoutProps {
  children: ReactNode
  role: string
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const router = useRouter()
  const { signOut, userName } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Logged out successfully')
      router.push('/auth')
    } catch (error) {
      toast.error('Failed to log out')
    }
  }

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      citizen: 'Citizen Dashboard',
      collector: 'Collector Dashboard', 
      ngo: 'NGO Dashboard',
      admin: 'Admin Dashboard'
    }
    return roleMap[role] || 'Dashboard'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href={`/${role === 'citizen' ? 'dashboard' : role}`} className="flex items-center gap-2">
              <div className="bg-green-100 p-2 rounded-full">
                <Recycle className="size-6 text-green-600" />
              </div>
              <span className="font-semibold text-lg">EcoTrack</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="size-4" />
                <span>{userName}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="size-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}