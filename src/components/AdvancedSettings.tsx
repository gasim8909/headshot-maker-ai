'use client';

import { useState } from 'react';

// Default values for settings
const DEFAULT_SETTINGS = {
  lighting: 0,
  background: 'white',
  sharpness: 'medium',
  expression: 'natural',
  headPosition: 'centered',
  eyeFocus: 'direct'
};

export default function AdvancedSettings({ onChange }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSettingChange = (setting, value) => {
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

  return (
    <div className="w-full border rounded-lg p-4 bg-white dark:bg-gray-800 mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center focus:outline-none"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Advanced Settings</h2>
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
      
      {isExpanded && (
        <div className="mt-4 space-y-6">
          {/* Lighting Control */}
          <div>
            <label htmlFor="lighting" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Lighting Intensity: {settings.lighting}
            </label>
            <input
              id="lighting"
              type="range"
              min="-2"
              max="2"
              step="1"
              value={settings.lighting}
              onChange={(e) => handleSettingChange('lighting', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Softer (-2)</span>
              <span>Neutral (0)</span>
              <span>Brighter (+2)</span>
            </div>
          </div>
          
          {/* Background */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Background
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['white', 'gray', 'black'].map((bgColor) => (
                <button
                  key={bgColor}
                  onClick={() => handleSettingChange('background', bgColor)}
                  className={`flex items-center justify-center py-2 border rounded-md ${
                    settings.background === bgColor
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div 
                    className={`w-4 h-4 rounded-full mr-2 ${
                      bgColor === 'white' ? 'bg-white border border-gray-300' : 
                      bgColor === 'gray' ? 'bg-gray-400' : 'bg-black'
                    }`}
                  ></div>
                  <span className="capitalize">{bgColor}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Sharpness */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Image Sharpness
            </label>
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
          
          {/* Facial Expression */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Facial Expression
            </label>
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
          
          {/* Head Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Head Position
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['slight-left', 'centered', 'slight-right'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleSettingChange('headPosition', option)}
                  className={`py-2 border rounded-md ${
                    settings.headPosition === option
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {option === 'slight-left' ? '↖ Left' : 
                   option === 'centered' ? '↑ Center' : 
                   '↗ Right'}
                </button>
              ))}
            </div>
          </div>
          
          {/* Eye Focus */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Eye Focus
            </label>
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
          <div className="pt-4 flex justify-end">
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