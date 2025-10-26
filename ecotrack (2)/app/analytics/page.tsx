"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Trophy, Medal, Star } from "lucide-react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AnalyticsPage() {
  const progressData = [
    { month: "Jan", recycled: 400, donated: 240 },
    { month: "Feb", recycled: 520, donated: 290 },
    { month: "Mar", recycled: 680, donated: 350 },
    { month: "Apr", recycled: 750, donated: 420 },
    { month: "May", recycled: 890, donated: 510 },
    { month: "Jun", recycled: 1020, donated: 620 },
  ]

  const wasteData = [
    { type: "Plastic", collected: 2400 },
    { type: "Metal", collected: 1800 },
    { type: "E-Waste", collected: 1200 },
    { type: "Glass", collected: 900 },
    { type: "Other", collected: 600 },
  ]

  const impactData = [
    { category: "CO₂ Saved", value: 85 },
    { category: "Water Saved", value: 72 },
    { category: "Landfill Diverted", value: 90 },
    { category: "Energy Saved", value: 78 },
    { category: "Trees Planted", value: 65 },
  ]

  const leaderboard = [
    { rank: 1, name: "Alex Johnson", kg: 2847, points: 2840, badge: "Gold" },
    { rank: 2, name: "Sarah Chen", kg: 2156, points: 2150, badge: "Silver" },
    { rank: 3, name: "Mike Davis", kg: 1923, points: 1920, badge: "Bronze" },
    { rank: 4, name: "Emma Wilson", kg: 1654, points: 1650, badge: "None" },
    { rank: 5, name: "John Smith", kg: 1432, points: 1430, badge: "None" },
  ]

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

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case "Gold":
        return <Trophy className="w-4 h-4 text-yellow-500" />
      case "Silver":
        return <Medal className="w-4 h-4 text-gray-400" />
      case "Bronze":
        return <Medal className="w-4 h-4 text-orange-600" />
      default:
        return <Star className="w-4 h-4 text-muted-foreground" />
    }
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
              <h1 className="text-3xl font-bold mb-2">Analytics & Impact</h1>
              <p className="text-muted-foreground mb-8">
                Track your environmental impact and compete on the leaderboard
              </p>

              <Tabs defaultValue="progress" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="progress">Progress</TabsTrigger>
                  <TabsTrigger value="impact">Impact</TabsTrigger>
                  <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                </TabsList>

                {/* Progress Tab */}
                <TabsContent value="progress" className="space-y-6">
                  <motion.div
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {/* Recycling Progress */}
                    <motion.div variants={itemVariants}>
                      <Card className="p-6">
                        <h2 className="text-lg font-semibold mb-6">Recycling Progress Over Time</h2>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={progressData}>
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
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="recycled"
                              stroke="var(--color-primary)"
                              strokeWidth={2}
                              dot={{ fill: "var(--color-primary)" }}
                            />
                            <Line
                              type="monotone"
                              dataKey="donated"
                              stroke="var(--color-secondary)"
                              strokeWidth={2}
                              dot={{ fill: "var(--color-secondary)" }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Card>
                    </motion.div>

                    {/* Waste Types */}
                    <motion.div variants={itemVariants}>
                      <Card className="p-6">
                        <h2 className="text-lg font-semibold mb-6">Waste Types Collected (All Time)</h2>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={wasteData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                            <XAxis dataKey="type" stroke="var(--color-muted-foreground)" />
                            <YAxis stroke="var(--color-muted-foreground)" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "var(--color-card)",
                                border: "1px solid var(--color-border)",
                                borderRadius: "8px",
                              }}
                            />
                            <Bar dataKey="collected" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </Card>
                    </motion.div>
                  </motion.div>
                </TabsContent>

                {/* Impact Tab */}
                <TabsContent value="impact">
                  <motion.div variants={itemVariants} initial="hidden" animate="visible">
                    <Card className="p-6">
                      <h2 className="text-lg font-semibold mb-6">Environmental Impact Stats</h2>
                      <ResponsiveContainer width="100%" height={400}>
                        <RadarChart data={impactData}>
                          <PolarGrid stroke="var(--color-border)" />
                          <PolarAngleAxis dataKey="category" stroke="var(--color-muted-foreground)" />
                          <PolarRadiusAxis stroke="var(--color-muted-foreground)" />
                          <Radar
                            name="Impact Score"
                            dataKey="value"
                            stroke="var(--color-primary)"
                            fill="var(--color-primary)"
                            fillOpacity={0.6}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "var(--color-card)",
                              border: "1px solid var(--color-border)",
                              borderRadius: "8px",
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </Card>
                  </motion.div>
                </TabsContent>

                {/* Leaderboard Tab */}
                <TabsContent value="leaderboard">
                  <motion.div variants={itemVariants} initial="hidden" animate="visible">
                    <Card className="overflow-hidden">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12">Rank</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Waste Collected (kg)</TableHead>
                              <TableHead>Green Points</TableHead>
                              <TableHead>Badge</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {leaderboard.map((user, idx) => (
                              <motion.tr
                                key={user.rank}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: idx * 0.05 }}
                                className={user.rank <= 3 ? "bg-muted/50" : ""}
                              >
                                <TableCell className="font-bold text-lg">{user.rank}</TableCell>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.kg.toLocaleString()}</TableCell>
                                <TableCell>{user.points.toLocaleString()}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {getBadgeIcon(user.badge)}
                                    {user.badge !== "None" && (
                                      <Badge variant={user.badge === "Gold" ? "default" : "secondary"}>
                                        {user.badge}
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                              </motion.tr>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </Card>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
