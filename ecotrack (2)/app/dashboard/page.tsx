'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Gift, BarChart3, Package, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth/AuthContext';
import { getPickupsByUserId, getUserStats, getDonationsByDonor, subscribeToUserStats } from '@/lib/supabase/operations';
import { Skeleton } from '@/components/ui/skeleton';
import { useRealtimePickups } from '@/lib/hooks/useRealtimePickups';
import { useRealtimeDonations } from '@/lib/hooks/useRealtimeDonations';

export default function UserDashboard() {
  const { userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [initialPickups, setInitialPickups] = useState<any[]>([]);
  const [initialDonations, setInitialDonations] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);

  // Use real-time hooks
  const pickups = useRealtimePickups(initialPickups);
  const donations = useRealtimeDonations(initialDonations);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const [pickupsData, donationsData, statsData] = await Promise.all([
          getPickupsByUserId(userId),
          getDonationsByDonor(userId),
          getUserStats(userId),
        ]);

        setInitialPickups(pickupsData || []);
        setInitialDonations(donationsData || []);
        setUserStats(statsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

  // Subscribe to user stats changes
  useEffect(() => {
    if (!userId) return;

    const channel = subscribeToUserStats(userId, (payload) => {
      if (payload.eventType === 'UPDATE' && payload.new) {
        setUserStats(payload.new);
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  const stats = [
    { label: 'Total Pickups', value: userStats?.total_pickups?.toString() || '0', icon: Package },
    { label: 'Active Requests', value: pickups.filter(p => p.status !== 'Delivered').length.toString(), icon: Calendar },
    { label: 'Items Donated', value: donations.length.toString(), icon: Gift },
    { label: 'CO₂ Saved', value: userStats?.co2_saved ? `${Math.round(userStats.co2_saved)}kg` : '0kg', icon: CheckCircle },
  ];

  const quickActions = [
    {
      title: 'Schedule Pickup',
      description: 'Request a new waste collection',
      icon: Calendar,
      link: '/dashboard/user/schedule',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Track Pickups',
      description: 'View your pickup status',
      icon: MapPin,
      link: '/dashboard/user/track',
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Donate Items',
      description: 'Send reusable items to NGOs',
      icon: Gift,
      link: '/dashboard/user/donate',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'View Reports',
      description: 'Check your waste statistics',
      icon: BarChart3,
      link: '/dashboard/user/reports',
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  const recentPickups = pickups.slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Picked Up': return 'bg-green-100 text-green-700';
      case 'On the Way': return 'bg-blue-100 text-blue-700';
      case 'Assigned': return 'bg-blue-100 text-blue-700';
      case 'Requested': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <DashboardLayout role="user">
      <div className="space-y-8">
        <div>
          <h1>User Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Manage your waste pickups and track your environmental impact.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))
          ) : (
            stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className="size-8 text-muted-foreground opacity-60" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.link}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className={`${action.color} p-3 rounded-full w-fit mb-2`}>
                      <action.icon className="size-6" />
                    </div>
                    <CardTitle>{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Pickups */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Pickups</CardTitle>
            <CardDescription>Your latest waste collection requests</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : recentPickups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No pickups yet. Schedule your first pickup!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPickups.map((pickup) => (
                  <div key={pickup.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{pickup.id}</span>
                        <Badge variant="outline">{pickup.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(pickup.requested_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(pickup.status)}>{pickup.status}</Badge>
                  </div>
                ))}
              </div>
            )}
            <Link href="/dashboard/user/track">
              <div className="mt-4 text-center text-sm text-primary hover:underline">
                View all pickups →
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

