'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import supabase from '@/lib/supabase';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [savedImages, setSavedImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUserData() {
      try {
        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }
        
        setUser(session.user);
        
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
        
        // Get saved images
        const { data: imagesData, error: imagesError } = await supabase
          .from('image_history')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
        
        if (imagesError) {
          console.error('Error fetching images:', imagesError);
        } else {
          setSavedImages(imagesData || []);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUserData();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getSubscriptionLabel = (tier) => {
    switch (tier) {
      case 'professional':
        return 'Professional';
      case 'premium':
        return 'Premium';
      default:
        return 'Free';
    }
  };

  const getGenerationLimit = (tier) => {
    switch (tier) {
      case 'professional':
        return 'Unlimited';
      case 'premium':
        return '30';
      default:
        return '5';
    }
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
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 dark:bg-gray-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your generated headshots and subscription.
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Link href="/create" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              Create New Headshot
            </Link>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Subscription Card */}
        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Your Subscription</h2>
          
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium dark:bg-blue-900 dark:text-blue-200">
              {getSubscriptionLabel(subscription?.tier)} Plan
            </span>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Monthly Generations: <span className="font-medium text-gray-900 dark:text-white">{getGenerationLimit(subscription?.tier)}</span>
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Used This Month: <span className="font-medium text-gray-900 dark:text-white">{subscription?.used_generations || 0}</span>
            </p>
            
            {subscription?.tier === 'free' && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 dark:bg-gray-700">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.min(100, ((subscription?.used_generations || 0) / 5) * 100)}%` }}></div>
              </div>
            )}
            
            {subscription?.tier === 'premium' && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 dark:bg-gray-700">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.min(100, ((subscription?.used_generations || 0) / 30) * 100)}%` }}></div>
              </div>
            )}
          </div>
          
          <Link href="/pricing" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            {subscription?.tier === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
          </Link>
        </div>
        
        {/* Account Card */}
        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Account</h2>
          
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Email: <span className="font-medium text-gray-900 dark:text-white">{user?.email}</span>
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Member Since: <span className="font-medium text-gray-900 dark:text-white">
                {new Date(user?.created_at).toLocaleDateString()}
              </span>
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Link href="/account" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              Manage Account
            </Link>
            <button 
              onClick={handleSignOut}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              Sign Out
            </button>
          </div>
        </div>
        
        {/* Usage Stats Card */}
        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Usage Stats</h2>
          
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Total Headshots: <span className="font-medium text-gray-900 dark:text-white">{savedImages.length}</span>
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Recent Activity: <span className="font-medium text-gray-900 dark:text-white">
                {savedImages.length > 0 ? new Date(savedImages[0].created_at).toLocaleDateString() : 'None'}
              </span>
            </p>
          </div>
        </div>
      </div>
      
      {/* Saved Headshots Gallery */}
      <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Your Headshots</h2>
        
        {savedImages.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't created any headshots yet.</p>
            <Link href="/create" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              Create Your First Headshot
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {savedImages.map((image) => (
              <div key={image.id} className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
                <div className="aspect-w-1 aspect-h-1 w-full">
                  <Image
                    src={image.image_url}
                    alt="Saved headshot"
                    width={200}
                    height={200}
                    layout="responsive"
                    className="object-cover"
                  />
                </div>
                <div className="p-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(image.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}