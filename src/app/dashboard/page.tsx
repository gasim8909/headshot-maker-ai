'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the account page which now has all the dashboard functionality
    router.replace('/account');
  }, [router]);

  return (
    <ProtectedRoute>
      <div className="ai-container py-12">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 animate-pulse mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Redirecting to account page...</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
