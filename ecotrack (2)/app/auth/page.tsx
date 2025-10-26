'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'sonner';
import { Recycle } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, userId, userRole, loading: authLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && userId && userRole) {
      const role = userRole.toLowerCase();
      if (role === 'citizen') {
        router.push('/dashboard');
      } else {
        router.push(`/${role}`);
      }
    }
  }, [userId, userRole, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success('Welcome back!');
      
      // Wait a bit for auth state to update, then redirect will happen via useEffect
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid credentials. Please check your email and password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Recycle className="size-8 text-green-600" />
            </div>
          </div>
          <CardTitle>EcoTrack</CardTitle>
          <CardDescription>Sign in to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6">
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/signup" className="text-emerald-600 hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>
            
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-xs font-medium mb-2">Demo Accounts:</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>• <strong>Citizen:</strong> nikhil@demo.com / demo123</p>
                <p>• <strong>Collector:</strong> manideep@demo.com / demo123</p>
                <p>• <strong>NGO:</strong> badrinath@demo.com / demo123</p>
                <p>• <strong>Admin:</strong> srishant@demo.com / demo123</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
