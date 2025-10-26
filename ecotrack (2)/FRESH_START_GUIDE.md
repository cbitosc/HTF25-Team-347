# Fresh Start Guide - Clean Database Setup

This guide will help you completely reset your EcoTrack database and start fresh with clean demo data.

## 🗑️ Step 1: Purge All Existing Data

1. Open **Supabase Dashboard** → **SQL Editor**
2. Create a new query
3. Copy and paste contents from `supabase/purge-all-data.sql`
4. Click **Run** or press `Ctrl+Enter`
5. Verify output shows all tables have 0 rows

**Or run directly:**

```sql
-- Delete all data in correct order
DELETE FROM ngo_materials;
DELETE FROM ngo_inventory;
DELETE FROM schedules;
DELETE FROM user_stats;
DELETE FROM pickups;
DELETE FROM donations;
DELETE FROM ngos;
DELETE FROM users;

-- Verify empty
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL SELECT 'pickups', COUNT(*) FROM pickups
UNION ALL SELECT 'donations', COUNT(*) FROM donations
UNION ALL SELECT 'ngos', COUNT(*) FROM ngos
UNION ALL SELECT 'user_stats', COUNT(*) FROM user_stats
UNION ALL SELECT 'schedules', COUNT(*) FROM schedules
UNION ALL SELECT 'ngo_inventory', COUNT(*) FROM ngo_inventory
UNION ALL SELECT 'ngo_materials', COUNT(*) FROM ngo_materials;
```

## 🔧 Step 2: Fix Database Configuration

Run `supabase/fix-database-issues.sql`:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set default UUID generation
ALTER TABLE donations 
  ALTER COLUMN id SET DEFAULT uuid_generate_v4();

ALTER TABLE pickups 
  ALTER COLUMN id SET DEFAULT uuid_generate_v4();

ALTER TABLE users 
  ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE pickups;
ALTER PUBLICATION supabase_realtime ADD TABLE donations;
ALTER PUBLICATION supabase_realtime ADD TABLE users;
```

## 👥 Step 3: Create Demo Accounts in Supabase Auth

### Option A: Use Supabase Dashboard UI

1. Go to **Authentication** → **Users** → **Add User**
2. Create these 4 accounts:

| Email | Password | Name |
|-------|----------|------|
| nikhil@ecotrack.com | password123 | Nikhil |
| manideep@ecotrack.com | password123 | Manideep |
| badrinath@ecotrack.com | password123 | Badrinath |
| srishant@ecotrack.com | password123 | Srishant Goutham |

3. **Important:** Copy each user's UUID after creation

### Option B: Use SQL (if you have existing auth.users)

```sql
-- Get existing auth user IDs
SELECT id, email FROM auth.users ORDER BY email;
```

## 📊 Step 4: Insert Demo User Data

Replace `'USER_ID_HERE'` with actual UUIDs from Step 3:

```sql
-- Insert Nikhil (Citizen)
INSERT INTO users (id, name, email, role, address, lat, lng)
VALUES (
  'NIKHIL_AUTH_UUID_HERE',
  'Nikhil',
  'nikhil@ecotrack.com',
  'citizen',
  '123 Green Street, Eco City',
  40.7128,
  -74.0060
);

-- Insert Manideep (Collector)
INSERT INTO users (id, name, email, role, address, lat, lng)
VALUES (
  'MANIDEEP_AUTH_UUID_HERE',
  'Manideep',
  'manideep@ecotrack.com',
  'collector',
  '456 Collection Ave, Eco City',
  40.7580,
  -73.9855
);

-- Insert Badrinath (NGO)
INSERT INTO users (id, name, email, role, address, lat, lng)
VALUES (
  'BADRINATH_AUTH_UUID_HERE',
  'Badrinath',
  'badrinath@ecotrack.com',
  'ngo',
  '789 Charity Road, Eco City',
  40.7489,
  -73.9680
);

-- Insert Srishant Goutham (Admin)
INSERT INTO users (id, name, email, role, address, lat, lng)
VALUES (
  'SRISHANT_AUTH_UUID_HERE',
  'Srishant Goutham',
  'srishant@ecotrack.com',
  'admin',
  '321 Admin Plaza, Eco City',
  40.7614,
  -73.9776
);

-- Create user_stats for citizen
INSERT INTO user_stats (user_id, total_pickups, waste_collected, co2_saved, green_points)
VALUES ('NIKHIL_AUTH_UUID_HERE', 0, 0, 0, 0);

-- Verify insertions
SELECT id, name, email, role FROM users ORDER BY role, name;
```

## 🎯 Step 5: Add Sample NGO

```sql
INSERT INTO ngos (name, email, address, lat, lng, description, accepted_waste_types)
VALUES (
  'Green Earth Foundation',
  'contact@greenearth.org',
  '100 Eco Boulevard, Eco City',
  40.7520,
  -73.9770,
  'Leading environmental NGO focused on recycling and sustainability',
  ARRAY['plastic', 'paper', 'metal', 'glass', 'ewaste']
);
```

## ✅ Step 6: Verify Setup

```sql
-- Check all users exist with correct roles
SELECT name, email, role, created_at FROM users ORDER BY role;

-- Should return:
-- Srishant Goutham | srishant@ecotrack.com | admin
-- Nikhil | nikhil@ecotrack.com | citizen
-- Manideep | manideep@ecotrack.com | collector
-- Badrinath | badrinath@ecotrack.com | ngo

-- Check NGO exists
SELECT * FROM ngos;

-- Check user_stats exists for citizen
SELECT * FROM user_stats;
```

## 🧪 Step 7: Test the Application

### Test 1: Login and Navigation
1. **Open app in incognito mode** (to avoid cache issues)
2. Login as each user and verify correct dashboard appears:
   - Nikhil → Citizen Dashboard
   - Manideep → Collector Dashboard
   - Badrinath → NGO Dashboard
   - Srishant Goutham → Admin Dashboard

### Test 2: Create Donation (Citizen)
1. Login as **Nikhil**
2. Go to `/dashboard/donations`
3. Fill form and submit
4. **Should succeed without errors**
5. Check console - no "null id" errors

### Test 3: View Donation (NGO)
1. Login as **Badrinath**
2. Go to NGO dashboard
3. Should see the donation from Nikhil
4. Try accepting/declining it

### Test 4: Real-time Updates
1. Keep NGO dashboard open
2. In another browser/tab, login as Nikhil
3. Create a new donation
4. **NGO dashboard should update automatically** (may take 1-2 seconds)
5. Should see toast: "New donation received!"

### Test 5: Admin Functions
1. Login as **Srishant Goutham**
2. Visit `/admin`
3. Check stats show real numbers
4. Visit `/admin/users` - see all 4 users
5. Visit `/admin/pickups` - try assigning a collector
6. Visit `/admin/analytics` - verify charts render

## 🐛 Troubleshooting

### Issue: "Cannot read property 'id' of undefined"
**Solution:** Verify auth.users matches users table IDs:
```sql
SELECT 
  au.id as auth_id, 
  au.email as auth_email,
  u.id as user_id,
  u.email as user_email,
  u.role
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
ORDER BY au.email;
```

### Issue: Real-time not working
**Solution:** Run in SQL Editor:
```sql
-- Check realtime is enabled
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```
Should show pickups, donations, and users.

### Issue: "Permission denied" errors
**Solution:** Check RLS policies:
```sql
-- View all policies
SELECT tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Issue: Can't login
**Solution:** 
1. Check Supabase environment variables in `.env.local`
2. Verify auth accounts exist in Supabase Dashboard → Authentication
3. Try password reset

## 📝 Quick Reset Script

Save this as a favorite query in Supabase for quick resets:

```sql
-- DANGER: This deletes everything!
-- Only run when you want to completely reset

TRUNCATE 
  ngo_materials,
  ngo_inventory,
  schedules,
  user_stats,
  pickups,
  donations,
  ngos,
  users
CASCADE;

SELECT 'All tables cleared!' as status;
```

## 🎓 Next Steps After Fresh Start

1. ✅ All 4 demo accounts working
2. ✅ Can create donations without errors
3. ✅ Real-time updates work
4. ✅ Admin pages load with real data
5. ✅ Role-based access working correctly

Now you're ready to develop and test new features! 🚀
