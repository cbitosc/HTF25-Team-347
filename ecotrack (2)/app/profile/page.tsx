"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/AuthContext"
import { getUserById, updateUser } from "@/lib/supabase/operations"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Phone, MapPin, Save } from "lucide-react"
import { motion } from "framer-motion"

export default function ProfilePage() {
  const router = useRouter()
  const { userId, userRole, user, loading } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!loading && !userId) {
      router.push("/auth")
      return
    }
    
    if (userId) {
      loadUserProfile()
    }
  }, [userId, loading, router])

  const loadUserProfile = async () => {
    if (!userId) return
    try {
      const userData = await getUserById(userId)
      if (userData) {
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          phone: "",
          address: userData.address || ""
        })
      }
    } catch (err) {
      console.error("Failed to load profile:", err)
    }
  }

  const handleSave = async () => {
    if (!userId) return
    setIsSaving(true)
    try {
      await updateUser(userId, {
        name: formData.name,
        address: formData.address
      })
      alert("Profile updated successfully!")
    } catch (err) {
      console.error("Failed to update profile:", err)
      alert("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading || !userRole) return null

  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn userRole={userRole as any} />
      <div className="flex">
        <Sidebar userRole={userRole as any} />

        <main className="flex-1 md:ml-64 pt-20 md:pt-0">
          <div className="container mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
              <p className="text-muted-foreground mb-8">Manage your account information</p>

              <Card className="max-w-2xl p-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Address
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <Button onClick={handleSave} className="w-full btn-hover" disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
