# Supabase Troubleshooting Guide

This guide helps troubleshoot common issues with Supabase connections in the Headshot Maker AI application.

## Quick Diagnostic Steps

1. **Visit the Debug Console**: Navigate to `/debug-supabase` in your application
2. **Test Connection**: Click the "Test Connection" button to check basic connectivity
3. **Run Advanced Diagnostics**: Use the "Advanced API Diagnostics" button for more detailed information

## Understanding Connection Failures

If you're seeing a connection error on the debug page, here are common causes and solutions:

### 1. Project Status Issues

**Symptoms**: 
- Timeout errors 
- Empty error messages
- Connection test shows a red dot

**Possible Causes**:
- The Supabase project might be paused
- The project might be in a sleep state (free tier limitation)
- The project might be under maintenance

**Solutions**:
- Visit your [Supabase dashboard](https://supabase.com/dashboard) to check if your project is active
- Restart the project if it's paused
- Upgrade to a paid tier if you're experiencing sleep mode issues

### 2. Environment Variable Issues

**Symptoms**:
- Authentication errors
- "Invalid API key" errors
- Missing URL errors

**Solutions**:
- Check that your `.env.local` file contains the correct Supabase URL and anon key
- Make sure the environment variables are properly formatted and have no extra spaces
- Verify that the keys match those in your Supabase dashboard
- Restart your development server after changing environment variables

### 3. Database Table Issues

**Symptoms**:
- "Table does not exist" errors
- RLS policy errors
- Permissions errors

**Solutions**:
- Run the migrations to create required tables:
  ```bash
  node apply-migrations.js
  ```
- Check RLS (Row Level Security) policies in your Supabase dashboard
- Verify that the anonymous role has appropriate permissions for the tables

### 4. Network Issues

**Symptoms**:
- Timeouts
- Intermittent connection problems
- CORS errors

**Solutions**:
- Check your internet connection
- Disable VPNs or proxies that might be interfering
- Clear browser cache and cookies
- Try a different browser

## Using the Advanced Diagnostic Tools

The debug console includes several advanced tools:

1. **Test Connection**: Basic connectivity test.
2. **Run Full Diagnostics**: Tests auth, session, and database operations.
3. **Advanced API Diagnostics**: Performs server-side diagnostics that can identify issues not visible from the client.

The Advanced API Diagnostics provides particularly useful information:

- **Health Check**: Tests basic Supabase API connectivity
- **Table Access**: Verifies database table access
- **Response Time**: Checks for timeout issues
- **Environment Configuration**: Confirms environment variables are available

## Common Error Codes

- **42P01**: Table does not exist. Run migrations to create tables.
- **3D000**: Database not found. Check your Supabase project settings.
- **28P01**: Invalid API key. Verify your environment variables.
- **CORS errors**: Check your Supabase project's API settings and allowed origins.

## Getting Additional Help

If you've tried the steps above and are still experiencing issues:

1. Check the Supabase status page at [status.supabase.com](https://status.supabase.com)
2. Consult the [Supabase documentation](https://supabase.com/docs)
3. Search for similar issues on [GitHub](https://github.com/supabase/supabase/issues)
