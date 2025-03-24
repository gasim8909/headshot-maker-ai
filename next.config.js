/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable environment variables
    env: {
      // Supabase credentials
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      
      // Stripe
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      
      // App configuration
      NEXT_PUBLIC_MAX_UPLOAD_SIZE: process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE,
      
      // Tier limits
      NEXT_PUBLIC_GUEST_TIER_LIMIT: process.env.NEXT_PUBLIC_GUEST_TIER_LIMIT,
      NEXT_PUBLIC_FREE_TIER_LIMIT: process.env.NEXT_PUBLIC_FREE_TIER_LIMIT,
      NEXT_PUBLIC_PREMIUM_TIER_LIMIT: process.env.NEXT_PUBLIC_PREMIUM_TIER_LIMIT,
      
      // Style permissions
      NEXT_PUBLIC_GUEST_ALLOWED_STYLES: process.env.NEXT_PUBLIC_GUEST_ALLOWED_STYLES,
      NEXT_PUBLIC_FREE_ALLOWED_STYLES: process.env.NEXT_PUBLIC_FREE_ALLOWED_STYLES,
      NEXT_PUBLIC_PREMIUM_ALLOWED_STYLES: process.env.NEXT_PUBLIC_PREMIUM_ALLOWED_STYLES,
      
      // Custom style access
      NEXT_PUBLIC_GUEST_CUSTOM_STYLE: process.env.NEXT_PUBLIC_GUEST_CUSTOM_STYLE,
      NEXT_PUBLIC_FREE_CUSTOM_STYLE: process.env.NEXT_PUBLIC_FREE_CUSTOM_STYLE,
      NEXT_PUBLIC_PREMIUM_CUSTOM_STYLE: process.env.NEXT_PUBLIC_PREMIUM_CUSTOM_STYLE,
      NEXT_PUBLIC_PROFESSIONAL_CUSTOM_STYLE: process.env.NEXT_PUBLIC_PROFESSIONAL_CUSTOM_STYLE,
      
      // Quantity limits
      NEXT_PUBLIC_GUEST_MAX_QUANTITY: process.env.NEXT_PUBLIC_GUEST_MAX_QUANTITY,
      NEXT_PUBLIC_FREE_MAX_QUANTITY: process.env.NEXT_PUBLIC_FREE_MAX_QUANTITY,
      NEXT_PUBLIC_PREMIUM_MAX_QUANTITY: process.env.NEXT_PUBLIC_PREMIUM_MAX_QUANTITY,
      NEXT_PUBLIC_PROFESSIONAL_MAX_QUANTITY: process.env.NEXT_PUBLIC_PROFESSIONAL_MAX_QUANTITY,
      
      // Advanced settings
      NEXT_PUBLIC_GUEST_ADVANCED_SETTINGS: process.env.NEXT_PUBLIC_GUEST_ADVANCED_SETTINGS,
      NEXT_PUBLIC_FREE_ADVANCED_SETTINGS: process.env.NEXT_PUBLIC_FREE_ADVANCED_SETTINGS,
      NEXT_PUBLIC_PREMIUM_ADVANCED_SETTINGS: process.env.NEXT_PUBLIC_PREMIUM_ADVANCED_SETTINGS,
      NEXT_PUBLIC_PROFESSIONAL_ADVANCED_SETTINGS: process.env.NEXT_PUBLIC_PROFESSIONAL_ADVANCED_SETTINGS,
      NEXT_PUBLIC_FREE_ADVANCED_SETTINGS_ALLOWED: process.env.NEXT_PUBLIC_FREE_ADVANCED_SETTINGS_ALLOWED,
      
      // History features
      NEXT_PUBLIC_GUEST_SAVE_TO_HISTORY: process.env.NEXT_PUBLIC_GUEST_SAVE_TO_HISTORY,
      NEXT_PUBLIC_FREE_SAVE_TO_HISTORY: process.env.NEXT_PUBLIC_FREE_SAVE_TO_HISTORY, 
      NEXT_PUBLIC_PREMIUM_SAVE_TO_HISTORY: process.env.NEXT_PUBLIC_PREMIUM_SAVE_TO_HISTORY,
      NEXT_PUBLIC_PROFESSIONAL_SAVE_TO_HISTORY: process.env.NEXT_PUBLIC_PROFESSIONAL_SAVE_TO_HISTORY,
      NEXT_PUBLIC_FREE_SAVE_TO_HISTORY_LIMIT: process.env.NEXT_PUBLIC_FREE_SAVE_TO_HISTORY_LIMIT
    },
    // Image configuration
    images: {
      remotePatterns: [
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '',
          pathname: '/**',
        }
      ],
      unoptimized: true,
    },
  // Other Next.js config options
  reactStrictMode: true,
  // Move optimizeFonts to top level (out of experimental)
  optimizeFonts: true,
  // Fix for Turbopack font loading issues
  experimental: {
    // Configure Turbopack to work with font loading
    turbo: {
      resolveAlias: {
        // Tell Turbopack to use the standard Next.js font loader
        '@vercel/turbopack-next/internal/font/google/font': '@next/font/google',
      },
    },
    // Configure font loaders
    fontLoaders: [
      { loader: '@next/font/google', options: { subsets: ['latin'] } },
    ],
  },
  };
  
  module.exports = nextConfig;
