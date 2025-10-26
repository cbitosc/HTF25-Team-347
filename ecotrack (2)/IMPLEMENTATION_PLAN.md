# 🚀 Complete Implementation Plan

This document outlines all the improvements needed and provides step-by-step implementation.

## 🎯 Overview of Changes

1. **Authentication System** - Proper login with Supabase Auth
2. **Persistent Sessions** - Stay logged in across pages
3. **Real User Data** - Settings & Profile connected to database
4. **Email Validation** - Proper email requirements
5. **Citizen → NGO Donations** - Real-time donation flow
6. **Schedule Pickup Fix** - Waste type detection
7. **Collector Feature** - New functionality
8. **Data Cleanup** - Remove all hardcoded data

---

## 📋 Phase 1: Authentication System (CRITICAL)

### Current Issue:
- Login uses localStorage only
- No real authentication
- No user credentials stored
- Can't persist across sessions

### Solution: Implement Supabase Auth

#### Step 1: Update Supabase Schema

Add to `supabase/schema.sql`:

```sql
-- Add auth trigger to create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'New User'),
    COALESCE(new.raw_user_meta_data->>'role', 'citizen')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

#### Step 2: Create Auth Context

Create `lib/auth/AuthContext.tsx`:

```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  userRole: string | null
  userId: string | null
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setUserId(session?.user?.id ?? null)
      
      if (session?.user) {
        // Get user role from database
        fetchUserRole(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setUserId(session?.user?.id ?? null)
      
      if (session?.user) {
        fetchUserRole(session.user.id)
      } else {
        setUserRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserRole = async (userId: string) => {
    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()
    
    setUserRole(data?.role ?? 'citizen')
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, name: string, role: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUserRole(null)
  }

  return (
    <AuthContext.Provider value={{ user, userRole, userId, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

#### Step 3: Update Root Layout

Wrap app in `app/layout.tsx`:

```typescript
import { AuthProvider } from '@/lib/auth/AuthContext'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

#### Step 4: Update Auth Page

Replace `app/auth/page.tsx` with proper authentication:

```typescript
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, signUp } = useAuth()
  
  const isSignup = searchParams.get('signup') === 'true'
  const defaultRole = searchParams.get('role') || 'citizen'
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState(defaultRole)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignup) {
        await signUp(email, password, name, role)
        alert('Check your email to confirm your account!')
        router.push('/')
      } else {
        await signIn(email, password)
        // Redirect based on role
        const redirectMap = {
          citizen: '/dashboard',
          collector: '/collector',
          ngo: '/ngo',
          admin: '/admin',
        }
        router.push(redirectMap[role] || '/dashboard')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-6">
          {isSignup ? 'Create Account' : 'Sign In'}
        </h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {isSignup && (
            <div>
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="citizen">Citizen</option>
                <option value="collector">Collector</option>
                <option value="ngo">NGO</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Please wait...' : (isSignup ? 'Sign Up' : 'Sign In')}
          </Button>
        </form>
      </Card>
    </div>
  )
}
```

---

## 📋 Phase 2: Persistent Login State

### Step 1: Update Header Component

Add user info display in `components/header.tsx`:

```typescript
import { useAuth } from '@/lib/auth/AuthContext'

export function Header() {
  const { user, userRole, signOut } = useAuth()
  
  return (
    <header>
      {user && (
        <div>
          <span>{user.email}</span>
          <span>Role: {userRole}</span>
          <button onClick={signOut}>Logout</button>
        </div>
      )}
    </header>
  )
}
```

### Step 2: Protected Routes

Create `lib/auth/ProtectedRoute.tsx`:

```typescript
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthContext'

export function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode
  allowedRoles?: string[]
}) {
  const router = useRouter()
  const { user, userRole, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth')
      } else if (allowedRoles && !allowedRoles.includes(userRole!)) {
        router.push('/dashboard')
      }
    }
  }, [user, userRole, loading, allowedRoles, router])

  if (loading || !user) {
    return <div>Loading...</div>
  }

  return <>{children}</>
}
```

---

## 📋 Phase 3: Fix Citizen → NGO Donation Flow

### Current Issue:
Donations from `/dashboard/donations/new` don't use Supabase

### Solution:

Update `app/dashboard/donations/new/page.tsx`:

```typescript
import { addDonation } from '@/lib/supabase/operations'
import { useAuth } from '@/lib/auth/AuthContext'

const { userId, user } = useAuth()

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  try {
    await addDonation({
      id: `DON-${Date.now()}`,
      donor_id: userId!,
      donor_name: user!.email!,
      ngo_id: formData.ngo,
      item: formData.item,
      quantity: parseFloat(formData.quantity),
      address: formData.address,
      lat: 51.505, // Get from geolocation
      lng: -0.09,
      status: 'Pending',
    })
    
    alert('Donation submitted successfully!')
    router.push('/dashboard/donations')
  } catch (err) {
    console.error(err)
    alert('Failed to submit donation')
  }
}
```

---

## 📋 Phase 4: Fix Schedule Pickup Waste Detection

### Issue:
Waste type checkboxes not being saved

### Solution:

Update `app/dashboard/schedule/page.tsx`:

```typescript
const [wasteTypes, setWasteTypes] = useState<string[]>([])

const handleCheckboxChange = (type: string) => {
  setWasteTypes(prev =>
    prev.includes(type)
      ? prev.filter(t => t !== type)
      : [...prev, type]
  )
}

const handleSubmit = async () => {
  await addPickup({
    id: `P-${Date.now()}`,
    user_id: userId!,
    user_name: userName,
    type: wasteTypes.join(', '), // Join all selected types
    quantity: parseFloat(quantity),
    address: address,
    // ... rest of fields
  })
}
```

---

## 📋 Phase 5: New Collector Feature

### Suggested Feature: **Earnings Tracker**

Track collector earnings based on completed pickups:

```typescript
// Add to collector dashboard
const calculateEarnings = () => {
  const completedPickups = pickups.filter(p => p.status === 'Delivered')
  const totalEarnings = completedPickups.reduce((sum, p) => {
    // $0.50 per kg
    return sum + (p.quantity * 0.5)
  }, 0)
  
  return totalEarnings
}
```

---

## 🎯 Implementation Priority

### Week 1: Authentication (CRITICAL)
1. ✅ Implement Supabase Auth
2. ✅ Add AuthContext
3. ✅ Update all pages to use AuthContext
4. ✅ Add protected routes

### Week 2: Data Flow
1. ✅ Fix donation flow
2. ✅ Fix schedule pickup
3. ✅ Update Settings/Profile

### Week 3: Polish
1. ✅ Remove hardcoded emails
2. ✅ Add collector feature
3. ✅ Testing & bug fixes

---

## 📝 Next Steps

Would you like me to:
1. **Start implementing authentication** (most critical)
2. **Fix specific issue first** (which one?)
3. **Create all files at once** (comprehensive update)

**Recommendation:** Start with authentication as it's the foundation for everything else.

Let me know which approach you prefer!
