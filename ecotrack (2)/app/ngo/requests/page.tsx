"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, XCircle, MessageSquare, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useDonationsRealtime } from "@/lib/hooks/useDonationsRealtime"
import { useState } from "react"

export default function NGORequestsPage() {
  const [ngoId] = useState("NGO-001") // In real app, get from auth
  const { donations, loading, error } = useDonationsRealtime(ngoId, "ngo")

  // Filter only pending requests
  const pendingRequests = donations.filter((d) => d.status === "Pending")

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header isLoggedIn userRole="ngo" />
        <div className="flex">
          <Sidebar userRole="ngo" />
          <main className="flex-1 md:ml-64 pt-20 md:pt-0">
            <div className="container mx-auto px-4 py-8">
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Loading requests...</p>
              </Card>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header isLoggedIn userRole="ngo" />
        <div className="flex">
          <Sidebar userRole="ngo" />
          <main className="flex-1 md:ml-64 pt-20 md:pt-0">
            <div className="container mx-auto px-4 py-8">
              <Card className="p-8 text-center border-red-200">
                <p className="text-red-600">Error: {error.message}</p>
              </Card>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn userRole="ngo" />
      <div className="flex">
        <Sidebar userRole="ngo" />

        <main className="flex-1 md:ml-64 pt-20 md:pt-0">
          <div className="container mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <Button variant="ghost" asChild className="mb-4">
                    <Link href="/ngo">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Dashboard
                    </Link>
                  </Button>
                  <h1 className="text-3xl font-bold mb-2">Pending Requests</h1>
                  <p className="text-muted-foreground">
                    Review and respond to donation requests
                  </p>
                </div>
              </div>

              {pendingRequests.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No pending requests at the moment</p>
                </Card>
              ) : (
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Request ID</TableHead>
                          <TableHead>Donor Name</TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingRequests.map((request, idx) => (
                          <motion.tr
                            key={request.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                          >
                            <TableCell className="font-medium">{request.id}</TableCell>
                            <TableCell>{request.donor_name}</TableCell>
                            <TableCell>{request.item}</TableCell>
                            <TableCell>{request.quantity} kg</TableCell>
                            <TableCell className="max-w-xs truncate">{request.address}</TableCell>
                            <TableCell>
                              {new Date(request.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="btn-hover"
                                  asChild
                                >
                                  <Link href="/ngo">
                                    <MessageSquare className="w-4 h-4" />
                                  </Link>
                                </Button>
                                <Button
                                  size="sm"
                                  className="btn-hover"
                                  asChild
                                >
                                  <Link href="/ngo">
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    Review
                                  </Link>
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
