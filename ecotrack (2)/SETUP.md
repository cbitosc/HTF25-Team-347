# EcoTrack Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase

1. Create a Supabase project at [https://app.supabase.com](https://app.supabase.com)
2. Copy `.env.local.example` to `.env.local`
3. Fill in your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your anon/public key

### 3. Initialize Database

Run the SQL scripts in order:

```bash
# 1. Create tables and policies
psql -h <your-db-host> -U postgres -d postgres -f supabase/schema.sql

# 2. Optional: Add seed data
psql -h <your-db-host> -U postgres -d postgres -f supabase/seed.sql
```

Or use the Supabase dashboard SQL editor to run the scripts manually.

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Features Implemented

### ✅ Authentication
- **Sign up** with email, password, name, and role
- **Auto-login** after successful signup
- **Role-based redirection** (citizen → /dashboard, collector → /collector, ngo → /ngo, admin → /admin)
- **Persistent sessions** - stay logged in across page navigation
- **Secure password storage** via Supabase Auth

### ✅ Profile & Settings
- **Profile page** - view and edit name, email, phone, and address
- **Settings page** - manage notifications and change password
- Both pages integrated with Supabase

### ✅ Waste Scheduling
- **Schedule pickup** with waste type selection (Plastic, Metal, E-Waste, Glass, Paper)
- Fixed Select component to properly detect waste type
- Stores pickups in Supabase with status tracking

### ✅ Donations
- **Create donations** to NGOs
- Loads real NGO list from Supabase
- **Auto-reflection in NGO inventory** when donation is accepted
- Full CRUD operations via Supabase

### ✅ Collector Features
- View assigned pickups
- **Earnings tracker** - displays total earnings based on completed pickups ($2.5 per kg)
- Mark pickups as "Picked Up" or "Delivered"
- Map view and route optimization
- Real-time updates via Supabase subscriptions

### ✅ Data Management
- Removed placeholder mail data
- All user data stored in Supabase
- Proper validation for all forms

## User Roles

1. **Citizen** - Schedule pickups, make donations, view dashboard
2. **Collector** - View assigned pickups, track earnings, navigate routes
3. **NGO** - Accept/decline donations, manage inventory
4. **Admin** - Manage all users, pickups, and system analytics

## Testing Flow

### Sign Up Flow
1. Go to `/auth`
2. Click "Sign Up" tab
3. Fill in: Name, Email, Password, Role
4. Submit → Auto-login → Redirect to role-specific dashboard

### Sign In Flow
1. Go to `/auth`
2. Enter email and password
3. Submit → Redirect based on role from database

### Schedule Pickup
1. Sign in as Citizen
2. Navigate to "Schedule Pickup"
3. Select waste type, quantity, address
4. Submit → Pickup created in database

### Make Donation
1. Sign in as Citizen
2. Go to "Donations" → "New Donation"
3. Select NGO, item type, quantity, address
4. Submit → Donation pending in database

### Collector Dashboard
1. Sign in as Collector
2. View assigned pickups
3. See earnings tracker
4. Mark pickups as completed

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` exists and has valid credentials
- Restart dev server after adding/updating env vars

### Authentication not working
- Check that `schema.sql` was run successfully
- Verify RLS policies are enabled in Supabase
- Check browser console for errors

### Waste type not detected
- This has been fixed - waste type now uses controlled component state
- Make sure to select from dropdown before submitting

### Donations not reflecting in NGO inventory
- Donation must be marked as "Accepted" by NGO first
- Check `updateDonation` function in operations.ts

## Project Structure

```
app/
├── auth/page.tsx          # Authentication page
├── dashboard/             # Citizen dashboard
│   ├── donations/         # Donation management
│   └── schedule/          # Pickup scheduling
├── collector/page.tsx     # Collector dashboard
├── ngo/page.tsx          # NGO dashboard
├── profile/page.tsx      # User profile
└── settings/page.tsx     # App settings

lib/
├── auth/
│   └── AuthContext.tsx   # Auth state management
├── supabase/
│   ├── client.ts         # Supabase client
│   └── operations.ts     # Database operations
└── data-store.ts         # Legacy in-memory store

supabase/
├── schema.sql            # Database schema
├── seed.sql             # Sample data
└── cleanup.sql          # Database cleanup
```

## Next Steps

1. Add geocoding for addresses (Google Maps API)
2. Implement email notifications
3. Add photo upload for pickup proof
4. Enhanced analytics dashboard
5. Mobile app version

## Support

For issues or questions, please check:
- Supabase documentation: https://supabase.com/docs
- Next.js documentation: https://nextjs.org/docs
