'use client';

import React, { useState, useEffect } from 'react';
import { testGetSubscription, testUpdateSubscription } from '@/utils/supabaseDebugger';
import { UserSubscription } from '@/types/supabase';

const SubscriptionDebugger = () => {
  // Subscription state
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [subscriptionLoaded, setSubscriptionLoaded] = useState(false);
  
  // Form states
  const [tier, setTier] = useState<'guest' | 'free' | 'premium' | 'professional'>('free');
  const [creditsRemaining, setCreditsRemaining] = useState<number>(0);
  
  // Results and status
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load subscription on mount
  useEffect(() => {
    loadSubscription();
  }, []);
  
  const loadSubscription = async () => {
    setIsLoading(true);
    const result = await testGetSubscription();
    
    setResults(prev => [{ type: 'getSubscription', data: result }, ...prev]);
    
    if (result.success && result.data.subscription) {
      const subData = result.data.subscription;
      setSubscription(subData);
      setTier(subData.tier);
      setCreditsRemaining(subData.credits_remaining);
      setSubscriptionLoaded(true);
    }
    
    setIsLoading(false);
  };
  
  const handleUpdateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriptionLoaded) return;
    
    setIsLoading(true);
    
    const updatedSubData: Partial<UserSubscription> = {
      tier,
      credits_remaining: creditsRemaining
    };
    
    const result = await testUpdateSubscription(updatedSubData);
    setResults(prev => [{ type: 'updateSubscription', data: result }, ...prev]);
    
    if (result.success && result.data.updatedSubscription) {
      setSubscription(result.data.updatedSubscription);
    }
    
    setIsLoading(false);
  };
  
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
      <h2 className="text-xl font-bold mb-4">Subscription Testing</h2>
      
      {/* Current subscription */}
      <div className="mb-6 p-3 bg-gray-100 dark:bg-gray-700 rounded">
        <h3 className="text-lg font-semibold mb-2">Current Subscription</h3>
        {subscription ? (
          <div>
            <p><span className="font-medium">ID:</span> {subscription.id}</p>
            <p><span className="font-medium">User ID:</span> {subscription.user_id}</p>
            <p>
              <span className="font-medium">Tier:</span> 
              <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                subscription.tier === 'premium' ? 'bg-yellow-100 text-yellow-800' : 
                subscription.tier === 'professional' ? 'bg-purple-100 text-purple-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {subscription.tier.toUpperCase()}
              </span>
            </p>
            <p>
              <span className="font-medium">Credits:</span> 
              <span className={`ml-2 ${subscription.credits_remaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {subscription.credits_remaining}
              </span>
            </p>
            <p><span className="font-medium">Used Generations:</span> {subscription.used_generations}</p>
            <p><span className="font-medium">Created:</span> {new Date(subscription.created_at).toLocaleString()}</p>
            <p><span className="font-medium">Updated:</span> {new Date(subscription.updated_at).toLocaleString()}</p>
          </div>
        ) : (
          <p className="text-gray-500">
            {isLoading ? 'Loading subscription...' : 'No subscription loaded or user not logged in'}
          </p>
        )}
        <div className="mt-3">
          <button 
            onClick={loadSubscription} 
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            disabled={isLoading}
          >
            Refresh Subscription
          </button>
        </div>
      </div>
      
      {/* Update subscription form */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Update Subscription</h3>
        {!subscriptionLoaded ? (
          <p className="text-gray-500">Please load a subscription first or sign in</p>
        ) : (
          <form onSubmit={handleUpdateSubscription} className="space-y-3">
            <div>
              <label className="block text-sm font-medium">Tier</label>
              <select 
                value={tier} 
                onChange={(e) => setTier(e.target.value as any)} 
                className="w-full p-2 border rounded"
              >
                <option value="guest">Guest</option>
                <option value="free">Free</option>
                <option value="premium">Premium</option>
                <option value="professional">Professional</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Credits Remaining</label>
              <input 
                type="number" 
                min="0"
                value={creditsRemaining} 
                onChange={(e) => setCreditsRemaining(parseInt(e.target.value) || 0)} 
                className="w-full p-2 border rounded"
              />
            </div>
            <button 
              type="submit" 
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Subscription'}
            </button>
          </form>
        )}
      </div>
      
      {/* Results */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Test Results</h3>
        <div className="max-h-60 overflow-auto border rounded">
          {results.length === 0 ? (
            <p className="p-3 text-gray-500">No test results yet</p>
          ) : (
            <div className="divide-y">
              {results.map((result, i) => (
                <div key={i} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{result.type} - {result.data.action}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${result.data.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {result.data.success ? 'SUCCESS' : 'ERROR'}
                    </span>
                  </div>
                  <div className="mt-1 text-xs">
                    {result.data.error ? (
                      <p className="text-red-500">{result.data.error}</p>
                    ) : (
                      <p className="text-gray-500">{result.data.data.duration}</p>
                    )}
                  </div>
                  <div className="mt-1">
                    <details className="text-xs">
                      <summary className="cursor-pointer text-blue-500">View Details</summary>
                      <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-900 rounded overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDebugger;
