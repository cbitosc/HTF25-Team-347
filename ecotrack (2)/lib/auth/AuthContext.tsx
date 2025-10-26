'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  userRole: string | null
  userId: string | null
  userName: string | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, role: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setUserId(session?.user?.id ?? null)
      
      if (session?.user) {
        fetchUserData(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setUserId(session?.user?.id ?? null)
      
      if (session?.user) {
        fetchUserData(session.user.id)
      } else {
        setUserRole(null)
        setUserName(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserData = async (userId: string) => {
    const { data } = await supabase
      .from('users')
      .select('role, name')
      .eq('id', userId)
      .single()
    
    if (data) {
      setUserRole((data as any).role)
      setUserName((data as any).name)
      // Also store in localStorage for backward compatibility
      localStorage.setItem('userRole', (data as any).role)
      localStorage.setItem('userId', userId)
      localStorage.setItem('userName', (data as any).name)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    // Immediately fetch and store profile data for the signed-in user so
    // the app can redirect and show user info synchronously.
    const userId = data?.user?.id
    if (userId) {
      await fetchUserData(userId)
    }
  }

  const signUp = async (email: string, password: string, name: string, role: string) => {
    // First create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (authError) throw authError
    
    // Then create user profile
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          name,
          role,
        } as any)
      
      if (profileError) throw profileError
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUserRole(null)
    setUserName(null)
    localStorage.removeItem('userRole')
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
  }

  return (
    <AuthContext.Provider value={{ user, userRole, userId, userName, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
