'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import supabase from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      // Send password reset email using Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error sending reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="w-full max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4 dark:bg-gray-800">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Reset Password</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {success ? (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              <p>
                If an account exists with that email, we've sent instructions to reset your password.
                Please check your email.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="you@example.com"
                />
              </div>
              
              <div className="mb-6">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </>
          )}
          
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <Link href="/login" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Back to Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
