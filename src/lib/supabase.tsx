import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// For client-side code, we need to use NEXT_PUBLIC_ prefixed variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a single supabase client for your entire application
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export typings for better TypeScript support
export type TypedSupabaseClient = SupabaseClient;

export default supabase;
