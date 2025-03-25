# Supabase Authentication System for Headshot Maker AI

This directory contains the database schema and configurations for the Supabase authentication system used in the Headshot Maker AI application.

## Overview

The application uses Supabase for:
- User authentication (signup, login, password reset)
- User profile management
- Subscription and credit tracking
- Storing user-generated headshots

## Database Schema

### Tables

1. **user_profiles** - Extends the default Supabase auth.users table with additional user information
   - `id` - UUID, primary key
   - `user_id` - UUID, references auth.users(id)
   - `full_name` - TEXT
   - `date_of_birth` - DATE
   - `gender` - TEXT
   - `created_at` - TIMESTAMP
   - `updated_at` - TIMESTAMP

2. **user_subscriptions** - Tracks user subscription information
   - `id` - UUID, primary key
   - `user_id` - UUID, references auth.users(id)
   - `tier` - TEXT ('guest', 'free', 'premium', 'professional')
   - `credits_remaining` - INTEGER
   - `used_generations` - INTEGER
   - `created_at` - TIMESTAMP
   - `updated_at` - TIMESTAMP

3. **user_headshots** - Stores generated headshots for users
   - `id` - UUID, primary key
   - `user_id` - UUID, references auth.users(id)
   - `image_url` - TEXT, URL to the generated image
   - `original_image_url` - TEXT, URL to the original uploaded image
   - `style` - TEXT, style used for generation
   - `settings` - JSONB, additional settings used for generation
   - `created_at` - TIMESTAMP

## Row Level Security (RLS)

All tables have Row Level Security enabled, with policies that ensure:
- Users can only see and modify their own data
- Admin roles have appropriate access

## Automatic Triggers

The database includes triggers for:
1. Creating a user profile when a new user signs up
2. Creating a default subscription for new users
3. Deducting credits when users generate headshots
4. Updating timestamps when records are modified

## Authentication Flow

1. **Signup**:
   - User creates an account with email/password
   - Triggers create user_profile and user_subscription records
   - User is redirected to signup-success page

2. **Login**:
   - User logs in with email/password
   - Auth state is updated throughout the application

3. **Password Reset**:
   - User requests a password reset
   - An email is sent with a secure link
   - User resets their password using the link

## Integration with Frontend

The frontend integrates with Supabase via:
- `AuthContext` component (`src/contexts/AuthContext.tsx`)
- `ProtectedRoute` component (`src/components/Auth/ProtectedRoute.tsx`)
- Feature access utility (`src/utils/featureAccess.ts`)

## Local Development Setup

1. Start the Supabase local development server:
```bash
npx supabase start
```

2. Apply the migrations:
```bash
npx supabase db reset
```

3. Update your local .env file with the Supabase URL and anon key:
```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
```

## Production Setup

For production deployment:

1. Create a Supabase project at https://supabase.com
2. Run the migrations manually or via CI/CD pipeline
3. Configure the environment variables in your hosting platform:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Admin Functions

For administrative tasks, use the Supabase dashboard or API:
- Manage users
- Update subscription tiers
- Reset credits
- Delete headshot records

## Security Considerations

- All sensitive operations require authenticated users
- Credit deduction occurs server-side to prevent client manipulation
- Password resets use secure, time-limited tokens
- User data is isolated through Row Level Security
