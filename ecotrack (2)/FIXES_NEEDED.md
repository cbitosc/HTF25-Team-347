# EcoTrack Fixes Needed

## Immediate Fix Applied
✅ Fixed donations page build error by adding `'use client'` directive

## Supabase Database Setup Required

### 1. Create Missing Tables

You need to create these tables in Supabase (go to Table Editor):

#### `donations` table
```sql
CREATE TABLE donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_id UUID REFERENCES users(id),
  donor_name TEXT,
  ngo_id UUID REFERENCES users(id),
  item TEXT,
  quantity NUMERIC DEFAULT 0,
  address TEXT,
  lat NUMERIC DEFAULT 0,
  lng NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `ngo_materials` table (for logging materials received)
```sql
CREATE TABLE ngo_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ngo_id UUID REFERENCES users(id),
  material_type TEXT,
  weight NUMERIC,
  source TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Enable Row Level Security (RLS)

For each table, enable RLS and add these policies:

```sql
-- Allow users to read their own data
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their donations" ON donations
  FOR SELECT USING (donor_id = auth.uid() OR ngo_id = auth.uid());

CREATE POLICY "Users can create donations" ON donations
  FOR INSERT WITH CHECK (donor_id = auth.uid());

ALTER TABLE ngo_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "NGOs can manage their materials" ON ngo_materials
  FOR ALL USING (ngo_id = auth.uid());
```

### 3. Update Pickups Table

Ensure your `pickups` table has these columns:
- `collector_id` UUID (nullable, references users)
- `collector_name` TEXT (nullable)

```sql
ALTER TABLE pickups ADD COLUMN IF NOT EXISTS collector_id UUID REFERENCES users(id);
ALTER TABLE pickups ADD COLUMN IF NOT EXISTS collector_name TEXT;
```

## Code Fixes Summary

### Admin Pages (404 Errors)

**Missing Files:**
1. `app/admin/pickups/page.tsx` - Monitor all pickups
2. `app/admin/settings/page.tsx` - System settings

These need to be created to show real-time data from Supabase.

### Collector Page Issues

**Fix needed in:** `app/collector/page.tsx`
- Query pickups WHERE status = 'pending' OR collector_id = current_user_id
- Add real-time update for status changes
- Implement "Update Status" button to modify pickup.status in Supabase

**Missing Files:**
1. `app/collector/assigned/page.tsx` - View assigned pickups
2. `app/collector/route/page.tsx` - Route optimization view

### NGO Page Issues

**Fix needed in:** `app/ngo/page.tsx`
- Query donations WHERE ngo_id = current_user_id
- Fix NGO data fetching from users table (currently failing)
- Implement materials logging to save to `ngo_materials` table

### Citizen Dashboard Issues

**Fix needed in:** `app/dashboard/user/page.tsx`
- Replace mock waste statistics with real queries from pickups table
- Show user's actual pickup history and totals

## Next Steps for You

1. **Run the SQL commands above** in Supabase SQL Editor to create missing tables
2. **Enable RLS policies** for data security
3. **Verify demo accounts exist** in Authentication > Users
4. Let me know when tables are created, and I'll update all the pages to use real data

## What's Already Working

✅ Demo accounts created (Nikhil, Manideep, Badrinath, Srishant)
✅ Authentication flow with Supabase
✅ Donations page fixed (build error resolved)
✅ Basic pickups table structure

## Quick Test After Fixes

1. Sign in as **Nikhil** (citizen)
   - Schedule a pickup → should appear in database
   - Make a donation → should save to donations table

2. Sign in as **Manideep** (collector)
   - See Nikhil's pickups in real-time
   - Update pickup status

3. Sign in as **Badrinath** (NGO)
   - See donations directed to NGO
   - Log received materials

4. Sign in as **Srishant** (admin)
   - View all pickups, donations, users
   - See real-time statistics
