/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable environment variables
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    // Configure image domains if needed
    images: {
      domains: ['localhost'],
    },
    // Other Next.js config options
    reactStrictMode: true,
  };
  
  module.exports = nextConfig;