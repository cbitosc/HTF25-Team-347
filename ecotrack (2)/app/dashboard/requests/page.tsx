"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth/AuthContext"
import { getPickupsByUserId } from "@/lib/supabase/operations"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash2 } from "lucide-react"
import { motion } from "framer-motion"

export default function RequestsPage() {
  const { userId } = useAuth()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRequests() {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        const pickupsData = await getPickupsByUserId(userId)
        setRequests(pickupsData)
      } catch (err) {
        console.error("Failed to load requests:", err)
      } finally {
        setLoading(false)
      }
    }

    loadRequests()
  }, [userId])

  const getStatusProgress = (status: string) => {
    const progressMap: Record<string, number> = {
      Requested: 20,
      Assigned: 40,
      "On the Way": 60,
      "Picked Up": 80,
      Delivered: 100,
    }
    return progressMap[status] || 0
  }

  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn userRole="citizen" />
      <div className="flex">
        <Sidebar userRole="citizen" />

        {/* Main Content */}
        <main className="flex-1 md:ml-64 pt-20 md:pt-0">
          <div className="container mx-auto px-4 py-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-3xl font-bold mb-2">My Requests</h1>
              <p className="text-muted-foreground mb-8">Track all your pickup requests</p>

              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            Loading requests...
                          </TableCell>
                        </TableRow>
                      ) : requests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No pickup requests yet. Schedule your first pickup!
                          </TableCell>
                        </TableRow>
                      ) : (
                        requests.map((request, idx) => {
                          const progress = getStatusProgress(request.status)
                          return (
                            <motion.tr
                              key={request.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: idx * 0.05 }}
                            >
                              <TableCell className="font-medium">{request.id}</TableCell>
                              <TableCell>{new Date(request.requested_date).toLocaleDateString()}</TableCell>
                              <TableCell>{request.type}</TableCell>
                              <TableCell>{request.quantity} kg</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    request.status === "Delivered"
                                      ? "default"
                                      : request.status === "Picked Up"
                                        ? "secondary"
                                        : "outline"
                                  }
                                >
                                  {request.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Progress value={progress} className="w-20 h-2" />
                                  <span className="text-xs text-muted-foreground">{progress}%</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="btn-hover">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                    {request.status === "Requested" && (
                                      <DropdownMenuItem className="text-destructive">
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Cancel
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </motion.tr>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
