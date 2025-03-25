# Authentication Troubleshooting Guide

This guide addresses common authentication errors in the Headshot Maker AI application, specifically the following errors:

- `Error fetching user profile: {}`
- `Error fetching user subscription: {}`

## Root Cause

These errors typically occur for first-time users when:

1. The required database tables don't exist in your Supabase project
2. The database tables exist but user records are missing
3. Row Level Security (RLS) policies are blocking access to the database tables

## Fixes Implemented

We've already implemented the following fixes to address these issues:

1. Improved error handling in the authentication system
2. Added automatic creation of user profile and subscription records if they don't exist
3. Enhanced database diagnostics to detect issues with table access
4. Created a migration utility script to ensure database tables are properly set up

## How to Resolve

### Step 1: Apply Database Migrations

Run the migration script to ensure your Supabase database has all the required tables:

```bash
node apply-migrations.js
```

This script will:
- Check if your environment is properly configured
- Display a list of available migrations
- Apply the migrations to your Supabase database

You'll need the following environment variables in your `.env.local` file:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (find in Supabase project settings -> API)

### Step 2: Check Browser Console

After applying migrations:

1. Log in to your application
2. Open the browser's developer console (F12 or right-click -> Inspect -> Console)
3. Look for any database-related errors
4. Look for diagnostic messages from the `checkDatabaseSetup` function

### Step 3: Verify Row Level Security (RLS) Policies

If you're still experiencing issues:

1. Go to your Supabase project dashboard
2. Navigate to the Authentication section
3. Check that RLS policies are correctly set up for:
   - `user_profiles` table
   - `user_subscriptions` table
   - `user_headshots` table

Each table should have policies that allow authenticated users to access their own data.

## Technical Details

### Database Tables Required

The application relies on the following database tables:

1. `user_profiles` - Stores user profile information
2. `user_subscriptions` - Stores subscription and credit information
3. `user_headshots` - Stores generated headshot images

### Row Level Security (RLS)

RLS policies in Supabase determine who can read and write data. For this application, users should:

- Be able to read and update their own profiles
- Be able to read and update their own subscriptions
- Be able to create and read their own headshots

If RLS is too restrictive, authentication features will fail.

## Still Having Issues?

If you continue to experience authentication issues after following these steps:

1. Check the browser console for specific error details
2. Verify your Supabase URL and API keys are correct
3. Make sure your Supabase project is properly configured for authentication
4. Consider resetting and recreating your database schema from scratch
