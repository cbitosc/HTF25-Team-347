# Demo Accounts Setup

This guide will help you set up 4 demo accounts in Supabase that share real-time data.

## Demo Accounts

- **Nikhil** (Citizen) - `nikhil@demo.com` / `demo123`
- **Manideep** (Collector) - `manideep@demo.com` / `demo123`
- **Badrinath** (NGO) - `badrinath@demo.com` / `demo123`
- **Srishant Goutham** (Admin) - `srishant@demo.com` / `demo123`

## Setup Method 1: Using the Script (Recommended)

1. **Get your Supabase Service Role Key:**
   - Go to https://app.supabase.com
   - Select your project
   - Go to Settings > API
   - Copy the "service_role" key (keep this secret!)

2. **Add the service role key to `.env.local`:**
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

3. **Install dotenv if needed:**
   ```bash
   npm install dotenv
   ```

4. **Run the setup script:**
   ```bash
   node scripts/create-demo-accounts.js
   ```

The script will create all 4 accounts and initial demo data automatically!

## Setup Method 2: Manual Creation via Supabase Dashboard

1. **Go to your Supabase Dashboard:**
   https://app.supabase.com/project/wjozfcgsdyufgpzczgnh

2. **Create Auth Users:**
   - Navigate to Authentication > Users
   - Click "Add user" for each account:
     - Email: `nikhil@demo.com`, Password: `demo123`
     - Email: `manideep@demo.com`, Password: `demo123`
     - Email: `badrinath@demo.com`, Password: `demo123`
     - Email: `srishant@demo.com`, Password: `demo123`

3. **Create User Profiles:**
   - Go to Table Editor > users table
   - For each auth user created, add a row with:
     - `id`: Copy the UUID from auth.users
     - `email`: Same as auth user
     - `name`: Nikhil / Manideep / Badrinath / Srishant Goutham
     - `role`: citizen / collector / ngo / admin

4. **Run the SQL script (Optional):**
   - Go to SQL Editor
   - Open `supabase/setup-demo-accounts.sql`
   - Run it to create profiles and sample data

## How Data is Shared

All demo accounts read from and write to the same Supabase database:

- **Nikhil (Citizen)** schedules pickups → **Manideep (Collector)** sees them in real-time
- **Nikhil (Citizen)** makes donations → **Badrinath (NGO)** receives them
- **Srishant (Admin)** monitors all activity from all users

## Testing the Integration

1. **Sign in as Nikhil** (`nikhil@demo.com`)
   - Schedule a waste pickup
   - Make a donation to an NGO

2. **Sign in as Manideep** (`manideep@demo.com`)
   - See Nikhil's pickup request
   - Mark it as collected

3. **Sign in as Badrinath** (`badrinath@demo.com`)
   - See donation from Nikhil

4. **Sign in as Srishant** (`srishant@demo.com`)
   - View all pickups and donations
   - Monitor system-wide activity

## Troubleshooting

### "Invalid credentials" error
- Make sure you've created the accounts in Supabase
- Check that the password is exactly `demo123`
- Run the setup script or manually create accounts

### "Refresh token not found" error
- Clear your browser's localStorage
- Run in console: `localStorage.clear(); location.reload();`

### Profile data not showing
- Make sure the `users` table has entries for each auth user
- The `id` in users table must match the UUID in auth.users
- Check that `role` field is set correctly
