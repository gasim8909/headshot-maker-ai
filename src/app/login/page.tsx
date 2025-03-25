'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const { signIn } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Sign in with AuthContext
      const { success, error } = await signIn(email, password);

      if (!success) {
        throw error || new Error('Error signing in');
      }

      // Redirect to the original page or dashboard
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || 'Error signing in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-container-sm py-12">
      <div className="w-full max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="ai-card">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Sign In</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded ai-badge-error">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label className="ai-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              className="ai-input"
              placeholder="you@example.com"
            />
          </div>
          
          <div className="mb-6">
            <label className="ai-label" htmlFor="password">
              Password
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
              <Link href="/forgot-password" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                Forgot your password?
              </Link>
            </p>
          </div>
          
          <div className="mb-6">
            <button
              type="submit"
              disabled={loading}
              className={`w-full ai-button-primary ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
