# Supabase Table Migration Instructions

Since we're experiencing issues with the Supabase CLI, here's how to manually migrate the tables to your Supabase project using the web interface.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in to your account
2. Click "New Project" and set up your project with a name (e.g., "Headshot Maker AI")
3. Choose a strong database password (save it securely)
4. Choose your region (closest to your users)
5. Wait for your project to be created (might take a few minutes)

## Step 2: Get Your API Keys

1. Once your project is created, go to the project dashboard
2. Click on "Settings" in the sidebar (gear icon at the bottom)
3. Click on "API" in the submenu
4. You'll find your project URL and anon key
5. Add these to your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Step 3: Migrate Database Tables

1. In your Supabase project dashboard, click on "SQL Editor" in the sidebar
2. Create a new query (click "+ New Query")
3. Copy and paste the contents of each SQL migration file in the following order:

### Migration 1: Create Profiles Table

Copy the contents of `supabase/migrations/01_create_profiles_table.sql`

### Migration 2: Create Subscriptions Table

Copy the contents of `supabase/migrations/02_create_subscriptions_table.sql`

### Migration 3: Create Headshots Table 

Copy the contents of `supabase/migrations/03_create_headshots_table.sql`

4. Run each query by selecting all the text and clicking the "Run" button
5. Verify each migration was successful by checking the "Table Editor" section in the sidebar

## Step 4: Configure Storage

1. In your Supabase project dashboard, click on "Storage" in the sidebar
2. Create a new bucket named "headshots"
3. Set the bucket access level to "Private"
4. Create storage policies to allow authenticated users to access their own files:

### Create Upload Policy

1. Go to the "Policies" tab
2. Click "Add Policies" or "New Policy"
3. Choose a template (usually "Authenticated users can upload files")
4. Set a policy name (e.g., "Allow authenticated uploads")
5. For the USING expression, use:
```sql
auth.uid() = request.auth.uid
```
6. Save the policy

### Create Download Policy

1. Again, click "Add Policies" or "New Policy"
2. Choose a template for downloads (usually "Authenticated users can download files")
3. Set a policy name (e.g., "Allow authenticated downloads")
4. For the USING expression, use:
```sql
auth.uid() = owner
```
5. Save the policy

## Step 5: Configure Authentication

1. In your Supabase project dashboard, click on "Authentication" in the sidebar
2. Go to "Providers" and ensure "Email" is enabled
3. Under "Email Templates", customize the templates for:
   - Confirmation
   - Invitation
   - Magic Link
   - Reset Password 
   - Change Email

## Step 6: Test Your Implementation

1. Restart your Next.js application with the updated environment variables
2. Test user signup, login, and password reset flows
3. Verify the profile, subscription, and headshot tables are created correctly

## Troubleshooting

If you encounter any issues:

1. Check the SQL error messages carefully
2. Ensure all tables and policies are created correctly
3. Verify your environment variables are set correctly
4. Check the Supabase project logs for any errors
