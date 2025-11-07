'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UserSchedulePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main schedule page
    router.push('/dashboard/schedule');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecting to schedule...</p>
      </div>
    </div>
  );
}