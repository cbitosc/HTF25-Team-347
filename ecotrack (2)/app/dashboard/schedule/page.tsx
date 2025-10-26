"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/AuthContext"
import { addPickup } from "@/lib/supabase/operations"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle2, Upload, MapPin } from "lucide-react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"

interface ScheduleFormData {
  wasteType: string
  quantity: string
  description?: string
  address: string
  pickupDate: string
}

export default function SchedulePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [wasteType, setWasteType] = useState("")
  const form = useForm<ScheduleFormData>()
  const { userId, userName, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && !userId) {
      router.push('/auth')
    }
  }, [userId, authLoading, router])

  const handleSubmit = async (data: ScheduleFormData) => {
    if (!userId || !userName) {
      alert("Please sign in to schedule a pickup")
      router.push('/auth')
      return
    }

    setIsLoading(true)
    try {

      if (!wasteType) {
        alert("Please select a waste type")
        setIsLoading(false)
        return
      }

      // Create pickup ID
      const pickupId = `P${Date.now()}`

      const pickupPayload = {
        id: pickupId,
        user_id: userId,
        user_name: userName || "",
        address: data.address,
        lat: 0,
        lng: 0,
        type: wasteType,
        quantity: Number(data.quantity),
        status: "Requested" as const,
        requested_date: new Date().toISOString(),
      }

      await addPickup(pickupPayload)
      setShowSuccess(true)
      form.reset()
      setWasteType("")
      setTimeout(() => {
        setShowSuccess(false)
        router.push('/dashboard/user/track')
      }, 2000)
    } catch (err) {
      console.error("Failed to save schedule:", err)
      alert("Failed to schedule pickup. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn userRole="citizen" />
      <div className="flex">
        <Sidebar userRole="citizen" />

        {/* Main Content */}
        <main className="flex-1 md:ml-64 pt-20 md:pt-0">
          <div className="container mx-auto px-4 py-8 max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-3xl font-bold mb-2">Schedule a Pickup</h1>
              <p className="text-muted-foreground mb-8">Tell us what waste you have and we'll pick it up for free</p>

              <Card className="p-8">
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  {/* Waste Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Waste Type</label>
                    <Select value={wasteType} onValueChange={setWasteType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select waste type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Plastic">Plastic</SelectItem>
                        <SelectItem value="Metal">Metal</SelectItem>
                        <SelectItem value="E-Waste">E-Waste</SelectItem>
                        <SelectItem value="Glass">Glass</SelectItem>
                        <SelectItem value="Paper">Paper</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {!wasteType && form.formState.isSubmitted && (
                      <p className="text-xs text-destructive">Please select a waste type</p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estimated Quantity (kg)</label>
                    <Input
                      type="number"
                      placeholder="e.g., 25"
                      {...form.register("quantity", { required: "Quantity is required" })}
                    />
                    {form.formState.errors.quantity && (
                      <p className="text-xs text-destructive">{form.formState.errors.quantity.message}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description (Optional)</label>
                    <Textarea
                      placeholder="Describe the waste items..."
                      className="resize-none"
                      {...form.register("description")}
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pickup Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Enter your address"
                        className="pl-10"
                        {...form.register("address", { required: "Address is required" })}
                      />
                    </div>
                    {form.formState.errors.address && (
                      <p className="text-xs text-destructive">{form.formState.errors.address.message}</p>
                    )}
                  </div>

                  {/* Pickup Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Preferred Pickup Date</label>
                    <Input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      {...form.register("pickupDate", { required: "Pickup date is required" })}
                    />
                    {form.formState.errors.pickupDate && (
                      <p className="text-xs text-destructive">{form.formState.errors.pickupDate.message}</p>
                    )}
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Upload Photo (Optional)</label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-all duration-300 ease-out cursor-pointer">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Drag and drop or click to upload</p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" className="w-full btn-hover" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                        Scheduling...
                      </>
                    ) : (
                      "Schedule Pickup"
                    )}
                  </Button>
                </form>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Pickup Scheduled!
            </DialogTitle>
            <DialogDescription>
              Your pickup has been successfully scheduled. Our collector will arrive within 24-48 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Pickup ID: REQ-2025-10-25</p>
              <p className="text-sm text-muted-foreground">You can track your pickup status in the dashboard</p>
            </div>
            <Button onClick={() => setShowSuccess(false)} className="w-full btn-hover">
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
