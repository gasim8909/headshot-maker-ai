'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { postData } from '@/utils/apiClient';

const PRICE_DATA = {
  premium: {
    monthly: 9.99,
    yearly: 99.99,
  },
  professional: {
    monthly: 19.99,
    yearly: 199.99,
  }
};

export default function Pricing() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const router = useRouter();

  useEffect(() => {
    async function loadUserData() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
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
      }
      
      setLoading(false);
    }
    
    loadUserData();
  }, []);

  const handleSelectPlan = async (tier) => {
    if (!user) {
      router.push('/signup?redirect=/pricing');
      return;
    }
    
    if (tier === 'free') {
      // If downgrading to free, no payment needed
      try {
        // Cancel existing subscription if any
        if (subscription && subscription.stripe_subscription_id) {
          await postData('/api/cancel-subscription', {
            subscriptionId: subscription.stripe_subscription_id
          });
        }
        
        // Update to free tier
        const { error } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: user.id,
            tier: 'free',
            used_generations: subscription?.used_generations || 0
          });
        
        if (error) throw error;
        
        router.push('/dashboard');
      } catch (error) {
        console.error('Error downgrading to free tier:', error);
        alert('Failed to update subscription. Please try again.');
      }
      return;
    }
    
    // For premium or professional, redirect to payment
    try {
      const response = await postData('/api/create-checkout-session', {
        tier,
        billingCycle,
        userId: user.id
      });
      
      // Redirect to Stripe Checkout
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to create checkout session. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Choose the plan that's right for you. All plans include access to our AI headshot generation.
        </p>
        
        <div className="flex justify-center mt-8">
          <div className="inline-flex p-1 bg-gray-100 rounded-lg dark:bg-gray-800">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md ${
                billingCycle === 'monthly' 
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-md ${
                billingCycle === 'yearly' 
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Yearly (Save 16%)
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Free Tier */}
        <div className={`bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-800 ${
          subscription?.tier === 'free' ? 'ring-2 ring-blue-500' : ''
        }`}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Free</h2>
            <p className="mt-1 text-gray-600 dark:text-gray-400">Try it out</p>
            
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white">$0</span>
              <span className="ml-1 text-xl font-semibold text-gray-500 dark:text-gray-400">/mo</span>
            </div>
            
            <p className="mt-6 text-gray-600 dark:text-gray-400">
              5 generations per month
            </p>
          </div>
          
          <div className="px-6 pt-6">
            <ul className="space-y-4">
              <li className="flex">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-3 text-gray-700 dark:text-gray-300">Basic headshot styles</span>
              </li>
              <li className="flex">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-3 text-gray-700 dark:text-gray-300">Save generated images</span>
              </li>
              <li className="flex">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-3 text-gray-700 dark:text-gray-300">Basic customization</span>
              </li>
            </ul>
          </div>
          
          <div className="p-6 mt-6">
            <button
              onClick={() => handleSelectPlan('free')}
              className={`w-full py-3 px-4 rounded-md ${
                subscription?.tier === 'free'
                  ? 'bg-gray-200 text-gray-800 cursor-default dark:bg-gray-700 dark:text-gray-200'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              disabled={subscription?.tier === 'free'}
            >
              {subscription?.tier === 'free' ? 'Current Plan' : 'Downgrade to Free'}
            </button>
          </div>
        </div>
        
        {/* Premium Tier */}
        <div className={`bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-800 ${
          subscription?.tier === 'premium' ? 'ring-2 ring-blue-500' : ''
        }`}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Premium</h2>
            <p className="mt-1 text-gray-600 dark:text-gray-400">Most popular</p>
            
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                ${billingCycle === 'monthly' ? PRICE_DATA.premium.monthly : (PRICE_DATA.premium.yearly / 12).toFixed(2)}
              </span>
              <span className="ml-1 text-xl font-semibold text-gray-500 dark:text-gray-400">/mo</span>
            </div>
            
            <p className="mt-6 text-gray-600 dark:text-gray-400">
              30 generations per month
            </p>
          </div>
          
          <div className="px-6 pt-6">
            <ul className="space-y-4">
              <li className="flex">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-3 text-gray-700 dark:text-gray-300">All styles included</span>
              </li>
              <li className="flex">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-3 text-gray-700 dark:text-gray-300">Advanced customization</span>
              </li>
              <li className="flex">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-3 text-gray-700 dark:text-gray-300">Priority processing</span>
              </li>
              <li className="flex">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-3 text-gray-700 dark:text-gray-300">Email support</span>
              </li>
            </ul>
          </div>
          
          <div className="p-6 mt-6">
            <button
              onClick={() => handleSelectPlan('premium')}
              className={`w-full py-3 px-4 rounded-md ${
                subscription?.tier === 'premium'
                  ? 'bg-gray-200 text-gray-800 cursor-default dark:bg-gray-700 dark:text-gray-200'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              disabled={subscription?.tier === 'premium'}
            >
              {subscription?.tier === 'premium' 
                ? 'Current Plan' 
                : subscription?.tier === 'professional'
                  ? 'Downgrade to Premium'
                  : 'Upgrade to Premium'
              }
            </button>
          </div>
        </div>
        
        {/* Professional Tier */}
        <div className={`bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-800 ${
          subscription?.tier === 'professional' ? 'ring-2 ring-blue-500' : ''
        }`}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Professional</h2>
            <p className="mt-1 text-gray-600 dark:text-gray-400">Power users</p>
            
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                ${billingCycle === 'monthly' ? PRICE_DATA.professional.monthly : (PRICE_DATA.professional.yearly / 12).toFixed(2)}
              </span>
              <span className="ml-1 text-xl font-semibold text-gray-500 dark:text-gray-400">/mo</span>
            </div>
            
            <p className="mt-6 text-gray-600 dark:text-gray-400">
              Unlimited generations
            </p>
          </div>
          
          <div className="px-6 pt-6">
            <ul className="space-y-4">
              <li className="flex">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-3 text-gray-700 dark:text-gray-300">Everything in Premium</span>
              </li>
              <li className="flex">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-3 text-gray-700 dark:text-gray-300">Unlimited generations</span>
              </li>
              <li className="flex">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-3 text-gray-700 dark:text-gray-300">Custom style prompts</span>
              </li>
              <li className="flex">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-3 text-gray-700 dark:text-gray-300">Priority customer support</span>
              </li>
            </ul>
          </div>
          
          <div className="p-6 mt-6">
            <button
              onClick={() => handleSelectPlan('professional')}
              className={`w-full py-3 px-4 rounded-md ${
                subscription?.tier === 'professional'
                  ? 'bg-gray-200 text-gray-800 cursor-default dark:bg-gray-700 dark:text-gray-200'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              disabled={subscription?.tier === 'professional'}
            >
              {subscription?.tier === 'professional' ? 'Current Plan' : 'Upgrade to Professional'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          All plans come with a 7-day satisfaction guarantee. Questions?
        </p>
        <Link href="/contact" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
          Contact our support team
        </Link>
      </div>
    </div>
  );
}