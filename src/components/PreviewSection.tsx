'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import supabase from '@/lib/supabase';
import { SubscriptionTier, canSaveToHistory, getTierDisplayName, getFeatureAccess } from '@/utils/featureAccess';

interface PreviewSectionProps {
  originalImage: string | null;
  generatedImages: any[];
  onSaveImage: (imageData: any, index: number) => void;
  onFeedback: (index: number, isPositive: boolean) => void;
  subscription?: { tier: SubscriptionTier; used_generations: number };
  user?: any;
  prompt?: string; // The prompt used to generate images
}

export default function PreviewSection({ 
  originalImage, 
  generatedImages, 
  onSaveImage, 
  onFeedback,
  subscription,
  user,
  prompt
}: PreviewSectionProps) {
  const [selectedImage, setSelectedImage] = useState(generatedImages && generatedImages.length > 0 ? 0 : null);
  const [savedImages, setSavedImages] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<Record<number, boolean>>({});
  const [savingImages, setSavingImages] = useState<Record<number, boolean>>({});
  const [savedImagesCount, setSavedImagesCount] = useState(0);
  const router = useRouter();

  // Fetch saved images count for free tier users (limit checking)
  useEffect(() => {
    async function fetchSavedImagesCount() {
      if (subscription?.tier === 'free' && user) {
        try {
          const { count, error } = await supabase
            .from('user_headshots')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          
          if (!error && count !== null) {
            setSavedImagesCount(count);
          }
        } catch (error) {
          console.error('Error fetching saved images count:', error);
        }
      }
    }
    
    fetchSavedImagesCount();
  }, [subscription, user]);
  
  interface ImageData {
    data: string;
    mimeType: string;
  }
  
  const downloadImage = async (imageData: ImageData, index: number) => {
    // Create a download link for the image
    const link = document.createElement('a');
    link.href = `data:${imageData.mimeType};base64,${imageData.data}`;
    link.download = `headshot_${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const saveToProfile = async (imageData: ImageData, index: number) => {
    if (savedImages.includes(index)) {
      return; // Already saved
    }
    
    // Set saving state for this specific image
    setSavingImages(prev => ({ ...prev, [index]: true }));
    
    // Debug data
    let storageSuccess = false;
    let urlSuccess = false;
    let databaseSuccess = false;
    let usedStoragePath = false;
    let debugData: {
      stage: string;
      storageError: any;
      urlError: any;
      databaseError: any;
      userId: string | null;
      publicUrl: string | null;
    } = {
      stage: "starting",
      storageError: null,
      urlError: null,
      databaseError: null,
      userId: null,
      publicUrl: null
    };
    
    try {
      // Get user data first to avoid doing unnecessary work if not authenticated
      debugData.stage = "authentication";
      console.log("Getting authenticated user");
      
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (!userData || !userData.user) {
        const err = new Error('User not authenticated');
        debugData.userId = "authentication failed";
        throw err;
      }
      
      debugData.userId = userData.user.id;
      console.log("User authenticated, id:", userData.user.id);
      
      let imageUrl = '';
      const timestamp = new Date().getTime();
      
      try {
        // Directly proceed with the upload - the bucket already exists
        debugData.stage = "storage upload";
        console.log("Stage 1: Uploading to Supabase Storage");
        
        const path = `${timestamp}_${index}.png`;
        
        // Convert base64 to Blob
        const byteCharacters = atob(imageData.data);
        const byteArrays = [];
        
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArrays.push(byteCharacters.charCodeAt(i));
        }
        
        const blob = new Blob([new Uint8Array(byteArrays)], { type: imageData.mimeType });
        
        // Try to upload to Supabase
        const { data: storageData, error: storageError } = await supabase.storage
          .from('headshots')
          .upload(path, blob, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (storageError) {
          console.error('Storage upload failed:', storageError);
          debugData.storageError = storageError;
          throw storageError;
        }
        
        console.log("Storage upload successful:", storageData);
        storageSuccess = true;
        
        // Get the URL
        debugData.stage = "getting public URL";
        console.log("Stage 2: Getting public URL");
        
        const { data: urlData } = supabase.storage
          .from('headshots')
          .getPublicUrl(path);
        
        if (!urlData || !urlData.publicUrl) {
          const err = new Error('Failed to get public URL');
          debugData.urlError = err;
          throw err;
        }
        
        imageUrl = urlData.publicUrl;
        debugData.publicUrl = urlData.publicUrl;
        urlSuccess = true;
        usedStoragePath = true;
        console.log("Public URL obtained:", urlData.publicUrl);
      } catch (storageErr) {
        console.error("Error in storage operations:", storageErr);
        alert("Failed to save image to storage. Please try again or contact support if the problem persists.");
        throw storageErr;
      }
      
      // Stage 3: Add to user_headshots in database
      debugData.stage = "database insert";
      console.log("Stage 3: Saving to user_headshots table");
      
      // Show what we're inserting into the database
      const insertData = {
        user_id: userData.user.id,
        image_url: imageUrl,
        original_image_url: originalImage || '',
        style: 'custom',
        settings: {}, // You can pass the settings here as an object
        created_at: new Date().toISOString()
      };
      
      console.log("Inserting into user_headshots:", insertData);
      
      const { data: insertResult, error: dbError } = await supabase
        .from('user_headshots')
        .insert(insertData)
        .select();
      
      if (dbError) {
        debugData.databaseError = dbError;
        console.error('Database insert failed:', dbError);
        throw dbError;
      }
      
      console.log("Database insert successful:", insertResult);
      databaseSuccess = true;
      
      // Update state
      setSavedImages([...savedImages, index]);
      
      // Call parent callback
      if (onSaveImage) {
        onSaveImage(imageData, index);
      }
      
      console.log("Save process completed successfully!");
    } catch (error: any) {
      console.error('Error saving image:', error);
      console.error('Debug data:', debugData);
      
      // Show detailed error message
      let errorMessage = 'Failed to save image. ';
      
      if (debugData.stage === "storage upload") {
        errorMessage += "Storage upload failed. ";
      } else if (debugData.stage === "getting public URL") {
        errorMessage += "Failed to get public URL. ";
      } else if (debugData.stage === "database insert") {
        errorMessage += "Database insert failed. ";
      }
      
      // Check for common Supabase errors
      const errorMsg = error?.message || 'Unknown error';
      
      if (errorMsg.includes("auth/unauthorized")) {
        errorMessage += "Authentication error - please try logging in again.";
      } else if (errorMsg.includes("duplicate key")) {
        errorMessage += "This image appears to already be saved.";
      } else {
        errorMessage += errorMsg;
      }
      
      alert(errorMessage);
    } finally {
      // Clear saving state for this specific image
      setSavingImages(prev => ({ ...prev, [index]: false }));
      
      // Display results in console for debugging
      console.log("Save operation complete with results:", {
        storageSuccess,
        urlSuccess,
        databaseSuccess,
        debugData
      });
    }
  };
  
  // Check if user can save to history based on subscription tier
  const userCanSaveToHistory = (): boolean => {
    if (!user) return false; // Guest user can't save
    if (!subscription) return false;
    
    return canSaveToHistory(subscription.tier, savedImagesCount);
  };
  
  const provideFeedback = (index: number | null, isPositive: boolean) => {
    if (index === null || index < 0) return;
    
    const newFeedback = { ...feedback, [index as number]: isPositive };
    setFeedback(newFeedback);
    
    if (onFeedback) {
      onFeedback(index, isPositive);
    }
  };
  
  // If there are no generated images yet, show a placeholder
  if (!generatedImages || generatedImages.length === 0) {
    return (
      <div id="results-section" className="w-full rounded-lg border border-gray-200 p-6 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Generated Headshots</h2>
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg dark:bg-gray-900">
          <p className="text-gray-500 dark:text-gray-400">Your AI-generated headshots will appear here.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div id="results-section" className="w-full">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Your Generated Headshots</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select a headshot to view and download. You can also save it to your profile for future access.
        </p>
      </div>
      
      <div className="mb-2">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Results ({generatedImages.length})</h3>
      </div>
      
      {/* Display the prompt used to generate the images if the user's subscription allows it */}
      {prompt && subscription && getFeatureAccess(subscription.tier).showAiPrompt && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Prompt Used:</h4>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-mono">{prompt}</p>
        </div>
      )}
      
      {/* Row-based grid layout for all images */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {generatedImages.map((image, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-800 flex flex-col">
            {/* Image header */}
            <div className="p-3 border-b dark:border-gray-700">
              <h3 className="text-md font-medium text-gray-900 dark:text-white">Headshot {index + 1}</h3>
            </div>
            
            {/* Image comparison */}
            <div className="p-3">
              <div className="flex space-x-4 mb-3">
                {/* Original small thumbnail */}
                {originalImage && (
                  <div className="w-1/4">
                    <div className="relative aspect-square rounded overflow-hidden bg-gray-100 dark:bg-gray-900">
                      <Image
                        src={originalImage}
                        alt="Original"
                        width={100}
                        height={100}
                        className="object-contain"
                      />
                    </div>
                    <p className="text-xs mt-1 text-center text-gray-500 dark:text-gray-400">Original</p>
                  </div>
                )}
                
                {/* Generated image - larger */}
                <div className={originalImage ? "w-3/4" : "w-full"}>
                  <div className="relative aspect-square rounded overflow-hidden bg-gray-100 dark:bg-gray-900">
                    <Image
                      src={`data:${image.mimeType};base64,${image.data}`}
                      alt={`Headshot ${index + 1}`}
                      width={300}
                      height={300}
                      className="object-contain"
                    />
                    {savedImages.includes(index) && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-xs mt-1 text-center text-gray-500 dark:text-gray-400">AI-Enhanced</p>
                </div>
              </div>
              
              {/* Action icons */}
              <div className="flex justify-center space-x-3 mt-3">
                {/* Download icon */}
                <button
                  onClick={() => downloadImage(image, index)}
                  title="Download Image"
                  className="flex flex-col items-center"
                >
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-800/50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                  </div>
                  <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">Download</span>
                </button>
                
                {/* Save to history icon */}
                {userCanSaveToHistory() ? (
                  <button
                    onClick={() => saveToProfile(image, index)}
                    disabled={savedImages.includes(index) || savingImages[index]}
                    title={savedImages.includes(index) ? "Saved to History" : "Save to History"}
                    className="flex flex-col items-center"
                  >
                    <div className={`p-2 rounded-full ${
                      savedImages.includes(index)
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                    } ${savingImages[index] ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                      </svg>
                    </div>
                    <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                      {savedImages.includes(index) ? "Saved" : (savingImages[index] ? "Saving..." : "Save")}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => router.push('/signup')}
                    title="Sign Up to Save"
                    className="flex flex-col items-center"
                  >
                    <div className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                    </div>
                    <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">Sign Up</span>
                  </button>
                )}
                
                {/* Feedback icons */}
                <div className="flex space-x-2">
                  {/* Like button */}
                  <button
                    onClick={() => provideFeedback(index, true)}
                    title="Good Result"
                    className="flex flex-col items-center"
                  >
                    <div className={`p-2 rounded-full ${
                      feedback[index] === true
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
                      </svg>
                    </div>
                    <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">Like</span>
                  </button>
                  
                  {/* Dislike button */}
                  <button
                    onClick={() => provideFeedback(index, false)}
                    title="Needs Improvement"
                    className="flex flex-col items-center"
                  >
                    <div className={`p-2 rounded-full ${
                      feedback[index] === false
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2"></path>
                      </svg>
                    </div>
                    <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">Dislike</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Save limit indicator for free users */}
      {subscription?.tier === 'free' && (
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>
            {parseInt(process.env.NEXT_PUBLIC_FREE_SAVE_TO_HISTORY_LIMIT || '10') - savedImagesCount} saves remaining in your Free plan.
            <Link href="/pricing" className="ml-1 text-blue-600 hover:underline">Upgrade for more</Link>
          </span>
        </div>
      )}
    </div>
  );
}
