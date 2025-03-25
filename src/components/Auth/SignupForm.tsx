'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/types/supabase';

export default function SignupForm() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { signUp } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    
    // Validate form
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
      // Sign up with our AuthContext
      const userData: Partial<UserProfile> = {
        full_name: name,
        date_of_birth: dateOfBirth,
        gender
      };
      
      const { success, error } = await signUp(email, password, userData);

      if (!success) {
        throw error || new Error('Failed to create account');
      }

      // Redirect to signup success page
      router.push('/signup-success');
    } catch (err: any) {
      setError(err.message || 'Error creating account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="ai-card">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Create Account</h2>
        
        {error && (
          <div className="mb-4 p-3 ai-badge-error">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label className="ai-label" htmlFor="name">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            required
            className="ai-input"
            placeholder="Your name"
          />
        </div>
        
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
        
        <div className="mb-4">
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
            Must be at least 6 characters
          </p>
        </div>
        
        <div className="mb-4">
          <label className="ai-label" htmlFor="confirm-password">
            Confirm Password
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
        
        <div className="mb-4">
          <label className="ai-label" htmlFor="date-of-birth">
            Date of Birth
          </label>
          <input
            id="date-of-birth"
            type="date"
            value={dateOfBirth}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setDateOfBirth(e.target.value)}
            required
            className="ai-input"
          />
        </div>
        
        <div className="mb-6">
          <label className="ai-label" htmlFor="gender">
            Gender
          </label>
          <select
            id="gender"
            value={gender}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setGender(e.target.value)}
            required
            className="ai-input"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>
        
        <div className="mb-6">
          <button
            type="submit"
            disabled={loading}
            className={`w-full ai-button-primary ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
