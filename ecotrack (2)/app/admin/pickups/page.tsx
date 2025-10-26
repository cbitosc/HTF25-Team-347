"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, Eye, UserCheck } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth/AuthContext"
import { getPickups, getUsersByRole, updatePickup } from "@/lib/supabase/operations"
import { toast } from 'sonner'

export default function PickupsPage() {
  const router = useRouter()
  const { userRole, loading } = useAuth()
  const [pickups, setPickups] = useState<any[]>([])
  const [collectors, setCollectors] = useState<any[]>([])
  const [selectedPickup, setSelectedPickup] = useState<any | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showAssign, setShowAssign] = useState(false)
  const [selectedCollector, setSelectedCollector] = useState<string>('')
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading && userRole !== "admin") {
      router.push("/dashboard")
    }
  }, [userRole, loading, router])

  useEffect(() => {
    if (userRole === "admin") {
      fetchData()
    }
  }, [userRole])

  const fetchData = async () => {
    try {
      const [pickupsData, collectorsData] = await Promise.all([
        getPickups(),
        getUsersByRole('collector')
      ])
      setPickups(pickupsData || [])
      setCollectors(collectorsData || [])
    } catch (error) {
      console.error('Failed to fetch pickups:', error)
      toast.error('Failed to load pickups')
    } finally {
      setDataLoading(false)
    }
  }

  const handleAssignCollector = async () => {
    if (!selectedPickup || !selectedCollector) return
    
    try {
      const collector = collectors.find(c => c.id === selectedCollector)
      await updatePickup(selectedPickup.id, {
        collector_id: selectedCollector,
        collector_name: collector?.name || 'Unknown',
        status: 'scheduled'
      } as any)
      
      toast.success('Collector assigned successfully')
      setShowAssign(false)
      fetchData()
    } catch (error) {
      console.error('Failed to assign collector:', error)
      toast.error('Failed to assign collector')
    }
  }

  if (loading || userRole !== "admin") {
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'collected':
        return 'bg-green-100 text-green-800'
      case 'scheduled':
      case 'in progress':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn userRole="admin" />
      <div className="flex">
        <Sidebar userRole="admin" />

        {/* Main Content */}
        <main className="flex-1 md:ml-64 pt-20 md:pt-0">
          <div className="container mx-auto px-4 py-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-3xl font-bold mb-2">Manage Pickups</h1>
              <p className="text-muted-foreground mb-8">View and manage all pickup requests</p>

              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Collector</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dataLoading ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            Loading pickups...
                          </TableCell>
                        </TableRow>
                      ) : pickups.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            No pickups found
                          </TableCell>
                        </TableRow>
                      ) : (
                        pickups.map((pickup, idx) => (
                          <motion.tr
                            key={pickup.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                          >
                            <TableCell className="font-medium font-mono text-xs">{pickup.id?.substring(0, 12)}</TableCell>
                            <TableCell>{pickup.user_name || 'Unknown'}</TableCell>
                            <TableCell>{pickup.requested_date ? new Date(pickup.requested_date).toLocaleDateString() : new Date(pickup.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-sm max-w-xs truncate">{pickup.address || 'N/A'}</TableCell>
                            <TableCell>{pickup.type || 'N/A'}</TableCell>
                            <TableCell>{pickup.quantity || 0} kg</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(pickup.status)}>
                                {pickup.status || 'Pending'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{pickup.collector_name || 'Unassigned'}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="btn-hover">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedPickup(pickup)
                                      setShowDetails(true)
                                    }}
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {!pickup.collector_id && (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedPickup(pickup)
                                        setShowAssign(true)
                                      }}
                                    >
                                      <UserCheck className="w-4 h-4 mr-2" />
                                      Assign Collector
                                    </DropdownMenuItem>
                                  )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                            </TableCell>
                          </motion.tr>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pickup Details</DialogTitle>
            <DialogDescription>Request ID: {selectedPickup?.id}</DialogDescription>
          </DialogHeader>
          {selectedPickup && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">User</p>
                  <p className="font-medium">{selectedPickup.user_name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{selectedPickup.requested_date ? new Date(selectedPickup.requested_date).toLocaleDateString() : new Date(selectedPickup.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{selectedPickup.type || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-medium">{selectedPickup.quantity || 0} kg</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{selectedPickup.address || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={`mt-1 ${getStatusColor(selectedPickup.status)}`}>{selectedPickup.status || 'Pending'}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Collector</p>
                <p className="font-medium">{selectedPickup.collector_name || 'Unassigned'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Collector Dialog */}
      <Dialog open={showAssign} onOpenChange={setShowAssign}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Collector</DialogTitle>
            <DialogDescription>Select a collector for request {selectedPickup?.id}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedCollector} onValueChange={setSelectedCollector}>
              <SelectTrigger>
                <SelectValue placeholder="Select a collector" />
              </SelectTrigger>
              <SelectContent>
                {collectors.map((collector) => (
                  <SelectItem key={collector.id} value={collector.id}>
                    {collector.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="w-full btn-hover" onClick={handleAssignCollector} disabled={!selectedCollector}>
              Assign
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
