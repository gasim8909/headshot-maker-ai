import supabase, { TypedSupabaseClient } from '@/lib/supabase';
import { UserProfile, UserSubscription, UserHeadshot } from '@/types/supabase';

// Get environment variables from the lib/supabase.tsx file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Custom error interface to include originalError
interface ExtendedError extends Error {
  originalError?: unknown;
}

/**
 * Supabase Debugger - A comprehensive utility for testing Supabase functionality
 * 
 * This utility provides functions to test all aspects of Supabase integration:
 * - Authentication (signup, login, logout, password reset)
 * - Data operations on all tables (create, read, update, delete)
 * - Session management
 * - Error handling and debugging
 */

// Debug logger
export const logDebug = (area: string, action: string, data: any, error?: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    area,
    action,
    data,
    ...(error && { error: error.message || JSON.stringify(error) }),
    success: !error
  };
  
  console.log(`[Supabase Debug] ${timestamp} - ${area}/${action} - ${error ? 'ERROR' : 'SUCCESS'}`);
  console.log(logEntry);
  
  return logEntry;
};

// ============= AUTH TESTING =============

export const testSignUp = async (email: string, password: string, fullName: string) => {
  try {
    const startTime = performance.now();
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    
    const endTime = performance.now();
    
    return logDebug('Auth', 'SignUp', {
      email,
      user: data.user,
      session: data.session,
      duration: `${(endTime - startTime).toFixed(2)}ms`
    }, error);
  } catch (err) {
    return logDebug('Auth', 'SignUp', { email }, err);
  }
};

export const testSignIn = async (email: string, password: string) => {
  try {
    const startTime = performance.now();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    const endTime = performance.now();
    
    return logDebug('Auth', 'SignIn', {
      email,
      user: data.user,
      session: data.session,
      duration: `${(endTime - startTime).toFixed(2)}ms`
    }, error);
  } catch (err) {
    return logDebug('Auth', 'SignIn', { email }, err);
  }
};

export const testSignOut = async () => {
  try {
    const startTime = performance.now();
    
    const { error } = await supabase.auth.signOut();
    
    const endTime = performance.now();
    
    return logDebug('Auth', 'SignOut', {
      duration: `${(endTime - startTime).toFixed(2)}ms`
    }, error);
  } catch (err) {
    return logDebug('Auth', 'SignOut', {}, err);
  }
};

export const testPasswordReset = async (email: string) => {
  try {
    const startTime = performance.now();
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    const endTime = performance.now();
    
    return logDebug('Auth', 'PasswordReset', {
      email,
      data,
      duration: `${(endTime - startTime).toFixed(2)}ms`
    }, error);
  } catch (err) {
    return logDebug('Auth', 'PasswordReset', { email }, err);
  }
};

export const testGetSession = async () => {
  try {
    const startTime = performance.now();
    
    const { data, error } = await supabase.auth.getSession();
    
    const endTime = performance.now();
    
    return logDebug('Auth', 'GetSession', {
      session: data.session,
      duration: `${(endTime - startTime).toFixed(2)}ms`
    }, error);
  } catch (err) {
    return logDebug('Auth', 'GetSession', {}, err);
  }
};

export const testGetUser = async () => {
  try {
    const startTime = performance.now();
    
    const { data, error } = await supabase.auth.getUser();
    
    const endTime = performance.now();
    
    return logDebug('Auth', 'GetUser', {
      user: data.user,
      duration: `${(endTime - startTime).toFixed(2)}ms`
    }, error);
  } catch (err) {
    return logDebug('Auth', 'GetUser', {}, err);
  }
};

// ============= PROFILE TESTING =============

export const testGetProfile = async (userId?: string) => {
  try {
    // Get current user if userId not provided
    let currentUserId = userId;
    if (!currentUserId) {
      const { data: userData } = await supabase.auth.getUser();
      currentUserId = userData.user?.id;
      if (!currentUserId) {
        throw new Error('No user logged in and no userId provided');
      }
    }
    
    const startTime = performance.now();
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', currentUserId)
      .single();
    
    const endTime = performance.now();
    
    return logDebug('Profile', 'GetProfile', {
      userId: currentUserId,
      profile: data,
      duration: `${(endTime - startTime).toFixed(2)}ms`
    }, error);
  } catch (err) {
    return logDebug('Profile', 'GetProfile', { userId }, err);
  }
};

export const testUpdateProfile = async (profileData: Partial<UserProfile>) => {
  try {
    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      throw new Error('No user logged in');
    }
    
    const startTime = performance.now();
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update(profileData)
      .eq('user_id', userId)
      .select()
      .single();
    
    const endTime = performance.now();
    
    return logDebug('Profile', 'UpdateProfile', {
      userId,
      updatedData: profileData,
      updatedProfile: data,
      duration: `${(endTime - startTime).toFixed(2)}ms`
    }, error);
  } catch (err) {
    return logDebug('Profile', 'UpdateProfile', { profileData }, err);
  }
};

// ============= SUBSCRIPTION TESTING =============

export const testGetSubscription = async (userId?: string) => {
  try {
    // Get current user if userId not provided
    let currentUserId = userId;
    if (!currentUserId) {
      const { data: userData } = await supabase.auth.getUser();
      currentUserId = userData.user?.id;
      if (!currentUserId) {
        throw new Error('No user logged in and no userId provided');
      }
    }
    
    const startTime = performance.now();
    
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', currentUserId)
      .single();
    
    const endTime = performance.now();
    
    return logDebug('Subscription', 'GetSubscription', {
      userId: currentUserId,
      subscription: data,
      duration: `${(endTime - startTime).toFixed(2)}ms`
    }, error);
  } catch (err) {
    return logDebug('Subscription', 'GetSubscription', { userId }, err);
  }
};

export const testUpdateSubscription = async (subscriptionData: Partial<UserSubscription>) => {
  try {
    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      throw new Error('No user logged in');
    }
    
    const startTime = performance.now();
    
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update(subscriptionData)
      .eq('user_id', userId)
      .select()
      .single();
    
    const endTime = performance.now();
    
    return logDebug('Subscription', 'UpdateSubscription', {
      userId,
      updatedData: subscriptionData,
      updatedSubscription: data,
      duration: `${(endTime - startTime).toFixed(2)}ms`
    }, error);
  } catch (err) {
    return logDebug('Subscription', 'UpdateSubscription', { subscriptionData }, err);
  }
};

// ============= HEADSHOT TESTING =============

export const testListHeadshots = async (userId?: string, limit = 10) => {
  try {
    // Get current user if userId not provided
    let currentUserId = userId;
    if (!currentUserId) {
      const { data: userData } = await supabase.auth.getUser();
      currentUserId = userData.user?.id;
      if (!currentUserId) {
        throw new Error('No user logged in and no userId provided');
      }
    }
    
    const startTime = performance.now();
    
    const { data, error } = await supabase
      .from('user_headshots')
      .select('*')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    const endTime = performance.now();
    
    return logDebug('Headshot', 'ListHeadshots', {
      userId: currentUserId,
      headshots: data,
      count: data?.length || 0,
      duration: `${(endTime - startTime).toFixed(2)}ms`
    }, error);
  } catch (err) {
    return logDebug('Headshot', 'ListHeadshots', { userId, limit }, err);
  }
};

export const testCreateHeadshot = async (headshotData: Partial<UserHeadshot>) => {
  try {
    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      throw new Error('No user logged in');
    }
    
    // Merge with required data
    const fullHeadshotData = {
      user_id: userId,
      image_url: headshotData.image_url || 'https://example.com/test-image.jpg',
      original_image_url: headshotData.original_image_url || 'https://example.com/original-test-image.jpg',
      style: headshotData.style || 'test',
      settings: headshotData.settings || {}
    };
    
    const startTime = performance.now();
    
    const { data, error } = await supabase
      .from('user_headshots')
      .insert(fullHeadshotData)
      .select()
      .single();
    
    const endTime = performance.now();
    
    return logDebug('Headshot', 'CreateHeadshot', {
      userId,
      headshotData: fullHeadshotData,
      createdHeadshot: data,
      duration: `${(endTime - startTime).toFixed(2)}ms`
    }, error);
  } catch (err) {
    return logDebug('Headshot', 'CreateHeadshot', { headshotData }, err);
  }
};

export const testDeleteHeadshot = async (headshotId: string) => {
  try {
    const startTime = performance.now();
    
    const { data, error } = await supabase
      .from('user_headshots')
      .delete()
      .eq('id', headshotId)
      .select()
      .single();
    
    const endTime = performance.now();
    
    return logDebug('Headshot', 'DeleteHeadshot', {
      headshotId,
      deletedHeadshot: data,
      duration: `${(endTime - startTime).toFixed(2)}ms`
    }, error);
  } catch (err) {
    return logDebug('Headshot', 'DeleteHeadshot', { headshotId }, err);
  }
};

// ============= RAW QUERY TESTING =============

export const testExecuteRawQuery = async (table: string, query: string, params: any[] = []) => {
  try {
    const startTime = performance.now();
    
    // For safety, only allow SELECT queries through this interface
    if (!query.trim().toLowerCase().startsWith('select')) {
      throw new Error('Only SELECT queries are allowed through this interface');
    }
    
    const { data, error } = await supabase.rpc('execute_query', {
      table_name: table,
      query_text: query,
      query_params: params
    });
    
    const endTime = performance.now();
    
    return logDebug('RawQuery', 'ExecuteQuery', {
      table,
      query,
      params,
      results: data,
      duration: `${(endTime - startTime).toFixed(2)}ms`
    }, error);
  } catch (err) {
    return logDebug('RawQuery', 'ExecuteQuery', { table, query, params }, err);
  }
};

// ============= CONNECTION TESTING =============

export const testConnection = async () => {
  try {
    const startTime = performance.now();
    
    // Add a timeout controller to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      // Attempt a simple ping query with a timeout
      const result = await Promise.race([
        supabase.from('user_profiles').select('count(*)', { count: 'exact', head: true }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Connection timed out after 5 seconds')), 5000)
        )
      ]);
      
      // TypeScript needs explicit typing of the result
      const { data, error } = result;
      
      clearTimeout(timeoutId);
      
      const endTime = performance.now();
      const connectionTime = endTime - startTime;
      
      // Handle specific error cases
      if (error) {
        if (error.code === '42P01') {
          error.message = `Table "user_profiles" does not exist. Run migrations to create the table.`;
        } else if (error.code === '3D000') {
          error.message = `Database not found. Check your Supabase project settings.`;
        } else if (error.code === '28P01') {
          error.message = `Invalid API key. Check your Supabase credentials.`;
        } else if (!error.message) {
          error.message = `Unknown error occurred. Status: ${error.code || 'unknown'}`;
        }
      }
      
      return logDebug('Connection', 'TestConnection', {
        connected: !error,
        responseTime: `${connectionTime.toFixed(2)}ms`,
        count: data,
        projectUrl: supabaseUrl,
        apiKeyPrefix: supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + '...' : 'Missing API key',
      }, error);
    } catch (raceError) {
      clearTimeout(timeoutId);
      throw raceError;
    }
  } catch (err) {
      const errorObj = err as Error;
      const isTimeout = errorObj.message && errorObj.message.includes('timed out');
      const friendlyMessage = isTimeout 
        ? 'Connection timed out. Your Supabase project might be paused or under heavy load.'
        : errorObj.message || 'Unknown connection error';
        
      const modifiedErr = new Error(friendlyMessage) as ExtendedError;
      modifiedErr.originalError = err;
    
    return logDebug('Connection', 'TestConnection', {
      projectUrl: supabaseUrl,
      apiKeyPrefix: supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + '...' : 'Missing API key',
    }, modifiedErr);
  }
};

// ============= COMPREHENSIVE TESTS =============

export const runFullDiagnostic = async () => {
  const results = {
    connection: await testConnection(),
    auth: {
      session: await testGetSession(),
      user: await testGetUser()
    },
    data: {}
  };
  
  // If user is logged in, test data operations
  if (results.auth.user.success && results.auth.user.data.user) {
    const userId = results.auth.user.data.user.id;
    results.data = {
      profile: await testGetProfile(userId),
      subscription: await testGetSubscription(userId),
      headshots: await testListHeadshots(userId, 5)
    };
  }
  
  console.log('[Supabase Debugger] Full diagnostic complete:', results);
  return results;
};
