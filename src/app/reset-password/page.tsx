'use client';

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import supabase from '@/lib/supabase';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [hasSession, setHasSession] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user came from a valid password reset flow
    async function checkAuthSession() {
      const { data } = await supabase.auth.getSession();
      
      // User needs to have a session from the password reset email
      if (data.session) {
        setHasSession(true);
      }
    }
    
    checkAuthSession();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    
    // Validate passwords
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);

    try {
      // Update password with Supabase
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Error updating password');
    } finally {
      setLoading(false);
    }
  };

  if (!hasSession && !success) {
    return (
      <div className="ai-container-sm py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="ai-card">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Invalid Reset Link</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
              This password reset link is invalid or has expired.
            </p>
            <div className="text-center mt-6">
              <Link 
                href="/forgot-password" 
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Request a new password reset link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-container-sm py-12">
      <div className="w-full max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="ai-card">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Reset Your Password</h2>
          
          {error && (
            <div className="mb-4 p-3 ai-badge-error">
              {error}
            </div>
          )}
          
          {success ? (
            <div className="mb-6 p-4 ai-badge-success">
              <p>
                Your password has been successfully reset! You will be redirected to the login page in a few seconds.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="ai-label" htmlFor="password">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  required
                  className="ai-input"
                  placeholder="••••••••"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Must be at least 6 characters
                </p>
              </div>
              
              <div className="mb-6">
                <label className="ai-label" htmlFor="confirm-password">
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  required
                  className="ai-input"
                  placeholder="••••••••"
                />
              </div>
              
              <div className="mb-6">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full ai-button-primary ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Updating...' : 'Reset Password'}
                </button>
              </div>
            </>
          )}
          
          {!success && (
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <Link href="/login" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                  Back to Sign In
                </Link>
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
