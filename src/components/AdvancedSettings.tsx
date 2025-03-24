'use client';

import { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { SubscriptionTier, getFeatureAccess } from '@/utils/featureAccess';
import Link from 'next/link';

interface AdvancedSettingsProps {
  onChange: (settings: any) => void;
  subscription?: { tier: SubscriptionTier; used_generations: number };
}

// Default values for settings
const DEFAULT_SETTINGS = {
  lighting: 'natural',
  background: null,
  sharpness: 'medium',
  expression: 'natural',
  headPosition: 'centered',
  eyeFocus: 'direct'
};

// Define background color options
const BACKGROUND_COLORS = [
  { value: 'white', display: 'White', class: 'bg-white border border-gray-300' },
  { value: 'gray', display: 'Gray', class: 'bg-gray-400' },
  { value: 'black', display: 'Black', class: 'bg-black' },
  { value: 'blue', display: 'Blue', class: 'bg-blue-500' },
  { value: 'green', display: 'Green', class: 'bg-green-500' },
  { value: 'purple', display: 'Purple', class: 'bg-purple-500' }
];

export default function AdvancedSettings({ onChange, subscription }: AdvancedSettingsProps) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState("#6366f1"); // Default custom color

  const handleSettingChange = (setting: string, value: any) => {
    const newSettings = { ...settings, [setting]: value };
    setSettings(newSettings);
    
    if (onChange) {
      onChange(newSettings);
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    
    if (onChange) {
      onChange(DEFAULT_SETTINGS);
    }
  };

  // Get access rights based on subscription tier
  const getSubscriptionFeatures = () => {
    const tier = subscription?.tier || 'guest';
    
    // Debug logging
    console.log("ADVANCED SETTINGS - SUBSCRIPTION TIER:", tier);
    
    const features = getFeatureAccess(tier);
    
    console.log("ADVANCED SETTINGS - FEATURE ACCESS:", {
      hasAdvancedSettings: features.hasAdvancedSettings,
      allowedAdvancedSettings: features.allowedAdvancedSettings
    });
    
    return features;
  };
  
  const { hasAdvancedSettings, allowedAdvancedSettings } = getSubscriptionFeatures();
  
  // Check if a specific setting is allowed for the current tier
  const isSettingAllowed = (settingName: string) => {
    // Use standard permission logic based on environment variables
    if (hasAdvancedSettings === true) return true;
    if (hasAdvancedSettings === 'limited' && allowedAdvancedSettings) {
      return allowedAdvancedSettings.includes(settingName);
    }
    return false;
  };

  return (
    <div className="w-full border rounded-lg p-4 bg-white dark:bg-gray-800 mb-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Advanced Settings</h2>
          {hasAdvancedSettings === false && (
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
              PRO
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="focus:outline-none"
          disabled={hasAdvancedSettings === false}
        >
          <svg
            className={`w-5 h-5 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </div>
      
      {hasAdvancedSettings === false && (
        <div className="mt-2 text-sm text-primary-600 dark:text-primary-400">
          <Link href="/pricing" className="hover:underline">Upgrade to Premium or Professional</Link> to unlock advanced settings
        </div>
      )}
      
      {isExpanded && (
        <div className="mt-4 space-y-6">
          {/* Lighting Control - Always available in limited access */}
          <div>
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lighting Intensity
              </label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Soft', value: 'soft', icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 15.93c-1.86-1.66-3-4.07-3-6.93 0-2.86 1.14-5.27 3-6.93m-9 6.93a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )},
                { label: 'Natural', value: 'natural', icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )},
                { label: 'Bright', value: 'bright', icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              ].map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleSettingChange('lighting', option.value)}
                  className={`flex items-center justify-center py-2 border rounded-md ${
                    settings.lighting === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                  disabled={!isSettingAllowed('lighting')}
                >
                  {option.icon}
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Background - Basic setting */}
          <div className={!isSettingAllowed('background') ? 'opacity-60' : ''}>
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Background
              </label>
              {!isSettingAllowed('background') && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
                  PRO
                </span>
              )}
            </div>
            
            {/* Simple Background option first */}
            <div className="grid grid-cols-1 gap-3 mb-3">
              <button
                onClick={() => {
                  handleSettingChange('background', null);
                  setShowColorPicker(false);
                }}
                className={`flex items-center justify-center py-2 border rounded-md ${
                  settings.background === null
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
                  />
                </svg>
                <span>No change</span>
              </button>
            </div>
            
            {/* Standard color options */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              {BACKGROUND_COLORS.map((bgColor) => (
                <button
                  key={bgColor.value}
                  onClick={() => {
                    handleSettingChange('background', bgColor.value);
                    setShowColorPicker(false);
                  }}
                  className={`flex items-center justify-center py-2 border rounded-md ${
                    settings.background === bgColor.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full mr-2 ${bgColor.class}`}></div>
                  <span className="capitalize">{bgColor.display}</span>
                </button>
              ))}
            </div>
            
            {/* Custom color option */}
            <div className="grid grid-cols-1 gap-3">
              
              {/* Custom color picker option */}
              <button
                onClick={() => {
                  setShowColorPicker(!showColorPicker);
                  if (!showColorPicker && settings.background !== 'custom') {
                    handleSettingChange('background', 'custom');
                  }
                }}
                className={`flex items-center justify-center py-2 border rounded-md ${
                  settings.background === 'custom'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div 
                  className="w-4 h-4 rounded-full mr-2" 
                  style={{ backgroundColor: customColor }}
                ></div>
                <span>Custom</span>
              </button>
            </div>
            
            {/* Color picker */}
            {showColorPicker && (
              <div className="mt-3">
                <HexColorPicker 
                  color={customColor} 
                  onChange={(color: string) => {
                    setCustomColor(color);
                    handleSettingChange('background', 'custom');
                    handleSettingChange('customColor', color);
                  }} 
                  className="w-full"
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Selected: {customColor}
                  </div>
                  <button
                    onClick={() => setShowColorPicker(false)}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Sharpness - Premium setting */}
          <div className={!isSettingAllowed('sharpness') ? 'opacity-60' : ''}>
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image Sharpness
              </label>
              {!isSettingAllowed('sharpness') && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
                  PRO
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {['low', 'medium', 'high'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleSettingChange('sharpness', option)}
                  className={`py-2 border rounded-md capitalize ${
                    settings.sharpness === option
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          {/* Facial Expression - Premium setting */}
          <div className={!isSettingAllowed('expression') ? 'opacity-60' : ''}>
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Facial Expression
              </label>
              {!isSettingAllowed('expression') && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
                  PRO
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['natural', 'confident', 'friendly', 'professional'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleSettingChange('expression', option)}
                  className={`py-2 border rounded-md capitalize ${
                    settings.expression === option
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          {/* Head Position - Premium setting */}
          <div className={!isSettingAllowed('headPosition') ? 'opacity-60' : ''}>
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Head Position
              </label>
              {!isSettingAllowed('headPosition') && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
                  PRO
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { 
                  value: 'slight-left', 
                  label: 'Left',
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  )
                },
                { 
                  value: 'centered', 
                  label: 'Center',
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  )
                },
                { 
                  value: 'slight-right', 
                  label: 'Right',
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  )
                }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSettingChange('headPosition', option.value)}
                  className={`flex items-center justify-center py-2 border rounded-md ${
                    settings.headPosition === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {option.icon}
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Eye Focus - Premium setting */}
          <div className={!isSettingAllowed('eyeFocus') ? 'opacity-60' : ''}>
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Eye Focus
              </label>
              {!isSettingAllowed('eyeFocus') && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
                  PRO
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {['direct', 'soft', 'side'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleSettingChange('eyeFocus', option)}
                  className={`py-2 border rounded-md capitalize ${
                    settings.eyeFocus === option
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          {/* Reset Button */}
          <div className="pt-4 flex justify-between">
            {hasAdvancedSettings !== true && (
              <div className="text-sm text-primary-600 dark:text-primary-400">
                <Link href="/pricing" className="hover:underline">Upgrade to Premium or Professional</Link> for all advanced settings
              </div>
            )}
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Reset to Default
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
