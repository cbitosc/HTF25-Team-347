'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getUsersByRole, addDonation } from '@/lib/supabase/operations';
import { useAuth } from '@/lib/auth/AuthContext';
import { Gift, Heart, Users } from 'lucide-react';

export default function DonatePage() {
  const router = useRouter();
  const { userId, userName } = useAuth();
  const [formData, setFormData] = useState({
    itemType: '',
    description: '',
    ngo: '',
    quantity: '',
    condition: '',
    address: '',
  });
  const [ngos, setNgos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNGOs = async () => {
      try {
        const data = await getUsersByRole('ngo');
        setNgos(data || []);
      } catch (error) {
        console.error('Failed to fetch NGOs:', error);
        toast.error('Failed to load NGOs');
      } finally {
        setLoading(false);
      }
    };
    fetchNGOs();
  }, []);

  const itemTypes = [
    'Electronics',
    'Furniture',
    'Appliances',
    'Books',
    'Clothing',
    'Metal Items',
    'Other',
  ];

  const conditions = ['Excellent', 'Good', 'Fair', 'For Parts'];

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || !userName) {
      toast.error('Please login to submit a donation');
      router.push('/auth');
      return;
    }

    if (!formData.address) {
      toast.error('Please enter your address');
      return;
    }

    if (!formData.ngo) {
      toast.error('Please select an NGO');
      return;
    }

    try {
      // Generate unique ID for donation
      const donationId = crypto.randomUUID();
      
      const donationData = {
        id: donationId,
        donor_id: userId,
        donor_name: userName,
        ngo_id: formData.ngo,
        item: `${formData.itemType} - ${formData.description}`,
        quantity: parseFloat(formData.quantity) || 1,
        address: formData.address,
        lat: 0,
        lng: 0,
        status: 'Pending',
        date: new Date().toISOString(),
      };

      console.log('=== DONATION SUBMISSION START ===');
      console.log('User ID:', userId);
      console.log('User Name:', userName);
      console.log('Form Data:', formData);
      console.log('Donation Data:', donationData);
      
      const result = await addDonation(donationData as any);
      console.log('Donation created successfully:', result);
      console.log('=== DONATION SUBMISSION END ===');
      
      toast.success('Donation request submitted! The NGO will contact you soon.');
      
      // Reset form
      setFormData({
        itemType: '',
        description: '',
        ngo: '',
        quantity: '',
        condition: '',
        address: '',
      });
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (error: any) {
      console.error('=== DONATION ERROR ===');
      console.error('Error object:', error);
      console.error('Error message:', error?.message);
      console.error('Error code:', error?.code);
      console.error('Error details:', error?.details);
      console.error('Full error:', JSON.stringify(error, null, 2));
      
      const errorMsg = error?.message || error?.details || 'Failed to submit donation. Please check console for details.';
      toast.error(errorMsg);
    }
  };

  return (
    <DashboardLayout role="user">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1>Donate Reusable Items</h1>
          <p className="text-muted-foreground">
            Give your items a second life by donating to NGOs and recycling partners
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Donation Details</CardTitle>
                <CardDescription>Describe the items you'd like to donate</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="itemType">Item Type</Label>
                    <Select value={formData.itemType} onValueChange={(value) => handleChange('itemType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item type" />
                      </SelectTrigger>
                      <SelectContent>
                        {itemTypes.map(type => (
                          <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Pickup Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter your address for pickup..."
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      required
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the items you're donating..."
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        placeholder="e.g., 1"
                        value={formData.quantity}
                        onChange={(e) => handleChange('quantity', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="condition">Condition</Label>
                      <Select value={formData.condition} onValueChange={(value) => handleChange('condition', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          {conditions.map(condition => (
                            <SelectItem key={condition} value={condition.toLowerCase()}>{condition}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ngo">Select NGO / Recycling Partner</Label>
                    <Select value={formData.ngo} onValueChange={(value) => handleChange('ngo', value)} disabled={loading}>
                      <SelectTrigger>
                        <SelectValue placeholder={loading ? "Loading NGOs..." : "Choose an organization"} />
                      </SelectTrigger>
                      <SelectContent>
                        {ngos.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">No NGOs available</div>
                        ) : (
                          ngos.map(ngo => (
                            <SelectItem key={ngo.id} value={ngo.id}>
                              {ngo.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1">
                      <Gift className="size-4 mr-2" />
                      Submit Donation
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.push('/dashboard/user')}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-5" />
                  Partner NGOs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading NGOs...</p>
                ) : ngos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No NGOs available</p>
                ) : (
                  ngos.map((ngo) => (
                    <div key={ngo.id} className="p-3 border rounded-lg">
                      <div className="mb-2">
                        <span className="block font-medium">{ngo.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{ngo.address}</p>
                      {ngo.accepted_waste_types && ngo.accepted_waste_types.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {ngo.accepted_waste_types.slice(0, 3).map((type: string) => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
              <CardContent className="pt-6">
                <Heart className="size-8 text-green-600 mb-3" />
                <h3 className="mb-2">Make an Impact</h3>
                <p className="text-sm text-muted-foreground">
                  Your donations help reduce waste and support communities. Thank you for contributing to a sustainable future!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
