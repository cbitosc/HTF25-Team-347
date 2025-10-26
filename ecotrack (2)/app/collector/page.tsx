'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, MapPin, Package, CheckCircle, Clock, Route } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/AuthContext';
import { getPickups, updatePickup, subscribeToPickups } from '@/lib/supabase/operations';
import { toast } from 'sonner';

export default function CollectorDashboard() {
  const { userId, userName } = useAuth();
  const [pickups, setPickups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchPickups();
    
    // Subscribe to real-time updates
    const subscription = subscribeToPickups(() => {
      fetchPickups();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const fetchPickups = async () => {
    try {
      const allPickups = await getPickups();
      // Show pending pickups OR pickups assigned to this collector
      const filtered = allPickups.filter((p: any) => 
        p.status === 'pending' || p.collector_id === userId
      );
      setPickups(filtered);
    } catch (error) {
      console.error('Failed to fetch pickups:', error);
      toast.error('Failed to load pickups');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (pickupId: string, currentStatus: string) => {
    setUpdating(pickupId);
    try {
      let newStatus = currentStatus;
      
      // Cycle through statuses
      if (currentStatus === 'pending') {
        newStatus = 'scheduled';
      } else if (currentStatus === 'scheduled') {
        newStatus = 'collected';
      } else if (currentStatus === 'collected') {
        newStatus = 'completed';
      }

      await updatePickup(pickupId, {
        status: newStatus,
        collector_id: userId,
        collector_name: userName,
      } as any);

      toast.success(`Pickup status updated to ${newStatus}`);
      await fetchPickups();
    } catch (error) {
      console.error('Failed to update pickup:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const todayPickups = pickups.filter(p => {
    if (!p.requested_date) return true;
    const pickupDate = new Date(p.requested_date);
    const today = new Date();
    return pickupDate.toDateString() === today.toDateString();
  });

  const assignedCount = pickups.filter(p => p.collector_id === userId).length;
  const completedToday = todayPickups.filter(p => p.status === 'completed').length;
  const pendingCount = pickups.filter(p => p.status === 'pending').length;

  const stats = [
    { label: 'Assigned Pickups', value: String(assignedCount), icon: Package },
    { label: 'Completed Today', value: String(completedToday), icon: CheckCircle },
    { label: 'Pending', value: String(pendingCount), icon: Clock },
    { label: 'Total Pickups', value: String(pickups.length), icon: Route },
  ];

  const quickActions = [
    {
      title: 'View Assigned Pickups',
      description: 'See all your scheduled collections',
      icon: Package,
      link: '/collector/assigned',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Route Optimization',
      description: 'Get the best route for today',
      icon: MapPin,
      link: '/collector/route',
      color: 'bg-green-100 text-green-600',
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <DashboardLayout role="collector">
      <div className="space-y-8">
        <div>
          <h1>Collector Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your pickups and optimize your collection route
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Today's Pickups */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pickup Schedule</CardTitle>
                <CardDescription>
                  {loading ? 'Loading pickups...' : `${pickups.length} total pickups available`}
                </CardDescription>
              </div>
              <Truck className="size-6 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading pickups...</p>
            ) : pickups.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No pickups available</p>
            ) : (
              <div className="space-y-4">
                {pickups.map((pickup) => (
                  <div key={pickup.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm">{pickup.id?.substring(0, 8)}</span>
                        <Badge variant="outline">{pickup.type || 'Unknown'}</Badge>
                        <Badge>{pickup.quantity || 0}kg</Badge>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="size-4 mt-0.5 flex-shrink-0" />
                        <span>{pickup.address}</span>
                      </div>
                      {pickup.requested_date && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Requested: {new Date(pickup.requested_date).toLocaleDateString()}
                        </p>
                      )}
                      {pickup.notes && (
                        <p className="text-sm text-muted-foreground mt-1">Note: {pickup.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(pickup.status)}>
                        {pickup.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        onClick={() => handleUpdateStatus(pickup.id, pickup.status)}
                        disabled={updating === pickup.id || pickup.status === 'completed'}
                      >
                        {updating === pickup.id ? 'Updating...' : 'Update Status'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

