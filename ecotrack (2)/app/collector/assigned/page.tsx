'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/AuthContext';
import { getPickupsByCollectorId, updatePickup } from '@/lib/supabase/operations';
import { toast } from 'sonner';
import { MapPin, Calendar, Package } from 'lucide-react';

export default function AssignedPickupsPage() {
  const { userId } = useAuth();
  const [pickups, setPickups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchAssignedPickups();
    }
  }, [userId]);

  const fetchAssignedPickups = async () => {
    try {
      const data = await getPickupsByCollectorId(userId!);
      setPickups(data || []);
    } catch (error) {
      console.error('Failed to fetch pickups:', error);
      toast.error('Failed to load assigned pickups');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'collected': return 'bg-blue-100 text-blue-700';
      case 'scheduled': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <DashboardLayout role="collector">
      <div className="space-y-6">
        <div>
          <h1>Assigned Pickups</h1>
          <p className="text-muted-foreground">
            View all pickups assigned to you
          </p>
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Loading pickups...</p>
            </CardContent>
          </Card>
        ) : pickups.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No pickups assigned yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pickups.map((pickup) => (
              <Card key={pickup.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{pickup.waste_type}</CardTitle>
                      <CardDescription>{pickup.weight}kg</CardDescription>
                    </div>
                    <Badge className={getStatusColor(pickup.status)}>
                      {pickup.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="size-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                      <span>{pickup.address}</span>
                    </div>
                    {pickup.pickup_date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="size-4" />
                        <span>{new Date(pickup.pickup_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {pickup.notes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Note: {pickup.notes}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
