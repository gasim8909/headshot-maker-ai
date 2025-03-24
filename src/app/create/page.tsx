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
  tier: 'guest' | 'free' | 'premium' | 'professional';
  used_generations: number;
}

export default function CreateHeadshot() {
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState('corporate');
  const [customStylePrompt, setCustomStylePrompt] = useState('');
  const [generationQuantity, setGenerationQuantity] = useState(4);
  const [advancedSettings, setAdvancedSettings] = useState({
    lighting: 0,
    background: null, // Default to AI-suggested background
    sharpness: 'medium',
    expression: 'natural',
    headPosition: 'centered',
    eyeFocus: 'direct'
  });
  const [generatedImages, setGeneratedImages] = useState([]);
  const [generationPrompt, setGenerationPrompt] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Enable Guest Mode instead of redirecting to login
        setUser(null);
        setSubscription({ tier: 'guest', used_generations: 0 });
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
    // Check if this is a custom style prompt or a standard style ID
    if (style === 'custom' || (selectedStyle === 'custom' && style.length > 0)) {
      // If it's a custom style, set the style to 'custom' and store the prompt separately
      setSelectedStyle('custom');
      setCustomStylePrompt(style === 'custom' ? '' : style);
    } else {
      // Otherwise it's a standard style ID
      setSelectedStyle(style);
      setCustomStylePrompt('');
    }
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
      // Prepare the request data
      const requestData = {
        imageData: uploadedImage,
        settings: {
          style: selectedStyle,
          quantity: generationQuantity,
          ...advancedSettings,
          // Include customStylePrompt in the initial object to fix TypeScript error
          customStylePrompt: selectedStyle === 'custom' ? customStylePrompt.trim() : undefined
        }
      };
      
      // Remove customStylePrompt if it's empty or not in custom style mode
      if (selectedStyle !== 'custom' || !customStylePrompt.trim().length) {
        delete requestData.settings.customStylePrompt;
      }

      console.log("Generating with settings:", JSON.stringify(requestData.settings, null, 2));

      // Call the API to generate the headshot
      const response = await postData('/api/generate', requestData);
      
      if (response.success) {
        setGeneratedImages(response.results.images);
        
        // Store the prompt that was used to generate the images
        if (response.results.prompt) {
          setGenerationPrompt(response.results.prompt);
        }
        
        // Update subscription info with new usage count
        setSubscription({
          ...subscription,
          used_generations: response.usedGenerations
        });
        
        // Scroll to results section
        setTimeout(() => {
          window.scrollTo({ 
            top: document.body.scrollHeight, 
            behavior: 'smooth' 
          });
        }, 300);
      } else {
        throw new Error(response.error || 'Generation failed');
      }
    } catch (err: any) {
      console.error('Error generating headshot:', err);
      
      // Check if it's a 403 error (usually means subscription/access limitation)
      // @ts-ignore - We added status property to Error in apiClient
      if (err.status === 403 || (
          err.message && (
            err.message.includes('plan') || 
            err.message.includes('tier') || 
            err.message.includes('limit') ||
            err.message.includes('upgrade') ||
            err.message.includes('style')
          )
        )) {
        // Enhanced error message for subscription limitations
        
        // @ts-ignore - Extract additional error data if available
        const errorData = err.data || {};
        const tierInfo = errorData.tier ? ` (${getSubscriptionLabel(errorData.tier)} tier)` : '';
        const limitInfo = errorData.usedGenerations && errorData.maxGenerations 
          ? ` - Used ${errorData.usedGenerations}/${errorData.maxGenerations}`
          : '';
          
        // This is likely a subscription feature limitation
        setError(
          <div>
            <div className="font-medium mb-1">Access Limitation{tierInfo}{limitInfo}</div>
            <span>{err.message}</span>
            {subscription.tier !== 'professional' && (
              <div className="mt-2">
                <Link href="/pricing" className="text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center">
                  <span>Upgrade your plan</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            )}
          </div> as any
        );
      } else {
        // More detailed generic error message including model information
        const errorMessage = err.message || 'Failed to generate headshot. Please try again.';
        
        setError(
          <div>
            <div className="font-medium mb-1">Generation Error</div>
            <span>{errorMessage}</span>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              If this problem persists, please ensure your image meets the requirements.
            </div>
          </div> as any
        );
      }
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
    
    const limit = 
      subscription.tier === 'premium' ? parseInt(process.env.NEXT_PUBLIC_PREMIUM_TIER_LIMIT || '30') : 
      subscription.tier === 'free' ? parseInt(process.env.NEXT_PUBLIC_FREE_TIER_LIMIT || '5') : 
      parseInt(process.env.NEXT_PUBLIC_GUEST_TIER_LIMIT || '2'); // Guest tier
    
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
    <div className="ai-container py-12 relative">
      {/* Decorative elements */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary-100/30 dark:bg-primary-900/20 rounded-full filter blur-3xl opacity-70 pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-secondary-100/30 dark:bg-secondary-900/20 rounded-full filter blur-3xl opacity-70 pointer-events-none"></div>
      
      <div className="ai-card-highlight mb-8 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-primary">Create AI Headshot</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Transform your photos into professional headshots using AI.
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            {subscription && (
              <div className="px-4 py-2 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/30 border border-primary-200 dark:border-primary-800/50 rounded-full text-sm shadow-soft-sm flex items-center">
                <span className="font-semibold text-primary-700 dark:text-primary-300">{getRemainingGenerations()}</span> 
                <span className="ml-1 text-gray-700 dark:text-gray-300">credits remaining</span>
              </div>
            )}
          </div>
        </div>
        
        {!user && subscription?.tier === 'guest' && (
          <div className="mt-6 p-4 bg-gradient-to-r from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/30 rounded-lg border border-secondary-200 dark:border-secondary-800/50 shadow-soft-sm">
            <div className="flex items-center gap-3 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-600 dark:text-secondary-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold text-secondary-800 dark:text-secondary-300">Guest Mode</span>
            </div>
            <p className="text-secondary-800 dark:text-secondary-300">
              You have {getRemainingGenerations()} generations remaining in Guest Mode. 
              <Link href="/signup" className="ml-1 text-primary-600 dark:text-primary-400 hover:underline font-medium transition-all">
                Sign up for free
              </Link> to get more generations and save your results!
            </p>
          </div>
        )}
        
        {user && subscription && subscription.tier !== 'professional' && subscription.tier === 'free' && getRemainingGenerations() < 3 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/30 rounded-lg border border-accent-200 dark:border-accent-800/50 shadow-soft-sm">
            <div className="flex items-center gap-3 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-600 dark:text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-accent-800 dark:text-accent-300">Running Low on Credits</span>
            </div>
            <p className="text-accent-800 dark:text-accent-300">
              You have <span className="font-bold">{getRemainingGenerations()}</span> generations remaining on your {getSubscriptionLabel(subscription.tier)} plan.
              <Link href="/pricing" className="ml-1 text-primary-600 dark:text-primary-400 hover:underline font-medium transition-all">
                Upgrade your plan
              </Link> for more generations and premium features.
            </p>
          </div>
        )}
      </div>
      
      <div className="space-y-8">
          {/* Step 1: Upload */}
          <div className="ai-card relative">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-xl pointer-events-none">
              <div className="absolute -top-1 -left-1 w-12 h-12 rounded-full bg-primary-200 dark:bg-primary-800/30 opacity-20"></div>
            </div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-primary text-white font-bold shadow-soft-sm">1</div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upload Your Photo</h2>
              </div>
              <UploadSection onImageUpload={handleImageUpload} />
            </div>
          </div>
          
          {/* Step 2: Customize */}
          <div className="ai-card relative">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-xl pointer-events-none">
              <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full bg-secondary-200 dark:bg-secondary-800/30 opacity-20"></div>
            </div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-secondary text-white font-bold shadow-soft-sm">2</div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Customize Your Headshot</h2>
              </div>
              <StyleSelection 
                onStyleSelect={handleStyleSelect} 
                onQuantitySelect={handleQuantitySelect}
                subscription={subscription || undefined}
              />
              <AdvancedSettings 
                onChange={handleAdvancedSettingsChange} 
                subscription={subscription || undefined}
              />
            </div>
          </div>
          
          {/* Step 3: Generate */}
          <div className="ai-card relative">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-xl pointer-events-none">
              <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-accent-200 dark:bg-accent-800/30 opacity-20"></div>
            </div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-accent text-white font-bold shadow-soft-sm">3</div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Generate Your Headshot</h2>
              </div>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 rounded-lg shadow-soft-sm">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}
              
              <div className="flex gap-4">
                <button
                  onClick={handleGenerate}
                  disabled={!uploadedImage || generating}
                  className={`ai-button-primary flex-1 py-3 ${
                    (!uploadedImage || generating) ? 'opacity-70 hover:shadow-none hover:translate-y-0 cursor-not-allowed' : ''
                  }`}
                >
                  {generating ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                  className="ai-button-secondary"
                >
                  Start Over
                </button>
              </div>
            </div>
          </div>
      </div>
      
      {/* Preview Section - Now positioned at the bottom */}
      <div className="mt-12">
        <PreviewSection 
          originalImage={uploadedImage}
          generatedImages={generatedImages}
          onSaveImage={handleSaveImage}
          onFeedback={handleFeedback}
          subscription={subscription || undefined}
          user={user}
          prompt={generationPrompt || undefined}
        />
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
    case 'guest':
      return 'Guest';
    default:
      return 'Free';
  }
}
