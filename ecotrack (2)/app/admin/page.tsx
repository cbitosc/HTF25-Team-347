'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, TrendingUp, Settings, BarChart3, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    { label: 'Total Users', value: '...', icon: Users },
    { label: 'Active Pickups', value: '...', icon: Package },
    { label: 'Collectors Active', value: '...', icon: MapPin },
    { label: 'NGO Partners', value: '...', icon: Settings },
  ]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch users count
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Fetch active pickups
      const { count: activePickups } = await supabase
        .from('pickups')
        .select('*', { count: 'exact', head: true })
        .in('status', ['Pending', 'Assigned', 'In Progress']);

      // Fetch collectors
      const { count: collectorsActive } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'collector');

      // Fetch NGOs
      const { count: ngoPartners } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'ngo');

      // Fetch recent pickups for activity
      const { data: recentPickups } = await supabase
        .from('pickups')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      // Fetch recent donations for activity (without join - we'll fetch NGO names separately)
      const { data: recentDonations } = await supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2);

      // Fetch NGO names for the donations
      const ngoIds = recentDonations?.map(d => d.ngo_id).filter(Boolean) || [];
      const { data: ngoUsers } = await supabase
        .from('users')
        .select('id, name')
        .in('id', ngoIds);
      
      // Create a map of NGO IDs to names
      const ngoMap = new Map(ngoUsers?.map(ngo => [ngo.id, ngo.name]) || []);

      // Update stats
      setStats([
        { label: 'Total Users', value: totalUsers?.toString() || '0', icon: Users },
        { label: 'Active Pickups', value: activePickups?.toString() || '0', icon: Package },
        { label: 'Collectors Active', value: collectorsActive?.toString() || '0', icon: MapPin },
        { label: 'NGO Partners', value: ngoPartners?.toString() || '0', icon: Settings },
      ]);

      // Build recent activity from pickups and donations
      const activities: any[] = [];
      
      recentPickups?.forEach((pickup) => {
        const timeAgo = getTimeAgo(pickup.created_at);
        activities.push({
          type: 'Pickup',
          action: `Pickup ${pickup.id.substring(0, 8)} - ${pickup.status}`,
          time: timeAgo,
          status: pickup.status === 'Completed' ? 'success' : 'info',
        });
      });

      recentDonations?.forEach((donation: any) => {
        const timeAgo = getTimeAgo(donation.created_at);
        const ngoName = ngoMap.get(donation.ngo_id) || 'NGO';
        activities.push({
          type: 'Donation',
          action: `${ngoName} received donation - ${donation.status}`,
          time: timeAgo,
          status: donation.status === 'Accepted' ? 'success' : 'info',
        });
      });

      // Sort by most recent
      activities.sort((a, b) => {
        const timeA = a.time.includes('min') ? parseInt(a.time) : parseInt(a.time) * 60;
        const timeB = b.time.includes('min') ? parseInt(b.time) : parseInt(b.time) * 60;
        return timeA - timeB;
      });

      setRecentActivity(activities.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage users and permissions',
      icon: Users,
      link: '/admin/users',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Monitor Pickups',
      description: 'Track all pickup activities',
      icon: Package,
      link: '/admin/pickups',
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Analytics & Reports',
      description: 'View system-wide statistics',
      icon: BarChart3,
      link: '/admin/analytics',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'System Settings',
      description: 'Configure system parameters',
      icon: Settings,
      link: '#',
      color: 'bg-orange-100 text-orange-600',
    },
  ];


  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-700';
      case 'info': return 'bg-blue-100 text-blue-700';
      case 'warning': return 'bg-yellow-100 text-yellow-700';
      case 'error': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage the entire waste management system
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="mt-2">{stat.value}</p>
                  </div>
                  <stat.icon className="size-8 text-muted-foreground opacity-60" />
                </div>
              </CardContent>
            </Card>
          ))}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system events and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading activity...</p>
                ) : recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                ) : (
                  recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                    <div className={`${getActivityColor(activity.status)} px-2 py-1 rounded text-xs mt-1`}>
                      {activity.type}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Current system performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Pickup Success Rate</span>
                    <span className="text-sm">94%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '94%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Collector Utilization</span>
                    <span className="text-sm">87%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '87%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">NGO Response Rate</span>
                    <span className="text-sm">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '78%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">User Satisfaction</span>
                    <span className="text-sm">91%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '91%' }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-6 text-blue-600" />
              This Month's Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Pickups</p>
                <p className="mt-1">342</p>
                <p className="text-xs text-green-600 mt-1">↑ 12% from last month</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Waste Collected</p>
                <p className="mt-1">4,245 kg</p>
                <p className="text-xs text-green-600 mt-1">↑ 8% from last month</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New Users</p>
                <p className="mt-1">87</p>
                <p className="text-xs text-green-600 mt-1">↑ 15% from last month</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CO₂ Prevented</p>
                <p className="mt-1">6,234 kg</p>
                <p className="text-xs text-green-600 mt-1">↑ 10% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
