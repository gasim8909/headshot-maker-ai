'use client';

import { useState, useRef, useEffect } from 'react';
import { SubscriptionTier, getFeatureAccess } from '@/utils/featureAccess';
import Link from 'next/link';
import Image from 'next/image';

interface StyleSelectionProps {
  onStyleSelect: (style: string) => void;
  onQuantitySelect: (quantity: number) => void;
  subscription?: { tier: SubscriptionTier; used_generations: number };
}

// Style options as defined in the project spec
const STYLE_OPTIONS = [
  { id: 'corporate', name: 'Corporate', description: 'Traditional professional look', imageSrc: '/images/styles/corporate.png' },
  { id: 'creative', name: 'Creative', description: 'Modern, stylish appearance', imageSrc: '/images/styles/creative.png' },
  { id: 'casual', name: 'Casual', description: 'Natural, friendly vibe', imageSrc: '/images/styles/casual.png' },
  { id: 'executive', name: 'Executive', description: 'Leadership presence', imageSrc: '/images/styles/executive.png' },
  { id: 'artistic', name: 'Artistic', description: 'Creative professional, artsy', imageSrc: '/images/styles/artistic.png' },
  { id: 'tech', name: 'Tech', description: 'Digital expert look', imageSrc: '/images/styles/tech.png' },
  { id: 'academic', name: 'Academic', description: 'Scholarly tone', imageSrc: '/images/styles/academic.png' },
  { id: 'startup', name: 'Startup', description: 'Entrepreneurial, relaxed', imageSrc: '/images/styles/startup.png' },
  { id: 'business', name: 'Business', description: 'Polished business look', imageSrc: '/images/styles/business.png' },
  { id: 'retro', name: 'Retro', description: 'Vintage, old-school portrait', imageSrc: '/images/styles/retro.png' },
  { id: 'cinematic', name: 'Cinematic', description: 'Movie poster style lighting', imageSrc: '/images/styles/cinematic.png' },
  { id: 'custom', name: 'Custom', description: 'Your own custom style', imageSrc: '/images/styles/custom.png' }
];

// Quantity options
const QUANTITY_OPTIONS = [2, 3, 4, 5, 6, 8, 10];

export default function StyleSelection({ onStyleSelect, onQuantitySelect, subscription }: StyleSelectionProps) {
  const [selectedStyle, setSelectedStyle] = useState('corporate');
  const [quantity, setQuantity] = useState(4);
  const [customPrompt, setCustomPrompt] = useState('');
  const [imgError, setImgError] = useState<Record<string, boolean>>({});
  const [isCustomPromptVisible, setIsCustomPromptVisible] = useState(false);
  const customPromptRef = useRef<HTMLTextAreaElement>(null);

  // Focus the custom prompt textarea when it becomes visible
  useEffect(() => {
    if (isCustomPromptVisible && customPromptRef.current) {
      customPromptRef.current.focus();
    }
  }, [isCustomPromptVisible]);

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
    
    // If custom style is selected, show the prompt area immediately
    if (styleId === 'custom') {
      setIsCustomPromptVisible(true);
      // For custom style, pass the custom prompt as the style if it's not empty
      // otherwise, pass 'custom' as a placeholder until user enters text
      if (onStyleSelect) {
        onStyleSelect(customPrompt.trim() ? customPrompt : 'custom');
      }
    } else {
      setIsCustomPromptVisible(false);
      // For predefined styles, pass the styleId directly
      if (onStyleSelect) {
        onStyleSelect(styleId);
      }
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    setQuantity(value);
    if (onQuantitySelect) {
      onQuantitySelect(value);
    }
  };

  const handleCustomPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setCustomPrompt(newValue);
    
    // Only pass the custom prompt to parent if custom style is selected
    // and the prompt is not empty
    if (selectedStyle === 'custom' && onStyleSelect) {
      onStyleSelect(newValue.trim() ? newValue : 'custom');
      console.log("Custom style prompt updated:", newValue);
    }
  };

  const handleImageError = (styleId: string) => {
    setImgError(prev => ({ ...prev, [styleId]: true }));
  };

  // Get allowed styles and max quantity based on subscription tier
  const getSubscriptionFeatures = () => {
    const tier = subscription?.tier || 'guest';
    
    // Add direct debugging output to see what's happening
    console.log("SUBSCRIPTION TIER:", tier);
    console.log("ENV VAR DIRECTLY:", process.env.NEXT_PUBLIC_GUEST_ALLOWED_STYLES);
    
    const features = getFeatureAccess(tier);
    
    // Log the feature access
    console.log("FEATURE ACCESS:", {
      allowedStyles: features.allowedStyles,
      maxQuantity: features.maxQuantity,
      hasCustomStyleAccess: features.hasCustomStyleAccess
    });
    
    return features;
  };
  
  const { allowedStyles, maxQuantity, hasCustomStyleAccess } = getSubscriptionFeatures();

  // Placeholder colors for style boxes when image fails to load
  const stylePlaceholderColors: Record<string, string> = {
    corporate: 'bg-gray-200',
    creative: 'bg-purple-100',
    casual: 'bg-blue-100',
    executive: 'bg-slate-200',
    artistic: 'bg-pink-100',
    tech: 'bg-cyan-100',
    academic: 'bg-amber-100',
    startup: 'bg-green-100',
    business: 'bg-indigo-100',
    retro: 'bg-orange-100',
    cinematic: 'bg-red-100',
    custom: 'bg-gray-100',
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Select Headshot Style</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Choose a style for your AI-generated headshot. Each style creates a different look and feel.
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 mb-8">
        {STYLE_OPTIONS.map((style) => {
          // Determine style availability directly from env-provided allowedStyles
          const isStyleAllowed = allowedStyles.includes(style.id);
          const isPremiumStyle = !isStyleAllowed;
          const hasImageError = imgError[style.id];
          const isCustom = style.id === 'custom';
          
          return (
            <div
              key={style.id}
              className={`border rounded-xl overflow-hidden flex flex-col relative transition-all transform hover:scale-102 hover:-translate-y-1 ${
                selectedStyle === style.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 shadow-md hover:shadow-lg'
              } ${isPremiumStyle ? 'opacity-70' : ''}`}
              onClick={() => isStyleAllowed && handleStyleSelect(style.id)}
            >
              {isPremiumStyle && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
                    PRO
                  </span>
                </div>
              )}
              {isCustom && isStyleAllowed && (
                <div className="absolute top-3 left-3 z-10">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                    Custom
                  </span>
                </div>
              )}
              <div className={`relative w-full h-36 ${hasImageError ? stylePlaceholderColors[style.id] || 'bg-gray-200' : ''}`}>
                {!hasImageError && (
                  <Image
                    src={style.imageSrc}
                    alt={`${style.name} style example`}
                    fill
                    className="object-cover hover:opacity-90 transition-opacity"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    onError={() => handleImageError(style.id)}
                    unoptimized
                  />
                )}
                {hasImageError && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    <span className="text-xs">{style.name} style</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{style.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{style.description}</p>
                
                {isPremiumStyle && (
                  <div className="mt-2 text-xs text-primary-600 dark:text-primary-400">
                    <Link href="/pricing" className="hover:underline font-medium">Upgrade to unlock</Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {isCustomPromptVisible && (
        <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800/50 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <label htmlFor="custom-prompt" className="text-base font-semibold text-gray-800 dark:text-gray-200">
              Custom Style Prompt {!hasCustomStyleAccess && <span className="text-yellow-600 ml-1">(Premium Feature)</span>}
            </label>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Write your own custom prompt to describe exactly the style you want for your headshot.
          </p>
          
          <textarea
            ref={customPromptRef}
            id="custom-prompt"
            value={customPrompt}
            onChange={handleCustomPromptChange}
            placeholder={hasCustomStyleAccess ? "Describe your desired headshot style in detail... (e.g., 'Professional headshot with soft lighting, modern office background, wearing a navy suit, looking confident')" : "Upgrade to Premium or Professional to use custom styles"}
            className={`w-full px-4 py-3 border border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${!hasCustomStyleAccess ? 'opacity-50 cursor-not-allowed' : ''}`}
            rows={4}
            disabled={!hasCustomStyleAccess}
          />
          
          {!hasCustomStyleAccess && (
            <div className="mt-3 text-sm text-primary-600 dark:text-primary-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>
                <Link href="/pricing" className="hover:underline font-medium">Upgrade to Premium or Professional</Link> to unlock custom styles
              </span>
            </div>
          )}
        </div>
      )}
      
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Number of Images</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Select how many headshot variations you want to generate. Each image counts as one generation from your quota.
        </p>
        
        <div className="w-full max-w-xs">
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Quantity: {quantity} {quantity > maxQuantity && <span className="text-yellow-600">(Upgrade required)</span>}
          </label>
          <select
            id="quantity"
            value={quantity}
            onChange={handleQuantityChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {QUANTITY_OPTIONS.filter(option => option <= maxQuantity || option === quantity).map((option) => (
              <option key={option} value={option}>
                {option} images {option > maxQuantity ? '(Upgrade required)' : ''}
              </option>
            ))}
          </select>
          
          {maxQuantity < Math.max(...QUANTITY_OPTIONS) && (
            <div className="mt-2 text-sm text-primary-600 dark:text-primary-400">
              <Link href="/pricing" className="hover:underline">Upgrade your plan</Link> to generate more images at once
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
