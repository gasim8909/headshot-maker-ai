'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupSuccessPage() {
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to login page after 5 seconds
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="ai-container-sm py-12">
      <div className="w-full max-w-md mx-auto">
        <div className="ai-card">
          <div className="text-center mb-6">
            <svg 
              className="mx-auto h-16 w-16 text-accent-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">
            Account Created Successfully!
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
            Your account has been created and is ready to use. Please check your email to verify your account.
          </p>
          
          <div className="bg-primary-50 p-4 rounded-md text-primary-800 dark:bg-primary-900/20 dark:text-primary-300 mb-6">
            <p className="text-center">
              You will be redirected to the login page in {countdown} seconds...
            </p>
          </div>
          
          <div className="text-center">
            <Link 
              href="/login" 
              className="ai-button-primary"
            >
              Continue to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
