"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/DashboardLayout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  CheckCircle2,
  XCircle,
  Gift,
  PackageCheck,
  Inbox,
  Plus,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Users,
} from "lucide-react"
import { motion } from "framer-motion"
import { SharedMap, type MapLocation } from "@/components/shared-map"
import { useAuth } from "@/lib/auth/AuthContext"
import { updateDonation, getUserById, getDonationsByNGO, addNGOMaterial, getNGOMaterials, subscribeToDonations } from "@/lib/supabase/operations"
import { toast } from 'sonner'
import type { Database } from "@/lib/supabase/database.types"

type InventoryItem = Database["public"]["Tables"]["ngo_inventory"]["Row"]

export default function NGOPage() {
  const router = useRouter()
  const { userId, userName, userRole: authUserRole } = useAuth()
  const [userRole, setUserRole] = useState<"ngo" | null>(null)
  const [donations, setDonations] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDonation, setSelectedDonation] = useState<(typeof donations)[0] | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [dialogAction, setDialogAction] = useState<"accept" | "decline" | "logMaterial" | "message" | null>(null)
  const [pickupDate, setPickupDate] = useState("")
  const [newMaterial, setNewMaterial] = useState({ item: "", quantity: "0", date: "", unit: "kg" })
  const [messageContent, setMessageContent] = useState("")

  useEffect(() => {
    if (authUserRole !== "ngo") {
      router.push("/dashboard")
    } else {
      setUserRole("ngo")
    }
  }, [router, authUserRole])

  // Fetch donations and materials
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        const [donationsData, materialsData] = await Promise.all([
          getDonationsByNGO(userId),
          getNGOMaterials(userId)
        ])
        
        setDonations(donationsData || [])
        setMaterials(materialsData || [])
      } catch (err) {
        console.error("Failed to fetch data:", err)
        toast.error('Failed to load NGO data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    
    // Subscribe to real-time donation updates
    const subscription = subscribeToDonations(async () => {
      if (userId) {
        const updatedDonations = await getDonationsByNGO(userId)
        setDonations(updatedDonations || [])
        toast.info('New donation received!')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  // Calculate statistics
  const stats = {
    pendingRequests: donations.filter((d) => d.status === "Pending").length,
    totalDonated: donations.reduce((sum: number, d: any) => sum + (d.quantity || 0), 0),
    totalRecycled: materials.reduce((sum: number, m: any) => sum + (m.weight || 0), 0),
    activeDonors: new Set(donations.map((d) => d.donor_id)).size,
  }

  // Map locations for donation visualization
  const donationLocations: MapLocation[] = donations
    .filter((d) => d.status === "Pending" || d.status === "Accepted")
    .map((d) => ({
      id: d.id,
      lat: d.lat,
      lng: d.lng,
      title: d.item,
      description: `From: ${d.donor_name} | ${d.quantity} kg`,
      type: "ngo" as const,
      status: d.status,
    }))

  const handleAction = (donation: (typeof donations)[0], action: "accept" | "decline") => {
    setSelectedDonation(donation)
    setDialogAction(action)
    setShowDialog(true)
  }

  const confirmAction = async () => {
    if (selectedDonation && dialogAction) {
      try {
        const newStatus = dialogAction === "accept" ? "Accepted" : "Declined"
        await updateDonation(selectedDonation.id, {
          status: newStatus as any,
          pickup_date: dialogAction === "accept" ? pickupDate : undefined,
        })
        // Refresh donations list
        const updatedDonations = await getDonationsByNGO(userId!)
        setDonations(updatedDonations || [])
        toast.success(`Donation ${newStatus.toLowerCase()}`)
      } catch (err) {
        console.error("Failed to update donation:", err)
        alert("Failed to update donation. Please try again.")
      }
    }
    setShowDialog(false)
    setPickupDate("")
  }

  const handleLogMaterial = async () => {
    if (userId && newMaterial.item && newMaterial.quantity) {
      try {
        await addNGOMaterial({
          ngo_id: userId,
          material_type: newMaterial.item,
          weight: Number.parseFloat(newMaterial.quantity),
          source: 'Manual entry',
          notes: `Logged on ${new Date().toLocaleDateString()}`
        })
        
        // Refresh materials
        const updated = await getNGOMaterials(userId)
        setMaterials(updated || [])
        toast.success('Material logged successfully')
      } catch (err) {
        console.error("Failed to log material:", err)
        toast.error('Failed to log material')
      }
    }
    setNewMaterial({ item: "", quantity: "0", date: "", unit: "kg" })
    setShowDialog(false)
  }

  const handleSendMessage = () => {
    console.log("Sending message to donor:", messageContent)
    setMessageContent("")
    setShowDialog(false)
  }

  return (
    <>
    <DashboardLayout role="ngo">
            <div>
              <h1 className="text-3xl font-bold mb-2">NGO Dashboard</h1>
              <p className="text-muted-foreground mb-8">Manage donations and track recycled materials</p>

              {loading && (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Loading data...</p>
                </Card>
              )}

              {!loading && (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full max-w-2xl grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="donations">Donations</TabsTrigger>
                  <TabsTrigger value="inventory">Inventory</TabsTrigger>
                  <TabsTrigger value="map">Map View</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-8">
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                  >
                    {[
                      { label: "Pending Requests", value: stats.pendingRequests, icon: Inbox, color: "text-blue-500" },
                      {
                        label: "Total Donated (kg)",
                        value: stats.totalDonated,
                        icon: Gift,
                        color: "text-emerald-500",
                      },
                      {
                        label: "Recycled (kg)",
                        value: stats.totalRecycled,
                        icon: PackageCheck,
                        color: "text-primary",
                      },
                      { label: "Active Donors", value: stats.activeDonors, icon: Users, color: "text-purple-500" },
                    ].map((stat, idx) => {
                      const Icon = stat.icon
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: idx * 0.1 }}
                        >
                          <Card className="p-6 hover:shadow-lg transition-all duration-300 ease-out">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                                <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
                              </div>
                              <div className={`p-3 bg-muted rounded-lg ${stat.color}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                </TabsContent>

                {/* Donation Requests Tab */}
                <TabsContent value="donations">
                  <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Donation ID</TableHead>
                            <TableHead>Donor Name</TableHead>
                            <TableHead>Item(s) Description</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {donations.map((donation, idx) => (
                            <motion.tr
                              key={donation.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: idx * 0.05 }}
                            >
                              <TableCell className="font-medium">{donation.id}</TableCell>
                              <TableCell>{donation.donor_name}</TableCell>
                              <TableCell>{donation.item}</TableCell>
                              <TableCell>{donation.quantity} kg</TableCell>
                              <TableCell>
                                <Badge variant={donation.status === "Accepted" ? "default" : "outline"}>
                                  {donation.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {donation.status === "Pending" ? (
                                  <div className="flex gap-2 justify-end">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="btn-hover"
                                      onClick={() => {
                                        setSelectedDonation(donation)
                                        setDialogAction("message")
                                        setShowDialog(true)
                                      }}
                                    >
                                      <MessageSquare className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="btn-hover"
                                      onClick={() => handleAction(donation, "accept")}
                                    >
                                      <CheckCircle2 className="w-4 h-4 mr-1" />
                                      Accept
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="btn-hover"
                                      onClick={() => handleAction(donation, "decline")}
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Decline
                                    </Button>
                                  </div>
                                ) : (
                                  <Badge variant="secondary">Processed</Badge>
                                )}
                              </TableCell>
                            </motion.tr>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                </TabsContent>

                {/* Inventory Tab */}
                <TabsContent value="inventory">
                  <div className="space-y-4">
                    <Button
                      onClick={() => {
                        setDialogAction("logMaterial")
                        setShowDialog(true)
                      }}
                      className="btn-hover"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Log New Materials
                    </Button>

                    <Card className="overflow-hidden">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Material ID</TableHead>
                              <TableHead>Item Type</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Date Received</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {materials.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                  No materials logged yet
                                </TableCell>
                              </TableRow>
                            ) : (
                              materials.map((item: any, idx: number) => (
                                <motion.tr
                                  key={item.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                                >
                                  <TableCell className="font-medium">{item.id?.substring(0, 8)}</TableCell>
                                  <TableCell>{item.material_type}</TableCell>
                                  <TableCell>{item.weight} kg</TableCell>
                                  <TableCell>
                                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                                  </TableCell>
                                </motion.tr>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </Card>
                  </div>
                </TabsContent>

                {/* Map View Tab */}
                <TabsContent value="map">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-semibold">Donation Locations</h2>
                        <p className="text-sm text-muted-foreground">
                          View active and pending donation locations on map
                        </p>
                      </div>
                    </div>
                    <SharedMap
                      locations={donationLocations}
                      center={[0, 0]}
                      height="600px"
                    />
                  </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics">
                  <div className="space-y-6">
                    <Card className="p-6">
                      <div className="flex items-center gap-2 mb-6">
                        <BarChart3 className="w-5 h-5" />
                        <h2 className="text-lg font-semibold">Impact Analytics</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Total Impact</p>
                              <p className="text-3xl font-bold text-green-600">{stats.totalRecycled} kg</p>
                              <p className="text-xs text-muted-foreground mt-1">Waste recycled this month</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-green-500" />
                          </div>
                        </Card>
                        <Card className="p-4 bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">CO₂ Prevented</p>
                              <p className="text-3xl font-bold text-blue-600">
                                {(stats.totalRecycled * 1.5).toFixed(0)} kg
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">Environmental impact</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-blue-500" />
                          </div>
                        </Card>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Accepted Waste Types</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="px-3 py-1">Plastic</Badge>
                        <Badge variant="outline" className="px-3 py-1">Metal</Badge>
                        <Badge variant="outline" className="px-3 py-1">Paper</Badge>
                        <Badge variant="outline" className="px-3 py-1">Glass</Badge>
                        <Badge variant="outline" className="px-3 py-1">E-Waste</Badge>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">About Our Organization</h3>
                      <p className="text-muted-foreground">
                        {userName || 'Our organization'} is committed to environmental sustainability and recycling initiatives.
                      </p>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
              )}
            </div>
    </DashboardLayout>

      {/* Action Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === "accept"
                ? "Accept Donation"
                : dialogAction === "decline"
                  ? "Decline Donation"
                  : dialogAction === "message"
                    ? "Message Donor"
                    : "Log New Materials"}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === "accept"
                ? `Accept donation ${selectedDonation?.id} from ${selectedDonation?.donor_name}?`
                : dialogAction === "decline"
                  ? `Decline donation ${selectedDonation?.id}?`
                  : dialogAction === "message"
                    ? `Send a message to ${selectedDonation?.donor_name}`
                    : "Add new materials to inventory"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {(dialogAction === "accept" || dialogAction === "decline") && (
              <>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium mb-1">{selectedDonation?.item}</p>
                  <p className="text-sm text-muted-foreground">From: {selectedDonation?.donor_name}</p>
                  <p className="text-sm text-muted-foreground">Quantity: {selectedDonation?.quantity} kg</p>
                </div>

                {dialogAction === "accept" && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Schedule Pickup Coordination</label>
                    <Input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
                  </div>
                )}
              </>
            )}

            {dialogAction === "message" && (
              <div className="space-y-3">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium">{selectedDonation?.donor_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedDonation?.item} - {selectedDonation?.quantity} kg
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Your Message</label>
                  <Textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Type your message to the donor..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {dialogAction === "logMaterial" && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Item Type</label>
                  <Input
                    value={newMaterial.item}
                    onChange={(e) => setNewMaterial({ ...newMaterial, item: e.target.value })}
                    placeholder="e.g., Aluminum, Plastic"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Quantity</label>
                    <Input
                      type="number"
                      value={newMaterial.quantity}
                      onChange={(e) => setNewMaterial({ ...newMaterial, quantity: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Unit</label>
                    <Input
                      value={newMaterial.unit}
                      onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
                      placeholder="kg"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Date</label>
                  <Input
                    type="date"
                    value={newMaterial.date}
                    onChange={(e) => setNewMaterial({ ...newMaterial, date: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="flex-1 btn-hover bg-transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={
                  dialogAction === "logMaterial"
                    ? handleLogMaterial
                    : dialogAction === "message"
                      ? handleSendMessage
                      : confirmAction
                }
                className="flex-1 btn-hover"
                variant={dialogAction === "decline" ? "destructive" : "default"}
              >
                {dialogAction === "accept"
                  ? "Accept & Schedule"
                  : dialogAction === "decline"
                    ? "Decline"
                    : dialogAction === "message"
                      ? "Send Message"
                      : "Log Material"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
