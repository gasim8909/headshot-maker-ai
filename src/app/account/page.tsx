'use client';

import { useState, FormEvent, ChangeEvent, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserHeadshot } from '@/types/supabase';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import supabase from '@/lib/supabase';

// Tab interface definition
type TabType = 'profile' | 'headshots' | 'subscription';

export default function AccountPage() {
  const { user, profile, subscription, updateProfile, signOut, getUserHeadshots, deleteHeadshot } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [name, setName] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [headshots, setHeadshots] = useState<UserHeadshot[]>([]);
  const [isLoadingHeadshots, setIsLoadingHeadshots] = useState<boolean>(true);
  const [deleteHeadshotId, setDeleteHeadshotId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<boolean>(false);
  const [loadHeadshotsError, setLoadHeadshotsError] = useState<string | null>(null);

  const router = useRouter();

  // Function to render avatar placeholder
  const avatarPlaceholder = () => {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ccircle cx='50' cy='30' r='20' fill='%23d1d1d1'/%3E%3Cpath d='M50,50 C35,50 25,65 20,85 L80,85 C75,65 65,50 50,50 Z' fill='%23d1d1d1'/%3E%3C/svg%3E`;
  };

  // Function to get a public URL for a headshot
  const getHeadshotUrl = (path: string) => {
    // If it's already a full URL, return it
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // If it's a storage path, construct the full URL
    if (path.startsWith('headshots/')) {
      // Get the public URL for this object
      return supabase.storage.from('headshots').getPublicUrl(path.replace('headshots/', '')).data.publicUrl;
    }
    
    // Just return the path as is if we can't determine the format
    return path;
  };

  // Load saved headshots
  const loadHeadshots = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingHeadshots(true);
    setLoadHeadshotsError(null);
    
    // Set a timeout to prevent UI from being stuck in loading state
    const loadingTimeout = setTimeout(() => {
      if (isLoadingHeadshots) {
        setIsLoadingHeadshots(false);
        setLoadHeadshotsError('Loading headshots timed out. Please refresh the page to try again.');
        console.error('Headshots loading timed out');
      }
    }, 10000); // 10 second timeout
    
    try {
      // Get the headshots from the database
      const shots = await getUserHeadshots();
      
      // Ensure headshots have proper URLs
      const processedShots = shots.map(shot => ({
        ...shot,
        // Ensure the image_url is properly formatted
        image_url: getHeadshotUrl(shot.image_url),
        original_image_url: getHeadshotUrl(shot.original_image_url)
      }));
      
      setHeadshots(processedShots);
    } catch (error) {
      console.error('Error loading headshots:', error);
      setLoadHeadshotsError('Failed to load headshots. Please try again later.');
    } finally {
      clearTimeout(loadingTimeout);
      setIsLoadingHeadshots(false);
    }
  }, [user, getUserHeadshots]);
  
  useEffect(() => {
    loadHeadshots();
  }, [loadHeadshots]);
  
  // Handle headshot deletion
  const handleDeleteHeadshot = async () => {
    if (!deleteHeadshotId) return;
    
    setDeleteError(null);
    setDeleteSuccess(false);
    
    try {
      const { success, error } = await deleteHeadshot(deleteHeadshotId);
      
      if (!success) {
        throw error || new Error('Failed to delete headshot');
      }
      
      // Remove the deleted headshot from the state
      setHeadshots(headshots.filter(headshot => headshot.id !== deleteHeadshotId));
      setDeleteSuccess(true);
      
      // Close the confirmation dialog after a short delay
      setTimeout(() => {
        setDeleteConfirmOpen(false);
        setDeleteSuccess(false);
      }, 1500);
      
    } catch (err: any) {
      console.error('Delete headshot error:', err);
      setDeleteError(err.message || 'Error deleting headshot');
    } finally {
      setDeleteHeadshotId(null);
    }
  };
  
  // Open delete confirmation dialog
  const confirmDelete = (headshotId: string) => {
    setDeleteHeadshotId(headshotId);
    setDeleteConfirmOpen(true);
    setDeleteError(null);
    setDeleteSuccess(false);
  };
  
  // Close delete confirmation dialog
  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeleteHeadshotId(null);
    setDeleteError(null);
  };

  // Set initial form values from profile
  useEffect(() => {
    if (profile) {
      setName(profile.full_name || '');
      setDateOfBirth(profile.date_of_birth || '');
      setGender(profile.gender || '');
    }
  }, [profile]);

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);
    
    // Set a timeout to prevent UI from being stuck in saving state
    const saveTimeout = setTimeout(() => {
      if (saving) {
        setSaving(false);
        setError('Save operation timed out. Please try again.');
        console.error('Profile update timed out');
      }
    }, 8000); // 8 second timeout
    
    try {
      console.log('Submitting profile update with:', { name, dateOfBirth, gender });
      
      const { success, error } = await updateProfile({
        full_name: name,
        date_of_birth: dateOfBirth,
        gender
      });

      clearTimeout(saveTimeout); // Clear timeout on success
      
      if (!success) {
        console.error('Profile update failed:', error);
        throw error || new Error('Failed to update profile');
      }
      
      console.log('Profile updated successfully');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // We don't need to reset the form values since useEffect will update them
      // when profile state is updated by the AuthContext
    } catch (err: any) {
      clearTimeout(saveTimeout); // Clear timeout on error
      console.error('Profile update caught error:', err);
      setError(err.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  // Format subscription expiration
  const formatExpirationDate = () => {
    if (!subscription?.updated_at) return 'N/A';
    
    // This is a simplified example, you'd calculate actual expiration based on billing cycle
    const updated = new Date(subscription.updated_at);
    const expiration = new Date(updated);
    expiration.setMonth(expiration.getMonth() + 1); // Assuming monthly billing
    
    return expiration.toLocaleDateString();
  };

  // Handle image errors safely
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    try {
      const target = e.currentTarget;
      // Replace with placeholder without logging to avoid console errors
      target.src = avatarPlaceholder();
      target.classList.add('bg-gray-100');
    } catch (err) {
      // Silent catch - avoid any console errors
    }
  };

  return (
    <ProtectedRoute>
      <div className="ai-container py-12">
        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
          <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`inline-block p-4 rounded-t-lg ${
                  activeTab === 'profile'
                    ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-500 dark:border-primary-500'
                    : 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 border-b-2 border-transparent'
                }`}
              >
                Profile
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('headshots')}
                className={`inline-block p-4 rounded-t-lg ${
                  activeTab === 'headshots'
                    ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-500 dark:border-primary-500'
                    : 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 border-b-2 border-transparent'
                }`}
              >
                Headshots
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('subscription')}
                className={`inline-block p-4 rounded-t-lg ${
                  activeTab === 'subscription'
                    ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-500 dark:border-primary-500'
                    : 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 border-b-2 border-transparent'
                }`}
              >
                Subscription
              </button>
            </li>
          </ul>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="ai-card">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Your Profile</h2>
              
              {error && (
                <div className="mb-4 p-3 ai-badge-error">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-4 p-3 ai-badge-success">
                  Profile updated successfully!
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="ai-label" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={user?.email || user?.id || ''}
                    disabled
                    className="ai-input bg-gray-50 dark:bg-gray-800"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Email cannot be changed
                  </p>
                </div>
                
                <div className="mb-4">
                  <label className="ai-label" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    required
                    className="ai-input"
                    placeholder="Your name"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="ai-label" htmlFor="date-of-birth">
                    Date of Birth
                  </label>
                  <input
                    id="date-of-birth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setDateOfBirth(e.target.value)}
                    className="ai-input"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="ai-label" htmlFor="gender">
                    Gender
                  </label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setGender(e.target.value)}
                    className="ai-input"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
                
                <div className="flex justify-between items-center">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`ai-button-primary flex items-center justify-center min-w-[120px] ${
                      saving ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {saving ? (
                      <>
                        <span className="inline-block h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                        Saving...
                      </>
                    ) : success ? (
                      'Saved ✓'
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="ai-button-outline-error"
                  >
                    Sign Out
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Headshots Tab */}
          {activeTab === 'headshots' && (
            <div className="ai-card">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Your Headshots</h2>
              
              {deleteSuccess && (
                <div className="mb-4 p-3 ai-badge-success">
                  Headshot deleted successfully!
                </div>
              )}
              
              {deleteError && (
                <div className="mb-4 p-3 ai-badge-error">
                  {deleteError}
                </div>
              )}
              
              {loadHeadshotsError && (
                <div className="mb-4 p-3 ai-badge-error">
                  {loadHeadshotsError}
                  <button 
                    onClick={loadHeadshots}
                    className="ml-2 underline font-medium"
                  >
                    Try Again
                  </button>
                </div>
              )}
              
              {/* Delete Confirmation Dialog */}
              {deleteConfirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                      Delete Headshot
                    </h3>
                    <p className="mb-6 text-gray-600 dark:text-gray-300">
                      Are you sure you want to delete this headshot? This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={cancelDelete}
                        className="ai-button-outline"
                        disabled={deleteSuccess}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteHeadshot}
                        className="ai-button-error"
                        disabled={deleteSuccess}
                      >
                        {deleteSuccess ? 'Deleted!' : 'Delete Headshot'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {isLoadingHeadshots ? (
                <div className="text-center py-12">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 animate-pulse mx-auto"></div>
                  <p className="mt-4 text-gray-500 dark:text-gray-400">Loading your headshots...</p>
                </div>
              ) : headshots.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">You haven't created any headshots yet.</p>
                  <Link href="/create">
                    <button className="mt-4 ai-button-primary">
                      Create Your First Headshot
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {headshots.map((headshot) => (
                    <div key={headshot.id} className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-soft-sm hover:shadow-soft-md transition-all duration-300">
                      <div className="aspect-square relative overflow-hidden group">
                        <img 
                          src={headshot.image_url}
                          alt="Headshot" 
                          className="w-full h-full object-cover"
                          onError={handleImageError}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => confirmDelete(headshot.id)}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
                            aria-label="Delete headshot"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="p-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="font-medium text-gray-900 dark:text-white capitalize">
                          {headshot.style || 'Custom'} Style
                        </div>
                        <div className="flex justify-between">
                          <span>{new Date(headshot.created_at).toLocaleDateString()}</span>
                          <button
                            onClick={() => confirmDelete(headshot.id)}
                            className="text-red-500 hover:text-red-600"
                            aria-label="Delete headshot"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {headshots.length > 0 && (
                <div className="mt-6 text-center">
                  <Link href="/create">
                    <button className="ai-button-primary">
                      Create New Headshot
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <div className="ai-card">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Your Subscription</h2>
              
              <div className="mb-6 p-5 rounded-lg bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/30 border border-primary-200 dark:border-primary-800/50">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-xl font-bold text-primary-700 dark:text-primary-300 capitalize">
                    {subscription?.tier || 'Free'} Plan
                  </div>
                  {subscription?.tier !== 'free' && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Renews: {formatExpirationDate()}
                    </div>
                  )}
                </div>
                
                <div className="mb-1 flex justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Credits Remaining</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {subscription?.credits_remaining || 0}/{getGenerationLimit(subscription?.tier)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-4">
                  <div className="bg-primary-600 h-2.5 rounded-full" style={{ 
                    width: getProgressWidth(subscription?.tier, subscription?.credits_remaining)
                  }}></div>
                </div>
                
                <div className="text-center">
                  {subscription?.tier === 'free' ? (
                    <Link href="/pricing">
                      <button className="ai-button-primary w-full">
                        Upgrade Plan
                      </button>
                    </Link>
                  ) : (
                    <Link href="/pricing">
                      <button className="ai-button-outline w-full">
                        Manage Subscription
                      </button>
                    </Link>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Account Summary</h3>
                  <div className="text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-gray-600 dark:text-gray-400">Member since:</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </div>
                      
                      <div className="text-gray-600 dark:text-gray-400">Email:</div>
                      <div className="font-medium text-gray-900 dark:text-white text-ellipsis overflow-hidden">
                        {user?.email || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Usage Statistics</h3>
                  <div className="text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-gray-600 dark:text-gray-400">Headshots Created:</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {headshots.length}
                      </div>
                      
                      <div className="text-gray-600 dark:text-gray-400">Credits Used:</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {subscription?.used_generations || 0}
                      </div>
                      
                      <div className="text-gray-600 dark:text-gray-400">Last Activity:</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {headshots.length > 0 
                          ? new Date(headshots[0].created_at).toLocaleDateString() 
                          : 'No activity yet'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {subscription?.tier === 'free' && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Why Upgrade?</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>Get more credits for headshot generation</li>
                    <li>Access to more professional styles</li>
                    <li>Higher resolution outputs</li>
                    <li>Priority support</li>
                  </ul>
                  <div className="mt-4 text-center">
                    <Link href="/pricing">
                      <button className="ai-button-outline">
                        View Plans
                      </button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

// Helper function to calculate the progress bar width
function getProgressWidth(tier?: string, remaining?: number): string {
  if (tier === 'professional') {
    return '100%';
  }
  
  const max = tier === 'premium' ? 30 : 5; // 30 for premium, 5 for free
  const used = max - (remaining || 0);
  const percentage = Math.min(100, (used / max) * 100);
  
  return `${percentage}%`;
}

// Helper function to get generation limit based on tier
function getGenerationLimit(tier?: string): string {
  switch (tier) {
    case 'professional':
      return 'Unlimited';
    case 'premium':
      return '30';
    default:
      return '5';
  }
}
