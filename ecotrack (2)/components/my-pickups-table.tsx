"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Eye, Trash2, PackageSearch } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getPickupsByUserId, deletePickup } from "@/lib/supabase/operations"
import { useAuth } from "@/lib/auth/AuthContext"

interface Pickup {
  id: string
  requested_date: string
  type: string
  status: "Requested" | "Assigned" | "On the Way" | "Picked Up" | "Delivered"
  quantity: number
  address: string
  photo_proof?: string | null
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Requested":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    case "Assigned":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    case "On the Way":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
    case "Picked Up":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
    case "Delivered":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getProgressValue = (status: string) => {
  switch (status) {
    case "Requested":
      return 20
    case "Assigned":
      return 40
    case "On the Way":
      return 60
    case "Picked Up":
      return 80
    case "Delivered":
      return 100
    default:
      return 0
  }
}

export function MyPickupsTable() {
  const { userId } = useAuth()
  const [pickups, setPickups] = useState<Pickup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const fetchPickups = async () => {
      if (!userId) {
        setIsLoading(false)
        return
      }
      try {
        const data = await getPickupsByUserId(userId)
        setPickups(data as any)
      } catch (error) {
        console.error("Failed to fetch pickups:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPickups()
  }, [userId])

  const handleCancelPickup = async (id: string) => {
    try {
      await deletePickup(id)
      setPickups(pickups.filter((p) => p.id !== id))
    } catch (error) {
      console.error("Failed to delete pickup:", error)
      alert("Failed to cancel pickup. Please try again.")
    }
  }

  const handleViewDetails = (pickup: Pickup) => {
    setSelectedPickup(pickup)
    setIsDialogOpen(true)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 },
    },
  }

  const progressVariants = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: { duration: 0.6 },
    },
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  }

  // Empty state
  if (!isLoading && pickups.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-muted rounded-full">
              <PackageSearch className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">No Active Pickups</h3>
          <p className="text-muted-foreground mb-6">You have no active pickups. Schedule one today!</p>
          <Button className="btn-hover">Schedule a Pickup</Button>
        </Card>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold">My Pickup Requests</h2>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pickup ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="hidden md:table-cell">Waste Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(3)].map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20" />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Skeleton className="h-2 w-full" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-8 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pickup ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="hidden md:table-cell">Waste Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pickups.map((pickup, index) => (
                    <motion.tr
                      key={pickup.id}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium">{pickup.id}</TableCell>
                      <TableCell className="text-sm">{new Date(pickup.requested_date).toLocaleDateString()}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{pickup.type}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(pickup.status)}>{pickup.status}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <motion.div
                          variants={progressVariants}
                          initial="hidden"
                          animate="visible"
                          style={{ originX: 0 }}
                        >
                          <Progress value={getProgressValue(pickup.status)} className="h-2" />
                        </motion.div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="btn-hover">
                              ⋮
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(pickup)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {pickup.status === "Requested" && (
                              <DropdownMenuItem
                                onClick={() => handleCancelPickup(pickup.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Cancel Pickup
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Details Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <motion.div variants={modalVariants} initial="hidden" animate="visible">
            <DialogHeader>
              <DialogTitle>Pickup Details</DialogTitle>
              <DialogDescription>Complete information about your pickup request</DialogDescription>
            </DialogHeader>

            {selectedPickup && (
              <div className="space-y-4">
                {selectedPickup.photo_proof && (
                  <img
                    src={selectedPickup.photo_proof || "/placeholder.svg"}
                    alt={selectedPickup.type}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Pickup ID</p>
                    <p className="font-semibold">{selectedPickup.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-semibold">{new Date(selectedPickup.requested_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Waste Type</p>
                    <p className="font-semibold">{selectedPickup.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="font-semibold">{selectedPickup.quantity} kg</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge className={getStatusColor(selectedPickup.status)}>{selectedPickup.status}</Badge>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Progress</p>
                  <Progress value={getProgressValue(selectedPickup.status)} className="h-2" />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Address</p>
                  <p className="text-sm">{selectedPickup.address}</p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 btn-hover bg-transparent"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Close
                  </Button>
                  {selectedPickup.status === "Requested" && (
                    <Button
                      variant="destructive"
                      className="flex-1 btn-hover"
                      onClick={() => {
                        handleCancelPickup(selectedPickup.id)
                        setIsDialogOpen(false)
                      }}
                    >
                      Cancel Pickup
                    </Button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  )
}
