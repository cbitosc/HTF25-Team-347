'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UserTrackPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main requests tracking page
    router.push('/dashboard/requests');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecting to track pickups...</p>
      </div>
    </div>
  );
}