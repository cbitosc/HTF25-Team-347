'use client';

import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, TrendingUp, Recycle, Leaf, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function UserReportsPage() {
  const impactStats = [
    { label: 'Waste Recycled', value: '127 kg', icon: Recycle, progress: 85 },
    { label: 'CO₂ Prevented', value: '45 kg', icon: Leaf, progress: 60 },
    { label: 'Trees Saved', value: '3.2', icon: TrendingUp, progress: 70 },
    { label: 'Impact Score', value: '850', icon: Award, progress: 95 },
  ];

  const monthlyData = [
    { month: 'Jan', plastic: 12, metal: 8, paper: 15, glass: 5 },
    { month: 'Feb', plastic: 15, metal: 10, paper: 18, glass: 7 },
    { month: 'Mar', plastic: 20, metal: 12, paper: 22, glass: 9 },
    { month: 'Apr', plastic: 18, metal: 14, paper: 25, glass: 11 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn userRole="citizen" />
      <div className="flex">
        <Sidebar userRole="citizen" />

        <main className="flex-1 md:ml-64 pt-20 md:pt-0">
          <div className="container mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-8">
                <Button variant="ghost" asChild className="mb-4">
                  <Link href="/dashboard">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
                <h1 className="text-3xl font-bold mb-2">Environmental Impact Report</h1>
                <p className="text-muted-foreground">Track your contribution to a greener planet</p>
              </div>

              {/* Impact Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {impactStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-2 bg-green-100 rounded-full">
                            <stat.icon className="w-5 h-5 text-green-600" />
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {stat.progress}%
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                          <p className="text-2xl font-bold">{stat.value}</p>
                          <Progress value={stat.progress} className="mt-2 h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Waste Breakdown</CardTitle>
                    <CardDescription>Your recycling activity by material type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {monthlyData.map((month, index) => (
                        <div key={month.month} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{month.month}</span>
                            <span className="text-sm text-muted-foreground">
                              {month.plastic + month.metal + month.paper + month.glass} kg total
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <div className="text-center">
                              <div className="bg-blue-100 rounded p-2">
                                <p className="text-xs text-blue-600">Plastic</p>
                                <p className="font-semibold text-blue-700">{month.plastic}kg</p>
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="bg-yellow-100 rounded p-2">
                                <p className="text-xs text-yellow-600">Metal</p>
                                <p className="font-semibold text-yellow-700">{month.metal}kg</p>
                              </div>
                            </div>
                            <div className="bg-green-100 rounded p-2">
                              <p className="text-xs text-green-600">Paper</p>
                              <p className="font-semibold text-green-700">{month.paper}kg</p>
                            </div>
                            <div className="bg-purple-100 rounded p-2">
                              <p className="text-xs text-purple-600">Glass</p>
                              <p className="font-semibold text-purple-700">{month.glass}kg</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Achievements */}
                <Card>
                  <CardHeader>
                    <CardTitle>Eco Achievements</CardTitle>
                    <CardDescription>Milestones you've reached</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Award className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-green-700">Recycling Champion</p>
                          <p className="text-sm text-green-600">Recycled over 100kg of waste</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Leaf className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-blue-700">Carbon Saver</p>
                          <p className="text-sm text-blue-600">Prevented 40kg+ CO₂ emissions</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="p-2 bg-gray-100 rounded-full">
                          <TrendingUp className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Consistency Pro</p>
                          <p className="text-sm text-gray-600">10+ pickups this month</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Environmental Impact Summary */}
              <Card className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="w-6 h-6 text-green-600" />
                    Your Environmental Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">127kg</p>
                      <p className="text-sm text-muted-foreground">Total waste recycled</p>
                      <p className="text-xs text-green-600 mt-1">Equivalent to saving 1.5 trees</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">45kg</p>
                      <p className="text-sm text-muted-foreground">CO₂ emissions prevented</p>
                      <p className="text-xs text-blue-600 mt-1">Same as removing a car for 180km</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-600">850</p>
                      <p className="text-sm text-muted-foreground">EcoTrack impact score</p>
                      <p className="text-xs text-purple-600 mt-1">Top 15% of all users!</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}