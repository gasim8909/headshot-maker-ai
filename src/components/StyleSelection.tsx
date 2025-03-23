'use client';

import { useState } from 'react';

// Style options as defined in the project spec
const STYLE_OPTIONS = [
  { id: 'corporate', name: 'Corporate', description: 'Traditional professional look' },
  { id: 'creative', name: 'Creative', description: 'Modern, stylish appearance' },
  { id: 'casual', name: 'Casual', description: 'Natural, friendly vibe' },
  { id: 'executive', name: 'Executive', description: 'Leadership presence' },
  { id: 'artistic', name: 'Artistic', description: 'Creative professional, artsy' },
  { id: 'tech', name: 'Tech', description: 'Digital expert look' },
  { id: 'academic', name: 'Academic', description: 'Scholarly tone' },
  { id: 'startup', name: 'Startup', description: 'Entrepreneurial, relaxed' },
  { id: 'business', name: 'Business', description: 'Polished business look' },
  { id: 'retro', name: 'Retro', description: 'Vintage, old-school portrait' },
  { id: 'cinematic', name: 'Cinematic', description: 'Movie poster style lighting' },
  { id: 'custom', name: 'Custom', description: 'Your own custom style' }
];

// Quantity options
const QUANTITY_OPTIONS = [2, 3, 4, 5, 6, 8, 10];

export default function StyleSelection({ onStyleSelect, onQuantitySelect }) {
  const [selectedStyle, setSelectedStyle] = useState('corporate');
  const [quantity, setQuantity] = useState(4);
  const [customPrompt, setCustomPrompt] = useState('');

  const handleStyleSelect = (styleId) => {
    setSelectedStyle(styleId);
    if (onStyleSelect) {
      onStyleSelect(styleId === 'custom' ? customPrompt : styleId);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setQuantity(value);
    if (onQuantitySelect) {
      onQuantitySelect(value);
    }
  };

  const handleCustomPromptChange = (e) => {
    setCustomPrompt(e.target.value);
    if (selectedStyle === 'custom' && onStyleSelect) {
      onStyleSelect(e.target.value);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Select Headshot Style</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Choose a style for your AI-generated headshot. Each style creates a different look and feel.
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
        {STYLE_OPTIONS.map((style) => (
          <div
            key={style.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedStyle === style.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
            }`}
            onClick={() => handleStyleSelect(style.id)}
          >
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">{style.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{style.description}</p>
          </div>
        ))}
      </div>
      
      {selectedStyle === 'custom' && (
        <div className="mb-8">
          <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Custom Style Prompt
          </label>
          <textarea
            id="custom-prompt"
            value={customPrompt}
            onChange={handleCustomPromptChange}
            placeholder="Describe your desired headshot style in detail..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            rows={3}
          />
        </div>
      )}
      
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Number of Images</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Select how many headshot variations you want to generate. Each image counts as one generation from your quota.
        </p>
        
        <div className="w-full max-w-xs">
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Quantity: {quantity}
          </label>
          <select
            id="quantity"
            value={quantity}
            onChange={handleQuantityChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {QUANTITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option} images
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}