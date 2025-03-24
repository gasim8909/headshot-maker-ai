// Type definitions for Supabase related data

import { SupabaseClient, Session, User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  full_name: string;
  email?: string;
  // Add other user fields as needed
}

export interface UserSubscription {
  user_id: string;
  tier: 'guest' | 'free' | 'premium' | 'professional';
  used_generations: number;
}

export type SupabaseAuthResponse = {
  data: {
    user: User | null;
    session: Session | null;
  };
  error: Error | null;
};

export type SupabaseQueryResponse<T> = {
  data: T | null;
  error: Error | null;
};
