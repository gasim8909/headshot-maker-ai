// Type definitions for Supabase related data

import { SupabaseClient, Session, User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  date_of_birth: string; // ISO format date
  gender: string;
  email?: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  tier: 'guest' | 'free' | 'premium' | 'professional';
  credits_remaining: number;
  used_generations: number;
  created_at: string;
  updated_at: string;
}

export interface UserHeadshot {
  id: string;
  user_id: string;
  image_url: string;
  original_image_url: string;
  style: string;
  settings: Record<string, any>;
  created_at: string;
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
