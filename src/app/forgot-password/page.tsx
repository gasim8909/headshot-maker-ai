'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      // Send password reset email using AuthContext
      const { success, error } = await forgotPassword(email);

      if (!success) {
        throw error || new Error('Error sending reset email');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error sending reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-container-sm py-12">
      <div className="w-full max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="ai-card">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Reset Password</h2>
          
          {error && (
            <div className="mb-4 p-3 ai-badge-error">
              {error}
            </div>
          )}
          
          {success ? (
            <div className="mb-6 p-4 ai-badge-success">
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
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full ai-button-primary ${
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
              <Link href="/login" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                Back to Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
