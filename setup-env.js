// Simple script to verify environment variables are correctly loaded
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Check for .env.local file
const envLocalPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envLocalPath)) {
  console.error('\x1b[31m%s\x1b[0m', '❌ .env.local file not found. Please create one based on the .env.example template.');
  process.exit(1);
}

// Load environment variables
dotenv.config({ path: envLocalPath });

// Check required variables
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'GEMINI_API_KEY'
];

const missing = [];

for (const variable of requiredVars) {
  if (!process.env[variable]) {
    missing.push(variable);
  }
}

if (missing.length > 0) {
  console.error('\x1b[31m%s\x1b[0m', `❌ Missing required environment variables: ${missing.join(', ')}`);
  console.error('Please add them to your .env.local file');
  process.exit(1);
}

console.log('\x1b[32m%s\x1b[0m', '✅ All required environment variables are set!');
process.exit(0);