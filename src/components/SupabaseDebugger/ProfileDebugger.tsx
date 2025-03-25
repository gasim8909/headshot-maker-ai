'use client';

import React, { useState, useEffect } from 'react';
import { testGetProfile, testUpdateProfile } from '@/utils/supabaseDebugger';
import { UserProfile } from '@/types/supabase';

const ProfileDebugger = () => {
  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  
  // Form states
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  
  // Results and status
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);
  
  const loadProfile = async () => {
    setIsLoading(true);
    const result = await testGetProfile();
    
    setResults(prev => [{ type: 'getProfile', data: result }, ...prev]);
    
    if (result.success && result.data.profile) {
      const profileData = result.data.profile;
      setProfile(profileData);
      setFullName(profileData.full_name || '');
      setDateOfBirth(profileData.date_of_birth || '');
      setGender(profileData.gender || '');
      setProfileLoaded(true);
    }
    
    setIsLoading(false);
  };
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileLoaded) return;
    
    setIsLoading(true);
    
    const updatedProfileData: Partial<UserProfile> = {
      full_name: fullName,
      date_of_birth: dateOfBirth || undefined,
      gender: gender || undefined
    };
    
    const result = await testUpdateProfile(updatedProfileData);
    setResults(prev => [{ type: 'updateProfile', data: result }, ...prev]);
    
    if (result.success && result.data.updatedProfile) {
      setProfile(result.data.updatedProfile);
    }
    
    setIsLoading(false);
  };
  
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
      <h2 className="text-xl font-bold mb-4">Profile Testing</h2>
      
      {/* Current profile */}
      <div className="mb-6 p-3 bg-gray-100 dark:bg-gray-700 rounded">
        <h3 className="text-lg font-semibold mb-2">Current Profile</h3>
        {profile ? (
          <div>
            <p><span className="font-medium">ID:</span> {profile.id}</p>
            <p><span className="font-medium">User ID:</span> {profile.user_id}</p>
            <p><span className="font-medium">Name:</span> {profile.full_name}</p>
            {profile.date_of_birth && <p><span className="font-medium">Date of Birth:</span> {profile.date_of_birth}</p>}
            {profile.gender && <p><span className="font-medium">Gender:</span> {profile.gender}</p>}
            {/* Access timestamps conditionally since they may not be included in the type */}
            {(profile as any).created_at && <p><span className="font-medium">Created:</span> {new Date((profile as any).created_at).toLocaleString()}</p>}
            {(profile as any).updated_at && <p><span className="font-medium">Updated:</span> {new Date((profile as any).updated_at).toLocaleString()}</p>}
          </div>
        ) : (
          <p className="text-gray-500">
            {isLoading ? 'Loading profile...' : 'No profile loaded or user not logged in'}
          </p>
        )}
        <div className="mt-3">
          <button 
            onClick={loadProfile} 
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            disabled={isLoading}
          >
            Refresh Profile
          </button>
        </div>
      </div>
      
      {/* Update profile form */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Update Profile</h3>
        {!profileLoaded ? (
          <p className="text-gray-500">Please load a profile first or sign in</p>
        ) : (
          <form onSubmit={handleUpdateProfile} className="space-y-3">
            <div>
              <label className="block text-sm font-medium">Full Name</label>
              <input 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                className="w-full p-2 border rounded"
                placeholder="Your Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Date of Birth</label>
              <input 
                type="date" 
                value={dateOfBirth} 
                onChange={(e) => setDateOfBirth(e.target.value)} 
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Gender</label>
              <select 
                value={gender} 
                onChange={(e) => setGender(e.target.value)} 
                className="w-full p-2 border rounded"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
            <button 
              type="submit" 
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        )}
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

export default ProfileDebugger;
