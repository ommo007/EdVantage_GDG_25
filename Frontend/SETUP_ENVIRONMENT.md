# Environment Setup for CSV Import

## Overview

The CSV Import feature now uses the regular Supabase client with the anon key and `signUp()` method, as recommended by the Supabase documentation. No special service role key is required!

## Required Environment Variables

The CSV import functionality works with the existing Supabase configuration. If you don't have a `.env.local` file, you can create one, but it's optional since the configuration is already in `supabaseClient.js`.

**Optional `.env.local` file** in the `Frontend` directory:

```env
# Supabase Configuration (Optional - already configured in supabaseClient.js)
VITE_SUPABASE_URL=https://fsztxvlitgukjqrxabmg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzenR4dmxpdGd1a2pxcnhhYm1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MjE4NTAsImV4cCI6MjA1ODk5Nzg1MH0.dR4UHKsT5Wj67e3iJ_VaC5OjJq99O8rv_bUxEfverDw
```

## How It Works

The CSV import now uses:
- **Regular Supabase client** with anon key (already configured)
- **`supabase.auth.signUp()`** method for creating users
- **No admin privileges required** - works with standard Supabase permissions

## Supabase Project Settings

Make sure your Supabase project has the correct settings:

1. **Go to your Supabase Dashboard**
   - Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Check Authentication Settings**
   - Go to Authentication → Settings
   - **Disable "Confirm email"** if you want users to be immediately active
   - Or **Enable "Confirm email"** if you want users to verify their email first

3. **Row Level Security (RLS)**
   - Ensure your `profiles` table has appropriate RLS policies
   - Or temporarily disable RLS for testing

## Testing the Setup

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open the CSV Import modal** in the Division Dashboard

3. **Click "Test Connection"** to verify your setup

4. **Check the browser console** for detailed logging information

## Troubleshooting

### "Failed to fetch" Error
- Check that your Supabase project URL is correct in `supabaseClient.js`
- Verify your Supabase project is active and accessible
- Check browser network tab for specific error details

### "User already registered" Error
- This is normal if you try to import the same email twice
- Supabase prevents duplicate email addresses

### Connection Test Fails
- Open browser developer tools and check the Console tab
- Look for detailed error messages
- Verify your Supabase project is accessible

### Email Confirmation Issues
- If "Confirm email" is enabled, users will need to verify their email
- For testing, you can disable email confirmation in Supabase settings
- Check your Supabase email templates and SMTP settings

## Database Schema Requirements

Ensure your `profiles` table has the following columns:
- `user_id` (UUID, references auth.users)
- `email` (text)
- `role_id` (integer, 3 for students)
- `division_id` (integer)
- `display_name` (text)
- `created_at` (timestamp)

## Security Notes

- Uses standard Supabase authentication flow
- No admin keys required
- Follows Supabase best practices
- Works with Row Level Security (RLS) policies

## Support

If you continue to have issues:
1. Check the browser console for detailed error messages
2. Verify your Supabase project configuration
3. Test with a single user first before bulk import
4. Check Supabase dashboard for any error logs 