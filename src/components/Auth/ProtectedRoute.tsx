'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectPath?: string;
}

/**
 * ProtectedRoute component wraps routes that require authentication
 * 
 * Usage:
 * ```tsx
 * // Within a page component
 * export default function ProtectedPage() {
 *   return (
 *     <ProtectedRoute>
 *       <YourPageContent />
 *     </ProtectedRoute>
 *   );
 * }
 * ```
 */
export default function ProtectedRoute({ 
  children, 
  redirectPath = '/login' 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Check auth state after loading is complete
    if (!isLoading && !user) {
      // Add current path as redirect parameter
      const currentPath = window.location.pathname;
      const redirectUrl = `${redirectPath}?redirect=${encodeURIComponent(currentPath)}`;
      router.push(redirectUrl);
    }
  }, [user, isLoading, router, redirectPath]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="h-12 w-12 rounded-full bg-gradient-primary animate-pulse"></div>
        <span className="ml-3 text-gray-500 dark:text-gray-400">Loading...</span>
      </div>
    );
  }
  
  // If authenticated, render children
  if (user) {
    return <>{children}</>;
  }
  
  // During redirect, show minimal UI
  return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="text-center">
        <div className="h-12 w-12 rounded-full bg-gradient-primary animate-pulse mx-auto"></div>
        <p className="mt-4 text-gray-500 dark:text-gray-400">Redirecting to login...</p>
      </div>
    </div>
  );
}
