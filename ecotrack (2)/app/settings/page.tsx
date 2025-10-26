"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/AuthContext"
import { supabase } from "@/lib/supabase/client"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Bell, Shield, Save, Mail, Phone } from "lucide-react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  const router = useRouter()
  const { userId, userRole, loading } = useAuth()
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!loading && !userId) {
      router.push("/auth")
    }
  }, [userId, loading, router])

  const handleSave = () => {
    console.log("Saving settings:", notifications)
    alert("Settings saved successfully!")
  }

  const handlePasswordChange = async () => {
    const newPassword = prompt("Enter new password (min 6 chars):")
    if (!newPassword || newPassword.length < 6) {
      alert("Password must be at least 6 characters")
      return
    }
    setIsSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      alert("Password updated successfully!")
    } catch (err) {
      console.error(err)
      alert("Failed to update password")
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
              <h1 className="text-3xl font-bold mb-2">Settings</h1>
              <p className="text-muted-foreground mb-8">Manage your account and preferences</p>

              <Tabs defaultValue="notifications" className="max-w-3xl">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>


                <TabsContent value="notifications">
                  <Card className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email Notifications
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications via email
                          </p>
                        </div>
                        <Switch
                          checked={notifications.email}
                          onCheckedChange={(checked) =>
                            setNotifications({ ...notifications, email: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="flex items-center gap-2">
                            <Bell className="w-4 h-4" />
                            Push Notifications
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Receive push notifications in browser
                          </p>
                        </div>
                        <Switch
                          checked={notifications.push}
                          onCheckedChange={(checked) =>
                            setNotifications({ ...notifications, push: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            SMS Notifications
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Receive SMS for important updates
                          </p>
                        </div>
                        <Switch
                          checked={notifications.sms}
                          onCheckedChange={(checked) =>
                            setNotifications({ ...notifications, sms: checked })
                          }
                        />
                      </div>

                      <Button onClick={handleSave} className="w-full btn-hover">
                        <Save className="w-4 h-4 mr-2" />
                        Save Preferences
                      </Button>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="security">
                  <Card className="p-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Password
                        </Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Change your account password
                        </p>
                        <Button onClick={handlePasswordChange} disabled={isSaving} className="btn-hover">
                          {isSaving ? "Updating..." : "Change Password"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
