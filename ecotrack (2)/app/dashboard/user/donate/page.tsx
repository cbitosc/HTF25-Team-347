'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UserDonatePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main donations page
    router.push('/dashboard/donations');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecting to donations...</p>
      </div>
    </div>
  );
}