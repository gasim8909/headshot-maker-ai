'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import supabase from '@/lib/supabase';

export default function Account() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function loadUserData() {
      try {
        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login?redirect=/account');
          return;
        }
        
        setUser(session.user);
        
        // Initialize form data
        setFormData({
          ...formData,
          fullName: session.user.user_metadata?.full_name || '',
          email: session.user.email
        });
        
        // Get subscription details
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        if (subscriptionError && subscriptionError.code !== 'PGRST116') {
          console.error('Error fetching subscription:', subscriptionError);
        } else {
          setSubscription(subscriptionData || { tier: 'free', used_generations: 0 });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUserData();
  }, [router, formData.currentPassword, formData.newPassword, formData.confirmPassword]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setUpdating(true);
    
    try {
      // Update user metadata (name)
      const { error } = await supabase.auth.updateUser({
        data: { full_name: formData.fullName }
      });
      
      if (error) throw error;
      
      setMessage('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    
    // Validate password
    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    setUpdating(true);
    
    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: formData.currentPassword
      });
      
      if (signInError) {
        throw new Error('Current password is incorrect');
      }
      
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });
      
      if (error) throw error;
      
      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setMessage('Password updated successfully');
    } catch (err) {
      console.error('Error updating password:', err);
      setError(err.message || 'Failed to update password');
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 dark:bg-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Account Settings
            </h1>
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              Back to Dashboard
            </Link>
          </div>
          
          {error && (
            <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {message && (
            <div className="mb-6 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {message}
            </div>
          )}
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Subscription Information
            </h2>
            <div className="flex items-center mb-2">
              <span className="font-medium text-gray-700 dark:text-gray-300 w-32">Current Plan:</span>
              <span className="text-gray-900 dark:text-white">
                {subscription?.tier === 'professional' ? 'Professional' : 
                 subscription?.tier === 'premium' ? 'Premium' : 'Free'}
              </span>
            </div>
            <div className="flex items-center mb-4">
              <span className="font-medium text-gray-700 dark:text-gray-300 w-32">Used Generations:</span>
              <span className="text-gray-900 dark:text-white">
                {subscription?.used_generations || 0} / 
                {subscription?.tier === 'professional' ? 'Unlimited' : 
                 subscription?.tier === 'premium' ? '30' : '5'}
              </span>
            </div>
            <Link href="/pricing" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              Manage Subscription
            </Link>
          </div>
          
          {/* Profile Form */}
          <form onSubmit={handleProfileUpdate} className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Profile Information
            </h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="fullName">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                disabled
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-500 leading-tight bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
              />
              <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                Email cannot be changed
              </p>
            </div>
            
            <button
              type="submit"
              disabled={updating}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                updating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {updating ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
          
          {/* Password Form */}
          <form onSubmit={handlePasswordUpdate}>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Change Password
            </h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="currentPassword">
                Current Password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleInputChange}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="newPassword">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleInputChange}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                Must be at least 6 characters
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <button
              type="submit"
              disabled={updating}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                updating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {updating ? 'Updating...' : 'Change Password'}
            </button>
          </form>
          
          <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Account Actions
            </h2>
            <div className="flex gap-4">
              <button
                onClick={handleSignOut}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Sign Out
              </button>
              
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    // Add account deletion logic
                    alert('Account deletion functionality will be implemented in a future update.');
                  }
                }}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}