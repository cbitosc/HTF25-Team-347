"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Package, Leaf, Truck, Users } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth/AuthContext"
import { getPickups, getDonations, getUsers } from "@/lib/supabase/operations"

export default function AnalyticsPage() {
  const router = useRouter()
  const { userRole, loading } = useAuth()
  const [pickups, setPickups] = useState<any[]>([])
  const [donations, setDonations] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
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
      const [pickupsData, donationsData, usersData] = await Promise.all([
        getPickups(),
        getDonations(),
        getUsers()
      ])
      setPickups(pickupsData || [])
      setDonations(donationsData || [])
      setUsers(usersData || [])
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  if (loading || userRole !== "admin") {
    return null
  }

  // Calculate real stats
  const totalWaste = pickups.reduce((sum, p) => sum + (p.weight || 0), 0)
  const completedPickups = pickups.filter(p => p.status === 'completed' || p.status === 'collected').length
  const co2Saved = totalWaste * 1.5
  const collectors = users.filter(u => u.role === 'collector').length

  // Group waste by type
  const wasteByType: Record<string, number> = {}
  pickups.forEach(p => {
    const type = p.waste_type || 'Other'
    wasteByType[type] = (wasteByType[type] || 0) + (p.weight || 0)
  })
  const wasteByTypeData = Object.entries(wasteByType).map(([name, value]) => ({ name, value }))

  // Group pickups by month (last 6 months)
  const monthlyPickups: Record<string, number> = {}
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  pickups.forEach(p => {
    if (p.created_at) {
      const date = new Date(p.created_at)
      const monthName = months[date.getMonth()]
      monthlyPickups[monthName] = (monthlyPickups[monthName] || 0) + 1
    }
  })
  const pickupsPerMonthData = Object.entries(monthlyPickups).map(([month, pickups]) => ({ month, pickups }))

  const COLORS = ["#4CAF50", "#03A9F4", "#FFC107"]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn userRole="admin" />
      <div className="flex">
        <Sidebar userRole="admin" />

        {/* Main Content */}
        <main className="flex-1 md:ml-64 pt-20 md:pt-0">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold mb-2">Analytics</h1>
              <p className="text-muted-foreground">View key metrics and reports for the platform.</p>
            </motion.div>

            {/* Stats Cards Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {[
                { label: "Total Waste (kg)", value: dataLoading ? "..." : totalWaste.toFixed(1), icon: Package, color: "text-blue-500" },
                { label: "Pickups Completed", value: dataLoading ? "..." : String(completedPickups), icon: Truck, color: "text-green-500" },
                { label: "CO₂ Saved (kg)", value: dataLoading ? "..." : co2Saved.toFixed(0), icon: Leaf, color: "text-emerald-500" },
                { label: "Active Collectors", value: dataLoading ? "..." : String(collectors), icon: Users, color: "text-purple-500" },
              ].map((stat, idx) => {
                const Icon = stat.icon
                return (
                  <motion.div key={idx} variants={itemVariants}>
                    <Card className="p-6 hover:shadow-lg transition-all duration-300 ease-out">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                          <p className="text-3xl font-bold">{stat.value}</p>
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

            {/* Charts Grid */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* Waste by Type Pie Chart */}
              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle>Waste by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={wasteByTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}kg`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {wasteByTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-card)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Pickups per Month Bar Chart */}
              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle>Pickups per Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={pickupsPerMonthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                      <YAxis stroke="var(--color-muted-foreground)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-card)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="pickups" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
