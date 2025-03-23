'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import supabase from '@/lib/supabase';
import UploadSection from '@/components/UploadSection';
import StyleSelection from '@/components/StyleSelection';
import AdvancedSettings from '@/components/AdvancedSettings';
import PreviewSection from '@/components/PreviewSection';
import { postData } from '@/utils/apiClient';

interface Subscription {
  tier: 'free' | 'premium' | 'professional';
  used_generations: number;
}

export default function CreateHeadshot() {
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState('corporate');
  const [generationQuantity, setGenerationQuantity] = useState(4);
  const [advancedSettings, setAdvancedSettings] = useState({
    lighting: 0,
    background: 'white',
    sharpness: 'medium',
    expression: 'natural',
    headPosition: 'centered',
    eyeFocus: 'direct'
  });
  const [generatedImages, setGeneratedImages] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login?redirect=/create');
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
    }
    
    checkAuth();
  }, [router]);

  const handleImageUpload = (imageData: string) => {
    setUploadedImage(imageData);
    setGeneratedImages([]);
  };

  const handleStyleSelect = (style: string) => {
    setSelectedStyle(style);
  };

  const handleQuantitySelect = (quantity: number) => {
    setGenerationQuantity(quantity);
  };

  const handleAdvancedSettingsChange = (settings: any) => {
    setAdvancedSettings(settings);
  };

  const handleGenerate = async () => {
    if (!uploadedImage) {
      setError('Please upload an image first' as any);
      return;
    }
    
    if (!subscription) {
      setError('Unable to determine your subscription status' as any);
      return;
    }
    
    const remainingGenerations = getRemainingGenerations();
    if (remainingGenerations < generationQuantity && subscription.tier !== 'professional') {
      setError(`You only have ${remainingGenerations} generations remaining on your plan. Please reduce the quantity or upgrade your plan.` as any);
      return;
    }
    
    setError(null);
    setGenerating(true);
    
    try {
      // Call the API to generate the headshot
      const response = await postData('/api/generate', {
        imageData: uploadedImage,
        settings: {
          style: selectedStyle,
          quantity: generationQuantity,
          ...advancedSettings
        }
      });
      
      if (response.success) {
        setGeneratedImages(response.results.images);
        
        // Update subscription info with new usage count
        setSubscription({
          ...subscription,
          used_generations: response.usedGenerations
        });
      } else {
        throw new Error(response.error || 'Generation failed');
      }
    } catch (err: any) {
      console.error('Error generating headshot:', err);
      setError(err.message || 'Failed to generate headshot. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setGeneratedImages([]);
    setError(null);
  };

  const getRemainingGenerations = () => {
    if (!subscription) return 0;
    
    if (subscription.tier === 'professional') return Infinity;
    
    const limit = subscription.tier === 'premium' ? 30 : 5;
    return Math.max(0, limit - subscription.used_generations);
  };

  const handleSaveImage = (imageData: any, index: number) => {
    // This is handled by the PreviewSection component
    console.log('Image saved:', index);
  };

  const handleFeedback = async (index: number, isPositive: boolean) => {
    try {
      // Submit feedback to the API
      await postData('/api/feedback', {
        imageIndex: index,
        isPositive,
        settings: {
          style: selectedStyle,
          ...advancedSettings
        }
      });
      
      console.log('Feedback submitted:', isPositive ? 'positive' : 'negative');
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Create AI Headshot
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Transform your photos into professional headshots using AI.
        </p>
        
        {subscription && subscription.tier !== 'professional' && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
            <p className="text-sm">
              You have {getRemainingGenerations()} generations remaining on your {getSubscriptionLabel(subscription.tier)} plan.
              {subscription.tier === 'free' && getRemainingGenerations() < 3 && (
                <span> Consider <Link href="/pricing" className="underline font-medium">upgrading your plan</Link> for more generations.</span>
              )}
            </p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Step 1: Upload */}
          <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Step 1: Upload Your Photo</h2>
            </div>
            <UploadSection onImageUpload={handleImageUpload} />
          </div>
          
          {/* Step 2: Customize */}
          <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Step 2: Customize Your Headshot</h2>
            </div>
            <StyleSelection 
              onStyleSelect={handleStyleSelect} 
              onQuantitySelect={handleQuantitySelect} 
            />
            <AdvancedSettings onChange={handleAdvancedSettingsChange} />
          </div>
          
          {/* Step 3: Generate */}
          <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Step 3: Generate Your Headshot</h2>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <div className="flex gap-4">
              <button
                onClick={handleGenerate}
                disabled={!uploadedImage || generating}
                className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  (!uploadedImage || generating) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {generating ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  'Generate Headshots'
                )}
              </button>
              
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
        
        {/* Preview Section */}
        <div>
          <PreviewSection 
            originalImage={uploadedImage}
            generatedImages={generatedImages}
            onSaveImage={handleSaveImage}
            onFeedback={handleFeedback}
          />
        </div>
      </div>
    </div>
  );
}

function getSubscriptionLabel(tier: string) {
  switch (tier) {
    case 'professional':
      return 'Professional';
    case 'premium':
      return 'Premium';
    default:
      return 'Free';
  }
}
