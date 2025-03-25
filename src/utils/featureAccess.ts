/**
 * Utility functions for controlling feature access based on subscription tiers
 */

import { User } from '@supabase/supabase-js';
import { UserSubscription } from '@/types/supabase';

export type SubscriptionTier = 'guest' | 'free' | 'premium' | 'professional';

export interface FeatureAccess {
  // Generation limits
  generationLimit: number;
  
  // Style features
  allowedStyles: string[];
  hasCustomStyleAccess: boolean;
  maxQuantity: number;
  
  // Advanced settings
  hasAdvancedSettings: boolean | 'limited';
  allowedAdvancedSettings?: string[];
  
  // Save to history
  canSaveToHistory: boolean | 'limited';
  saveToHistoryLimit?: number;
  
  // AI Prompt display
  showAiPrompt: boolean;
}

/**
 * Get the available features for a specific subscription tier
 */
export function getFeatureAccess(tier: SubscriptionTier): FeatureAccess {
  // Get values from environment variables or use defaults
  const getEnv = (key: string, defaultValue: string = '') => {
    // Force reading from process.env directly without caching
    const value = process.env[key];
    return value || defaultValue;
  };
  
  const getBoolEnv = (key: string, defaultValue: boolean = false) => {
    // Force reading from process.env directly without caching
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true';
  };
  
  // Process limits for each tier
  switch (tier) {
    case 'professional':
      return {
        generationLimit: Infinity,
        allowedStyles: ['corporate', 'casual', 'business', 'creative', 'tech', 'executive', 'academic', 'startup', 'artistic', 'retro', 'cinematic', 'custom'],
        hasCustomStyleAccess: getBoolEnv('NEXT_PUBLIC_PROFESSIONAL_CUSTOM_STYLE', true),
        maxQuantity: parseInt(getEnv('NEXT_PUBLIC_PROFESSIONAL_MAX_QUANTITY', '10')),
        hasAdvancedSettings: getBoolEnv('NEXT_PUBLIC_PROFESSIONAL_ADVANCED_SETTINGS', true),
        canSaveToHistory: getBoolEnv('NEXT_PUBLIC_PROFESSIONAL_SAVE_TO_HISTORY', true),
        showAiPrompt: getBoolEnv('NEXT_PUBLIC_PROFESSIONAL_SHOW_AI_PROMPT', true)
      };
    
    case 'premium':
      return {
        generationLimit: parseInt(getEnv('NEXT_PUBLIC_PREMIUM_TIER_LIMIT', '30')),
        allowedStyles: getEnv('NEXT_PUBLIC_PREMIUM_ALLOWED_STYLES', 'corporate,casual,business,creative,tech,executive,academic,startup,artistic').split(','),
        hasCustomStyleAccess: getBoolEnv('NEXT_PUBLIC_PREMIUM_CUSTOM_STYLE', true),
        maxQuantity: parseInt(getEnv('NEXT_PUBLIC_PREMIUM_MAX_QUANTITY', '6')),
        hasAdvancedSettings: getBoolEnv('NEXT_PUBLIC_PREMIUM_ADVANCED_SETTINGS', true),
        canSaveToHistory: getBoolEnv('NEXT_PUBLIC_PREMIUM_SAVE_TO_HISTORY', true),
        showAiPrompt: getBoolEnv('NEXT_PUBLIC_PREMIUM_SHOW_AI_PROMPT', true)
      };
    
    case 'free':
      return {
        generationLimit: parseInt(getEnv('NEXT_PUBLIC_FREE_TIER_LIMIT', '5')),
        allowedStyles: getEnv('NEXT_PUBLIC_FREE_ALLOWED_STYLES', 'corporate,casual,business,creative,tech').split(','),
        hasCustomStyleAccess: getBoolEnv('NEXT_PUBLIC_FREE_CUSTOM_STYLE', false),
        maxQuantity: parseInt(getEnv('NEXT_PUBLIC_FREE_MAX_QUANTITY', '4')),
        hasAdvancedSettings: getEnv('NEXT_PUBLIC_FREE_ADVANCED_SETTINGS', 'false') as boolean | 'limited',
        allowedAdvancedSettings: getEnv('NEXT_PUBLIC_FREE_ADVANCED_SETTINGS_ALLOWED', 'lighting,background').split(','),
        canSaveToHistory: getEnv('NEXT_PUBLIC_FREE_SAVE_TO_HISTORY', 'limited') as boolean | 'limited',
        saveToHistoryLimit: parseInt(getEnv('NEXT_PUBLIC_FREE_SAVE_TO_HISTORY_LIMIT', '10')),
        showAiPrompt: getBoolEnv('NEXT_PUBLIC_FREE_SHOW_AI_PROMPT', false)
      };
    
    case 'guest':
    default:
      // Explicitly log environment variables for debugging - directly from process.env
      const guestEnvVars = {
        ALLOWED_STYLES: process.env.NEXT_PUBLIC_GUEST_ALLOWED_STYLES,
        CUSTOM_STYLE: process.env.NEXT_PUBLIC_GUEST_CUSTOM_STYLE,
        ADVANCED_SETTINGS: process.env.NEXT_PUBLIC_GUEST_ADVANCED_SETTINGS,
        TIER_LIMIT: process.env.NEXT_PUBLIC_GUEST_TIER_LIMIT,
        MAX_QUANTITY: process.env.NEXT_PUBLIC_GUEST_MAX_QUANTITY
      };
      
      console.log('GUEST ENV VARS (direct):', guestEnvVars);
      
      // Parse guest allowed styles directly from process.env
      const guestStylesEnv = process.env.NEXT_PUBLIC_GUEST_ALLOWED_STYLES || 'corporate,casual,business';
      const guestStyles = guestStylesEnv
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0); // Remove any empty entries
      
      // Get other values directly from process.env
      const guestTierLimit = process.env.NEXT_PUBLIC_GUEST_TIER_LIMIT || '2';
      const guestCustomStyle = process.env.NEXT_PUBLIC_GUEST_CUSTOM_STYLE || 'false';
      const guestMaxQuantity = process.env.NEXT_PUBLIC_GUEST_MAX_QUANTITY || '2';
      const guestAdvancedSettings = process.env.NEXT_PUBLIC_GUEST_ADVANCED_SETTINGS || 'false';
      const guestSaveToHistory = process.env.NEXT_PUBLIC_GUEST_SAVE_TO_HISTORY || 'false';
      const guestShowAiPrompt = process.env.NEXT_PUBLIC_GUEST_SHOW_AI_PROMPT || 'false';
      
      // Parse the values
      const result = {
        generationLimit: parseInt(guestTierLimit),
        allowedStyles: guestStyles,
        hasCustomStyleAccess: guestCustomStyle.toLowerCase() === 'true',
        maxQuantity: parseInt(guestMaxQuantity),
        hasAdvancedSettings: guestAdvancedSettings.toLowerCase() === 'true',
        canSaveToHistory: guestSaveToHistory.toLowerCase() === 'true',
        showAiPrompt: guestShowAiPrompt.toLowerCase() === 'true'
      };
      
      console.log('GUEST FEATURE ACCESS (calculated):', result);
      
      return result;
  }
}

/**
 * Check if a user can save an image to history based on their subscription tier and usage
 */
export function canSaveToHistory(tier: SubscriptionTier, savedImagesCount: number): boolean {
  const featureAccess = getFeatureAccess(tier);
  
  if (featureAccess.canSaveToHistory === true) {
    return true;
  } else if (featureAccess.canSaveToHistory === 'limited' && featureAccess.saveToHistoryLimit !== undefined) {
    return savedImagesCount < featureAccess.saveToHistoryLimit;
  }
  
  return false;
}

/**
 * Check if the user has enough credits to generate images
 */
export function hasEnoughCredits(subscription: UserSubscription | null): boolean {
  if (!subscription) return false;
  return subscription.credits_remaining > 0;
}

/**
 * Get user's subscription tier from subscription data
 */
export function getUserTier(user: User | null, subscription: UserSubscription | null): SubscriptionTier {
  if (!user) return 'guest';
  if (!subscription) return 'free';
  return subscription.tier as SubscriptionTier;
}

/**
 * Check if user has access to a specific style based on their subscription
 */
export function hasStyleAccess(style: string, user: User | null, subscription: UserSubscription | null): boolean {
  const tier = getUserTier(user, subscription);
  const featureAccess = getFeatureAccess(tier);
  
  if (style === 'custom') {
    return featureAccess.hasCustomStyleAccess;
  }
  
  return featureAccess.allowedStyles.includes(style);
}

/**
 * Check if user has access to advanced settings
 */
export function hasAdvancedSettingsAccess(
  user: User | null, 
  subscription: UserSubscription | null, 
  settingName?: string
): boolean {
  const tier = getUserTier(user, subscription);
  const featureAccess = getFeatureAccess(tier);
  
  if (featureAccess.hasAdvancedSettings === true) {
    return true;
  }
  
  if (featureAccess.hasAdvancedSettings === 'limited' && settingName && featureAccess.allowedAdvancedSettings) {
    return featureAccess.allowedAdvancedSettings.includes(settingName);
  }
  
  return false;
}

/**
 * Get number of images user can generate per session based on their tier
 */
export function getMaxQuantity(user: User | null, subscription: UserSubscription | null): number {
  const tier = getUserTier(user, subscription);
  const featureAccess = getFeatureAccess(tier);
  return featureAccess.maxQuantity;
}

/**
 * Get user-friendly subscription tier name
 */
export function getTierDisplayName(tier: SubscriptionTier): string {
  switch (tier) {
    case 'professional': return 'Professional';
    case 'premium': return 'Premium';
    case 'free': return 'Free';
    case 'guest': return 'Guest';
    default: return 'Free';
  }
}
