'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/AuthContext';
import { getPickups } from '@/lib/supabase/operations';
import { toast } from 'sonner';
import { Route, MapPin, Navigation } from 'lucide-react';

export default function RouteOptimizationPage() {
  const { userId } = useAuth();
  const [pickups, setPickups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    fetchPendingPickups();
  }, []);

  const fetchPendingPickups = async () => {
    try {
      const data = await getPickups();
      // Filter for pending or scheduled pickups
      const filtered = data.filter((p: any) => 
        p.status === 'pending' || p.status === 'scheduled'
      );
      setPickups(filtered || []);
    } catch (error) {
      console.error('Failed to fetch pickups:', error);
      toast.error('Failed to load pickups');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeRoute = () => {
    setOptimizing(true);
    // Simulate route optimization
    setTimeout(() => {
      toast.success('Route optimized! Check your map for the best path.');
      setOptimizing(false);
    }, 2000);
  };

  return (
    <DashboardLayout role="collector">
      <div className="space-y-6">
        <div>
          <h1>Route Optimization</h1>
          <p className="text-muted-foreground">
            Find the most efficient route for today's pickups
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Pickups</CardTitle>
            <CardDescription>
              {pickups.length} pickups ready for collection
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading pickups...</p>
            ) : pickups.length === 0 ? (
              <div className="text-center py-8">
                <Navigation className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No pickups available for routing</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  {pickups.map((pickup, index) => (
                    <div key={pickup.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{pickup.waste_type} - {pickup.weight}kg</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="size-3" />
                          <span className="truncate">{pickup.address}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium">Estimated Distance</p>
                      <p className="text-2xl font-bold text-primary">
                        {(pickups.length * 3.5).toFixed(1)} km
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Estimated Time</p>
                      <p className="text-2xl font-bold text-primary">
                        {Math.ceil(pickups.length * 15)} min
                      </p>
                    </div>
                  </div>

                  <Button 
                    onClick={handleOptimizeRoute}
                    disabled={optimizing}
                    className="w-full"
                  >
                    <Route className="w-4 h-4 mr-2" />
                    {optimizing ? 'Optimizing...' : 'Optimize Route'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Route Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Start with pickups closest to your current location</li>
              <li>• Group pickups in the same area together</li>
              <li>• Consider traffic conditions during peak hours</li>
              <li>• Update pickup status as you complete each collection</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
