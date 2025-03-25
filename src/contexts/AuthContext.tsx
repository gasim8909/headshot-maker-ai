'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { UserProfile, UserSubscription, UserHeadshot } from '@/types/supabase';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  subscription: UserSubscription | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<{ success: boolean; error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: Error | null }>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error: Error | null }>;
  resetPassword: (password: string) => Promise<{ success: boolean; error: Error | null }>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<{ success: boolean; error: Error | null }>;
  
  // Credit management
  getUserCredits: () => number;
  checkCreditAvailability: () => boolean;
  deductCredit: () => Promise<boolean>;
  
  // Headshot management
  saveHeadshot: (imageUrl: string, originalUrl: string, style: string, settings: Record<string, any>) => Promise<string | null>;
  getUserHeadshots: () => Promise<UserHeadshot[]>;
  deleteHeadshot: (headshotId: string) => Promise<{ success: boolean; error: Error | null }>;
  
  // Diagnostics
  checkDatabaseSetup: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Initialize and set up auth state listener
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);

        if (currentSession?.user) {
          setUser(currentSession.user);
          await fetchUserProfile(currentSession.user.id);
          await fetchUserSubscription(currentSession.user.id);
        }
      } catch (error) {
        console.error('Error in fetchUserData:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();

    // Set up auth state change listener
    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        try {
          console.log('Auth state changed:', event);
          
          // Skip USER_UPDATED events to prevent unnecessary re-renders
          if (event === 'USER_UPDATED') {
            console.log('Skipping USER_UPDATED event to prevent state thrashing');
            return;
          }

          setSession(newSession);
          setUser(newSession?.user || null);

          if (newSession?.user) {
            await fetchUserProfile(newSession.user.id);
            await fetchUserSubscription(newSession.user.id);
          } else {
            setProfile(null);
            setSubscription(null);
          }
        } catch (error) {
          console.error('Error in auth state change handler:', error);
        } finally {
          setIsLoading(false);
        }
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  // Fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        
        // Check if error is because the record doesn't exist
        if (error.code === 'PGRST116' || error.message?.includes('found no rows')) {
          console.log('Creating missing user profile for first-time user');
          await createUserProfile(userId);
          return;
        }
        return;
      }

      setProfile(data);
    } catch (err) {
      console.error('Exception in fetchUserProfile:', err);
    }
  };

  // Create user profile if it doesn't exist
  const createUserProfile = async (userId: string) => {
    try {
      // Get user data from auth
      const { data: userData } = await supabase.auth.getUser();
      const fullName = userData.user?.user_metadata?.full_name || '';
      
      // Create profile record
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          full_name: fullName,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating profile:', error);
        return;
      }
      
      setProfile(data);
    } catch (err) {
      console.error('Exception in createUserProfile:', err);
    }
  };

  // Fetch user subscription data
  const fetchUserSubscription = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user subscription:', error);
        
        // Check if error is because the record doesn't exist
        if (error.code === 'PGRST116' || error.message?.includes('found no rows')) {
          console.log('Creating missing user subscription for first-time user');
          await createUserSubscription(userId);
          return;
        }
        return;
      }

      setSubscription(data);
    } catch (err) {
      console.error('Exception in fetchUserSubscription:', err);
    }
  };

  // Create user subscription if it doesn't exist
  const createUserSubscription = async (userId: string) => {
    try {
      // Create free tier subscription
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          tier: 'free',
          credits_remaining: 3,
          used_generations: 0
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating subscription:', error);
        return;
      }
      
      setSubscription(data);
    } catch (err) {
      console.error('Exception in createUserSubscription:', err);
    }
  };

  // Sign up a new user
  const signUp = async (
    email: string, 
    password: string, 
    userData: Partial<UserProfile>
  ) => {
    try {
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name
          }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('Failed to create user account');

      // Create profile record
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: data.user.id,
          full_name: userData.full_name,
          date_of_birth: userData.date_of_birth || null,
          gender: userData.gender || '',
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }

      // Create subscription record (free tier)
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: data.user.id,
          tier: 'free',
          credits_remaining: 3, // Starting credits for free tier
          used_generations: 0
        });

      if (subscriptionError) {
        console.error('Error creating subscription:', subscriptionError);
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error as Error };
    }
  };

  // Create required tables as a last resort fallback
  const createRequiredTables = async () => {
    console.log('🚨 Attempting to create required tables as last resort...');
    
    try {
      // Create the user_profiles table
      const createProfilesResult = await supabase.rpc('execute_sql', {
        sql: `CREATE TABLE IF NOT EXISTS public.user_profiles (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          full_name TEXT NOT NULL,
          date_of_birth DATE,
          gender TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          UNIQUE(user_id)
        );`
      });
      
      if (createProfilesResult.error) {
        console.error('❌ Failed to create user_profiles table:', createProfilesResult.error);
      } else {
        console.log('✅ user_profiles table created or already exists');
      }
      
      // Create the user_subscriptions table
      const createSubscriptionsResult = await supabase.rpc('execute_sql', {
        sql: `CREATE TABLE IF NOT EXISTS public.user_subscriptions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          tier TEXT NOT NULL DEFAULT 'free',
          credits_remaining INTEGER NOT NULL DEFAULT 3,
          used_generations INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          UNIQUE(user_id)
        );`
      });
      
      if (createSubscriptionsResult.error) {
        console.error('❌ Failed to create user_subscriptions table:', createSubscriptionsResult.error);
      } else {
        console.log('✅ user_subscriptions table created or already exists');
      }
      
      // Create the user_headshots table
      const createHeadshotsResult = await supabase.rpc('execute_sql', {
        sql: `CREATE TABLE IF NOT EXISTS public.user_headshots (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          image_url TEXT NOT NULL,
          original_image_url TEXT NOT NULL,
          style TEXT NOT NULL,
          settings JSONB NOT NULL DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );`
      });
      
      if (createHeadshotsResult.error) {
        console.error('❌ Failed to create user_headshots table:', createHeadshotsResult.error);
      } else {
        console.log('✅ user_headshots table created or already exists');
      }
      
      // Add basic RLS policies
      const addRlsPoliciesResult = await supabase.rpc('execute_sql', {
        sql: `
          -- Enable RLS on all tables
          ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;
          ALTER TABLE IF EXISTS public.user_subscriptions ENABLE ROW LEVEL SECURITY;
          ALTER TABLE IF EXISTS public.user_headshots ENABLE ROW LEVEL SECURITY;
          
          -- Create basic RLS policies for user_profiles
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can view their own profile'
            ) THEN
              CREATE POLICY "Users can view their own profile" ON public.user_profiles
                FOR SELECT USING (auth.uid() = user_id);
            END IF;
            
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can update their own profile'
            ) THEN
              CREATE POLICY "Users can update their own profile" ON public.user_profiles
                FOR UPDATE USING (auth.uid() = user_id);
            END IF;
            
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can insert their own profile'
            ) THEN
              CREATE POLICY "Users can insert their own profile" ON public.user_profiles
                FOR INSERT WITH CHECK (auth.uid() = user_id);
            END IF;
            
            -- Create basic RLS policies for user_subscriptions
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies WHERE tablename = 'user_subscriptions' AND policyname = 'Users can view their own subscription'
            ) THEN
              CREATE POLICY "Users can view their own subscription" ON public.user_subscriptions
                FOR SELECT USING (auth.uid() = user_id);
            END IF;
            
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies WHERE tablename = 'user_subscriptions' AND policyname = 'Users can update their own subscription'
            ) THEN
              CREATE POLICY "Users can update their own subscription" ON public.user_subscriptions
                FOR UPDATE USING (auth.uid() = user_id);
            END IF;
            
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies WHERE tablename = 'user_subscriptions' AND policyname = 'Users can insert their own subscription'
            ) THEN
              CREATE POLICY "Users can insert their own subscription" ON public.user_subscriptions
                FOR INSERT WITH CHECK (auth.uid() = user_id);
            END IF;
            
            -- Create basic RLS policies for user_headshots
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies WHERE tablename = 'user_headshots' AND policyname = 'Users can view their own headshots'
            ) THEN
              CREATE POLICY "Users can view their own headshots" ON public.user_headshots
                FOR SELECT USING (auth.uid() = user_id);
            END IF;
            
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies WHERE tablename = 'user_headshots' AND policyname = 'Users can insert their own headshots'
            ) THEN
              CREATE POLICY "Users can insert their own headshots" ON public.user_headshots
                FOR INSERT WITH CHECK (auth.uid() = user_id);
            END IF;
          END
          $$;
        `
      });
      
      if (addRlsPoliciesResult.error) {
        console.error('❌ Failed to add RLS policies:', addRlsPoliciesResult.error);
      } else {
        console.log('✅ Basic RLS policies added or already exist');
      }
      
      return true;
    } catch (error) {
      console.error('Exception when creating tables:', error);
      return false;
    }
  };

  // Handle database initialization issues with progressive fallbacks
  const handleDatabaseIssues = async (userId: string) => {
    console.log('🔍 Attempting to diagnose and fix database issues...');
    
    // Step 1: Check if tables exist and we can access them
    const profilesResult = await supabase.from('user_profiles').select('count(*)');
    const subscriptionsResult = await supabase.from('user_subscriptions').select('count(*)');
    const headshotsResult = await supabase.from('user_headshots').select('count(*)');
    
    const allTablesAccessible = !profilesResult.error && !subscriptionsResult.error && !headshotsResult.error;
    
    if (allTablesAccessible) {
      console.log('✅ All tables are accessible. Creating user records...');
      
      // Create user records if not exist
      try {
        // Check if profile exists, create if needed
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('user_id', userId)
          .single();
          
        if (profileError || !profileData) {
          console.log('Profile not found, creating one...');
          await createUserProfile(userId);
        }
        
        // Check if subscription exists, create if needed
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .select('id')
          .eq('user_id', userId)
          .single();
          
        if (subscriptionError || !subscriptionData) {
          console.log('Subscription not found, creating one...');
          await createUserSubscription(userId);
        }
        
        return true;
      } catch (err) {
        console.error('Error ensuring user records exist:', err);
      }
    } else {
      console.log('❌ Some tables are not accessible. Attempting to create required tables...');
      return await createRequiredTables();
    }
    
    return false;
  };

  // Sign in existing user
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Run database check - this helps diagnose issues for first-time users
      await checkDatabaseSetup();
      
      // For first-time logins, handle database setup issues
      if (data.user) {
        await handleDatabaseIssues(data.user.id);
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error as Error };
    }
  };

  // Sign out user
  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Reset password request
  const forgotPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, error: error as Error };
    }
  };

  // Update password with reset token
  const resetPassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password
      });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: error as Error };
    }
  };

  // Update user profile
  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) {
      console.error('Update profile failed: User not authenticated');
      return { success: false, error: new Error('User not authenticated') };
    }

    try {
      const startTime = Date.now();
      console.log('Starting profile update at:', new Date().toISOString());
      console.log('Updating profile with data:', profileData);
      console.log('Current user ID:', user.id);
      
      // Verify session is still valid
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        console.error('Session verification failed: No active session found');
        return { success: false, error: new Error('Session expired') };
      }
      
      // Prepare update data with proper formatting
      const updateData: any = {
        ...profileData,
        updated_at: new Date().toISOString() // Force updated_at to refresh
      };
      
      // Extra validation for date_of_birth - ensure it's a valid date string or null
      if (profileData.date_of_birth === '') {
        updateData.date_of_birth = null;
      }
      
      console.log('Formatted update data:', updateData);
      
      // Update auth metadata if name changed
      if (profileData.full_name) {
        console.log('Updating auth user metadata with full_name:', profileData.full_name);
        const { error: authUpdateError } = await supabase.auth.updateUser({
          data: { full_name: profileData.full_name }
        });
        
        if (authUpdateError) {
          console.error('Error updating auth metadata:', {
            name: authUpdateError.name,
            message: authUpdateError.message,
            status: authUpdateError.status,
            fullError: JSON.stringify(authUpdateError)
          });
          // Continue with profile update even if auth metadata update fails
        } else {
          console.log('Successfully updated auth user metadata');
        }
      }

      // First check if profile exists
      console.log('Checking if profile exists for user_id:', user.id);
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (checkError) {
        console.error('Error checking existing profile:', checkError);
        // If profile doesn't exist, create it
        if (checkError.code === 'PGRST116' || checkError.message?.includes('found no rows')) {
          console.log('Profile not found, creating a new one...');
          const { data: newProfileData, error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: user.id,
              ...updateData
            })
            .select()
            .single();
          
          if (insertError) {
            console.error('Error creating profile:', insertError);
            throw insertError;
          }
          
          console.log('New profile created:', newProfileData);
          setProfile(newProfileData);
          return { success: true, error: null };
        } else {
          throw checkError;
        }
      }
      
      // Profile exists, proceed with update
      console.log('Profile exists, updating record in user_profiles table');
      
      // Log the actual SQL query (as close as we can get)
      console.log(`Executing equivalent to: UPDATE user_profiles SET ${
        Object.entries(updateData).map(([key, value]) => 
          `${key} = ${value === null ? 'NULL' : JSON.stringify(value)}`
        ).join(', ')
      } WHERE user_id = '${user.id}'`);
      
      // Update profile record
      console.log('Executing profile update query with:', {
        table: 'user_profiles',
        updateData,
        userId: user.id
      });
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('user_id', user.id)
        .select();

      if (error) {
        const endTime = Date.now();
        console.error('Profile update failed after', (endTime - startTime), 'ms');
        console.error('Error updating profile in database:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          fullError: JSON.stringify(error)
        });
        
        // Check if this might be an RLS violation
        if (error.code === '42501') {
          console.error('Possible RLS policy violation detected');
          // Verify RLS policies
          await checkDatabaseSetup();
        }
        
        throw error;
      } else {
        console.log('Profile update query completed successfully');
        console.log('Returned data:', data);
        
          // Verify the update was actually applied
          const { data: verifyData, error: verifyError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (verifyError) {
            console.error('Error verifying profile update:', verifyError);
          } else {
            console.log('Verified profile data:', verifyData);
            // Check if the update was actually applied for each field
            const updateApplied = Object.entries(updateData).every(([key, value]) => {
              // Special handling for date fields
              if (key === 'date_of_birth') {
                const dbValue = verifyData[key];
                const expectedValue = value;
                
                console.log(`Verifying date_of_birth - DB: ${dbValue} (${typeof dbValue}), Expected: ${expectedValue} (${typeof expectedValue})`);
                
                // Handle various date format cases
                if (dbValue === expectedValue) return true;
                if (!dbValue && !expectedValue) return true;
                
                try {
                  // Handle cases where either value is null/undefined
                  if (!dbValue && !expectedValue) return true;
                  if (!dbValue || !expectedValue) return false;
                  
                  // Ensure we have valid date strings or Date objects
                  const isValidDbValue = typeof dbValue === 'string' || dbValue instanceof Date;
                  const isValidExpectedValue = typeof expectedValue === 'string' || expectedValue instanceof Date;
                  
                  if (!isValidDbValue || !isValidExpectedValue) {
                    console.error('Invalid date values for comparison:', {
                      dbValue,
                      expectedValue,
                      dbValueType: typeof dbValue,
                      expectedValueType: typeof expectedValue
                    });
                    return false;
                  }
                  
                  // Convert to ISO date strings (YYYY-MM-DD) for comparison
                  const dbDate = new Date(dbValue).toISOString().split('T')[0];
                  const expectedDate = new Date(expectedValue).toISOString().split('T')[0];
                  return dbDate === expectedDate;
                } catch (e) {
                  console.error('Date comparison error:', e, {
                    dbValue,
                    expectedValue,
                    dbValueType: typeof dbValue,
                    expectedValueType: typeof expectedValue
                  });
                  return false;
                }
              }
              
              // For other fields, do direct comparison
              console.log(`Verifying ${key} - DB: ${verifyData[key]}, Expected: ${value}`);
              return verifyData[key] === value;
            });
            
            if (!updateApplied) {
              console.log('Warning: Strict update verification failed');
              console.log('Expected:', JSON.stringify(updateData, null, 2));
              console.log('Actual:', JSON.stringify(verifyData, null, 2));
              
              // Perform a more lenient check - just make sure the important fields were updated
              const importantFieldsUpdated = profileData.full_name === verifyData.full_name && 
                                           (profileData.gender === verifyData.gender || profileData.gender === undefined) &&
                                           (profileData.date_of_birth === verifyData.date_of_birth || profileData.date_of_birth === undefined);
              
              if (!importantFieldsUpdated) {
                console.error('Important fields were not updated correctly');
                throw new Error('Profile update verification failed - important changes not applied');
              } else {
                console.log('Lenient verification passed - important fields were updated');
              }
            } else {
              console.log('Update successfully verified in database');
            }
          }
      }

      const endTime = Date.now();
      console.log('Profile updated successfully in', (endTime - startTime), 'ms');
      console.log('Returned data:', data);

      // Update the local profile state with the returned data
      if (data && data.length > 0) {
        console.log('Updating local profile state with returned data');
        setProfile(data[0]);
      } else {
        // If no data returned (which shouldn't happen), fetch fresh profile data
        console.log('No data returned, refreshing profile data from database');
        await fetchUserProfile(user.id);
      }
      
      // Double-check that the data was saved by fetching it again after a short delay
      setTimeout(async () => {
        const { data: verifyData, error: verifyError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (verifyError) {
          console.error('Error verifying profile update:', verifyError);
        } else {
          console.log('Profile verification data:', verifyData);
        }
      }, 500);

      return { success: true, error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error as Error };
    }
  };

  // Get user's available credits
  const getUserCredits = () => {
    return subscription?.credits_remaining || 0;
  };

  // Check if user has available credits
  const checkCreditAvailability = () => {
    return (subscription?.credits_remaining || 0) > 0;
  };

  // Deduct one credit for a generation
  const deductCredit = async () => {
    if (!user || !subscription) {
      return false;
    }

    if (subscription.credits_remaining <= 0) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          credits_remaining: subscription.credits_remaining - 1,
          used_generations: subscription.used_generations + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deducting credit:', error);
        return false;
      }

      // Update local state
      setSubscription({
        ...subscription,
        credits_remaining: subscription.credits_remaining - 1,
        used_generations: subscription.used_generations + 1,
        updated_at: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Deduct credit error:', error);
      return false;
    }
  };

  // Save a generated headshot
  const saveHeadshot = async (
    imageUrl: string,
    originalUrl: string,
    style: string,
    settings: Record<string, any>
  ) => {
    if (!user) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('user_headshots')
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          original_image_url: originalUrl,
          style: style,
          settings: settings,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error saving headshot:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Save headshot error:', error);
      return null;
    }
  };

  // Get user's saved headshots
  const getUserHeadshots = async () => {
    if (!user) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('user_headshots')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching headshots:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get headshots error:', error);
      return [];
    }
  };

  // Delete a headshot
  const deleteHeadshot = async (headshotId: string) => {
    if (!user) {
      return { success: false, error: new Error('User not authenticated') };
    }

    try {
      const { error } = await supabase
        .from('user_headshots')
        .delete()
        .eq('id', headshotId)
        .eq('user_id', user.id);  // Extra safety to ensure user owns the headshot

      if (error) {
        console.error('Error deleting headshot:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Delete headshot error:', error);
      return { success: false, error: error as Error };
    }
  };

  // Diagnostic helper to check database setup
  const checkDatabaseSetup = async () => {
    try {
      console.log('Running database setup check...');
      
      // Check if user_profiles table exists and is accessible
      const profilesResult = await supabase
        .from('user_profiles')
        .select('count(*)')
        .limit(1);
      
      if (profilesResult.error) {
        console.error('Error accessing user_profiles table:', {
          code: profilesResult.error.code,
          message: profilesResult.error.message,
          details: profilesResult.error.details,
          hint: profilesResult.error.hint,
          fullError: JSON.stringify(profilesResult.error)
        });
      } else {
        console.log('✅ user_profiles table exists and is accessible');
      }

      // Check if user_subscriptions table exists and is accessible
      const subscriptionsResult = await supabase
        .from('user_subscriptions')
        .select('count(*)')
        .limit(1);
      
      if (subscriptionsResult.error) {
        console.error('Error accessing user_subscriptions table:', {
          code: subscriptionsResult.error.code,
          message: subscriptionsResult.error.message,
          details: subscriptionsResult.error.details,
          hint: subscriptionsResult.error.hint,
          fullError: JSON.stringify(subscriptionsResult.error)
        });
      } else {
        console.log('✅ user_subscriptions table exists and is accessible');
      }

      // Check if user_headshots table exists and is accessible
      const headshotsResult = await supabase
        .from('user_headshots')
        .select('count(*)')
        .limit(1);
      
      if (headshotsResult.error) {
        console.error('Error accessing user_headshots table:', {
          code: headshotsResult.error.code,
          message: headshotsResult.error.message,
          details: headshotsResult.error.details,
          hint: headshotsResult.error.hint,
          fullError: JSON.stringify(headshotsResult.error)
        });
      } else {
        console.log('✅ user_headshots table exists and is accessible');
      }

      // If all tables failed to access, check if tables exist at all
      if (profilesResult.error && subscriptionsResult.error && headshotsResult.error) {
        console.log('⚠️ All table checks failed. This suggests database setup issues or permissions problems.');
        
        // Try to list tables to see if they exist (may also fail due to permissions)
        try {
          const { data, error } = await supabase.rpc('list_tables');
          if (error) {
            console.error('❌ Could not list tables:', error);
          } else {
            console.log('Available tables:', data);
          }
        } catch (err) {
          console.error('❌ Exception when trying to list tables:', err);
        }
      }

      console.log('Database check complete');
    } catch (error) {
      console.error('Error running database check:', error);
    }
  };

  const value = {
    user,
    profile,
    subscription,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    forgotPassword,
    resetPassword,
    updateProfile,
    getUserCredits,
    checkCreditAvailability,
    deductCredit,
    saveHeadshot,
    getUserHeadshots,
    deleteHeadshot,
    checkDatabaseSetup
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
