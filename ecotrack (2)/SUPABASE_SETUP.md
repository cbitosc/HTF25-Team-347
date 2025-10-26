# Supabase Integration Setup Guide

This guide will help you set up Supabase for real-time data synchronization across all user types.

## Prerequisites

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new project in your Supabase dashboard

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** > **API**
3. Copy the following values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

## Step 2: Configure Environment Variables

1. Create a `.env.local` file in the root of your project
2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important:** Never commit `.env.local` to version control!

## Step 3: Set Up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/schema.sql` file
4. Paste it into the SQL Editor and click **Run**

This will create all necessary tables:
- `users` - User accounts with roles
- `user_stats` - Citizen statistics (pickups, waste collected, points)
- `pickups` - Waste collection requests and their status
- `donations` - Donations to NGOs
- `ngos` - NGO organizations
- `ngo_inventory` - NGO inventory tracking
- `schedules` - Recurring pickup schedules

## Step 4: Enable Realtime

1. Go to **Database** > **Replication** in your Supabase dashboard
2. Enable realtime for the following tables:
   - ✅ `pickups`
   - ✅ `donations`
   - ✅ `user_stats`
   - ✅ `ngos`
   - ✅ `ngo_inventory`

This enables real-time synchronization across all user types!

## Step 5: (Optional) Seed Initial Data

You can add some initial test data through the Supabase **Table Editor** or by running SQL commands:

### Add an NGO:
```sql
INSERT INTO ngos (id, name, email, address, lat, lng, description, accepted_waste_types)
VALUES (
  'NGO-001',
  'Green Earth Foundation',
  'contact@greenearth.org',
  '100 Recycling Center Blvd',
  51.515,
  -0.12,
  'Dedicated to sustainable waste management',
  ARRAY['Plastic', 'Metal', 'E-Waste', 'Paper', 'Glass']
);
```

### Add a test user:
```sql
INSERT INTO users (name, email, role, address, lat, lng)
VALUES (
  'Test Citizen',
  'test@example.com',
  'citizen',
  '123 Test Street',
  51.505,
  -0.09
);
```

## How Real-Time Sync Works

### Collector marks pickup as "Delivered"
1. Collector updates pickup status in `pickups` table
2. **Real-time event fires** to all subscribed clients
3. Citizen's dashboard **automatically updates** to show "Delivered" status
4. Citizen's `user_stats` table **automatically increments** stats
5. Admin dashboard **automatically reflects** the change

### NGO accepts a donation
1. NGO updates donation status to "Accepted"
2. **Real-time event fires** to all subscribed clients  
3. Citizen sees their donation status change **instantly**
4. Admin can see the update in their analytics **in real-time**

## Features Enabled

✅ **Real-time status updates** - Changes sync instantly across all users
✅ **Automatic stats calculation** - User stats update when pickups are completed
✅ **Cross-user visibility** - Collectors, citizens, NGOs, and admins stay in sync
✅ **Persistent data** - All data stored in PostgreSQL database
✅ **Scalable** - Handles multiple concurrent users

## Testing the Integration

1. Start your development server: `pnpm dev`
2. Open multiple browser tabs with different user roles
3. Make a change in one tab (e.g., collector marks pickup as delivered)
4. Watch the change appear **instantly** in other tabs!

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure `.env.local` exists and contains both variables
- Restart your development server after creating `.env.local`

### Real-time updates not working
- Verify realtime is enabled for tables in Supabase dashboard
- Check browser console for connection errors
- Ensure Row Level Security policies allow your operations

### Database queries failing
- Verify the schema was created successfully
- Check Supabase logs in the dashboard
- Ensure your anon key has proper permissions

## Next Steps

- Set up proper authentication with Supabase Auth
- Customize Row Level Security policies for production
- Add file upload for photo proofs using Supabase Storage
- Configure email notifications using Supabase Functions

## Support

For issues or questions:
- Check Supabase documentation: [https://supabase.com/docs](https://supabase.com/docs)
- Review the code in `lib/supabase/operations.ts` for implementation details
