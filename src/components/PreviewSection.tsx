'use client';

import { useState } from 'react';
import Image from 'next/image';
import supabase from '@/lib/supabase';

export default function PreviewSection({ originalImage, generatedImages, onSaveImage, onFeedback }) {
  const [selectedImage, setSelectedImage] = useState(generatedImages && generatedImages.length > 0 ? 0 : null);
  const [savedImages, setSavedImages] = useState([]);
  const [feedback, setFeedback] = useState({});
  const [saving, setSaving] = useState(false);
  
  const downloadImage = async (imageData, index) => {
    // Create a download link for the image
    const link = document.createElement('a');
    link.href = `data:${imageData.mimeType};base64,${imageData.data}`;
    link.download = `headshot_${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const saveToProfile = async (imageData, index) => {
    if (savedImages.includes(index)) {
      return; // Already saved
    }
    
    setSaving(true);
    
    try {
      // Save to Supabase Storage
      const timestamp = new Date().getTime();
      const path = `headshots/${timestamp}_${index}.png`;
      
      // Convert base64 to Blob
      const byteCharacters = atob(imageData.data);
      const byteArrays = [];
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays.push(byteCharacters.charCodeAt(i));
      }
      
      const blob = new Blob([new Uint8Array(byteArrays)], { type: imageData.mimeType });
      
      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from('user-headshots')
        .upload(path, blob);
      
      if (error) {
        throw error;
      }
      
      // Get the URL
      const { data: urlData } = supabase.storage
        .from('user-headshots')
        .getPublicUrl(path);
      
      // Add to image history in database
      const { error: dbError } = await supabase
        .from('image_history')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user.id,
          image_path: path,
          image_url: urlData.publicUrl,
          settings: JSON.stringify({}) // You can pass the settings here
        });
      
      if (dbError) {
        throw dbError;
      }
      
      // Update state
      setSavedImages([...savedImages, index]);
      
      // Call parent callback
      if (onSaveImage) {
        onSaveImage(imageData, index);
      }
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Failed to save image. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const provideFeedback = (index, isPositive) => {
    const newFeedback = { ...feedback, [index]: isPositive };
    setFeedback(newFeedback);
    
    if (onFeedback) {
      onFeedback(index, isPositive);
    }
  };
  
  // If there are no generated images yet, show a placeholder
  if (!generatedImages || generatedImages.length === 0) {
    return (
      <div className="w-full rounded-lg border border-gray-200 p-6 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Generated Headshots</h2>
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg dark:bg-gray-900">
          <p className="text-gray-500 dark:text-gray-400">Your AI-generated headshots will appear here.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Your Generated Headshots</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select a headshot to view and download. You can also save it to your profile for future access.
        </p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Thumbnails */}
        <div className="lg:w-1/4">
          <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Results ({generatedImages.length})</h3>
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
            {generatedImages.map((image, index) => (
              <div 
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative cursor-pointer rounded-md overflow-hidden border-2 ${
                  selectedImage === index ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                <div className="aspect-w-1 aspect-h-1 w-full">
                  <Image
                    src={`data:${image.mimeType};base64,${image.data}`}
                    alt={`Headshot ${index + 1}`}
                    width={100}
                    height={100}
                    layout="responsive"
                    className="object-cover"
                  />
                </div>
                {savedImages.includes(index) && (
                  <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Selected Image Preview */}
        {selectedImage !== null && (
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-md dark:bg-gray-800">
              <div className="p-4 border-b dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Headshot {selectedImage + 1}</h3>
              </div>
              
              <div className="p-4">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Original image */}
                  <div className="md:w-1/2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Original Photo</h4>
                    <div className="relative w-full aspect-w-1 aspect-h-1 rounded overflow-hidden bg-gray-100 dark:bg-gray-900">
                      {originalImage && (
                        <Image
                          src={originalImage}
                          alt="Original"
                          fill
                          className="object-contain"
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Generated image */}
                  <div className="md:w-1/2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">AI-Enhanced Headshot</h4>
                    <div className="relative w-full aspect-w-1 aspect-h-1 rounded overflow-hidden bg-gray-100 dark:bg-gray-900">
                      <Image
                        src={`data:${generatedImages[selectedImage].mimeType};base64,${generatedImages[selectedImage].data}`}
                        alt={`Headshot ${selectedImage + 1}`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => downloadImage(generatedImages[selectedImage], selectedImage)}
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    Download
                  </button>
                  
                  <button
                    onClick={() => saveToProfile(generatedImages[selectedImage], selectedImage)}
                    disabled={savedImages.includes(selectedImage) || saving}
                    className={`flex items-center justify-center px-4 py-2 border rounded-md ${
                      savedImages.includes(selectedImage)
                        ? 'bg-green-50 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {savedImages.includes(selectedImage) ? (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Saved to Profile
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                        </svg>
                        {saving ? 'Saving...' : 'Save to Profile'}
                      </>
                    )}
                  </button>
                </div>
                
                {/* Feedback */}
                <div className="mt-6 border-t pt-4 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Provide Feedback</h4>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => provideFeedback(selectedImage, true)}
                      className={`flex items-center px-3 py-2 border rounded-md ${
                        feedback[selectedImage] === true
                          ? 'bg-green-50 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
                      </svg>
                      Good Result
                    </button>
                    <button
                      onClick={() => provideFeedback(selectedImage, false)}
                      className={`flex items-center px-3 py-2 border rounded-md ${
                        feedback[selectedImage] === false
                          ? 'bg-red-50 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2"></path>
                      </svg>
                      Needs Improvement
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}