'use client';

import React, { useState, useEffect } from 'react';
import { testListHeadshots, testCreateHeadshot, testDeleteHeadshot } from '@/utils/supabaseDebugger';
import { UserHeadshot } from '@/types/supabase';

const HeadshotDebugger = () => {
  // State for headshots
  const [headshots, setHeadshots] = useState<UserHeadshot[]>([]);
  
  // Form states for creating a new headshot
  const [imageUrl, setImageUrl] = useState('https://example.com/test-headshot.jpg');
  const [originalImageUrl, setOriginalImageUrl] = useState('https://example.com/test-original.jpg');
  const [style, setStyle] = useState('');
  const [settings, setSettings] = useState('{}');
  
  // Results and status
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load headshots on mount
  useEffect(() => {
    loadHeadshots();
  }, []);
  
  const loadHeadshots = async () => {
    setIsLoading(true);
    const result = await testListHeadshots();
    
    setResults(prev => [{ type: 'listHeadshots', data: result }, ...prev]);
    
    if (result.success && result.data.headshots) {
      setHeadshots(result.data.headshots);
    }
    
    setIsLoading(false);
  };
  
  const handleCreateHeadshot = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    let parsedSettings = {};
    try {
      parsedSettings = JSON.parse(settings);
    } catch (err) {
      alert('Invalid JSON for settings');
      setIsLoading(false);
      return;
    }
    
    const headshotData: Partial<UserHeadshot> = {
      image_url: imageUrl,
      original_image_url: originalImageUrl,
      style,
      settings: parsedSettings
    };
    
    const result = await testCreateHeadshot(headshotData);
    setResults(prev => [{ type: 'createHeadshot', data: result }, ...prev]);
    
    if (result.success) {
      // Reload headshots to show the new one
      await loadHeadshots();
    }
    
    setIsLoading(false);
  };
  
  const handleDeleteHeadshot = async (headshot: UserHeadshot) => {
    if (!confirm(`Are you sure you want to delete this headshot?`)) {
      return;
    }
    
    setIsLoading(true);
    
    const result = await testDeleteHeadshot(headshot.id);
    setResults(prev => [{ type: 'deleteHeadshot', data: result }, ...prev]);
    
    if (result.success) {
      // Reload headshots to update the list
      await loadHeadshots();
    }
    
    setIsLoading(false);
  };
  
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
      <h2 className="text-xl font-bold mb-4">Headshot Testing</h2>
      
      {/* Current headshots */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">User Headshots</h3>
          <button 
            onClick={loadHeadshots} 
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            disabled={isLoading}
          >
            Refresh Headshots
          </button>
        </div>
        
        {headshots.length === 0 ? (
          <p className="p-3 bg-gray-100 dark:bg-gray-700 rounded text-gray-500">
            {isLoading ? 'Loading headshots...' : 'No headshots found or user not logged in'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {headshots.map(headshot => (
              <div key={headshot.id} className="border rounded overflow-hidden">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 border-b flex justify-between items-center">
                  <span className="font-medium truncate">{headshot.style || 'No style'}</span>
                  <button 
                    onClick={() => handleDeleteHeadshot(headshot)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                    disabled={isLoading}
                  >
                    Delete
                  </button>
                </div>
                <div className="p-2">
                  <div className="text-sm mb-1">
                    <span className="font-medium">ID:</span> 
                    <span className="text-gray-600 ml-1 break-all">{headshot.id}</span>
                  </div>
                  <div className="text-sm mb-1">
                    <span className="font-medium">Created:</span> 
                    <span className="text-gray-600 ml-1">{new Date(headshot.created_at).toLocaleString()}</span>
                  </div>
                  <details className="text-sm mt-2">
                    <summary className="cursor-pointer text-blue-500">View URLs & Settings</summary>
                    <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded mt-1">
                      <div className="mb-1">
                        <span className="font-medium">Image URL:</span> 
                        <span className="text-gray-600 ml-1 break-all">{headshot.image_url}</span>
                      </div>
                      <div className="mb-1">
                        <span className="font-medium">Original Image URL:</span> 
                        <span className="text-gray-600 ml-1 break-all">{headshot.original_image_url}</span>
                      </div>
                      <div>
                        <span className="font-medium">Settings:</span>
                        <pre className="text-xs bg-gray-200 dark:bg-gray-800 p-1 rounded mt-1 overflow-auto">
                          {JSON.stringify(headshot.settings, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Create headshot form */}
      <div className="mb-6 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">Create Test Headshot</h3>
        <form onSubmit={handleCreateHeadshot} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Image URL</label>
            <input 
              type="text" 
              value={imageUrl} 
              onChange={(e) => setImageUrl(e.target.value)} 
              className="w-full p-2 border rounded"
              placeholder="https://example.com/test-headshot.jpg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Original Image URL</label>
            <input 
              type="text" 
              value={originalImageUrl} 
              onChange={(e) => setOriginalImageUrl(e.target.value)} 
              className="w-full p-2 border rounded"
              placeholder="https://example.com/test-original.jpg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Style</label>
            <select 
              value={style} 
              onChange={(e) => setStyle(e.target.value)} 
              className="w-full p-2 border rounded"
            >
              <option value="">Select Style</option>
              <option value="business">Business</option>
              <option value="casual">Casual</option>
              <option value="creative">Creative</option>
              <option value="professional">Professional</option>
              <option value="academic">Academic</option>
              <option value="tech">Tech</option>
              <option value="executive">Executive</option>
              <option value="startup">Startup</option>
              <option value="corporate">Corporate</option>
              <option value="cinematic">Cinematic</option>
              <option value="artistic">Artistic</option>
              <option value="retro">Retro</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Settings (JSON)</label>
            <textarea 
              value={settings} 
              onChange={(e) => setSettings(e.target.value)} 
              className="w-full p-2 border rounded h-24 font-mono text-sm"
              placeholder={`{\n  "property": "value"\n}`}
            />
          </div>
          <button 
            type="submit" 
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Test Headshot'}
          </button>
        </form>
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

export default HeadshotDebugger;
