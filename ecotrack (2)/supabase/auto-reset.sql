-- ============================================
-- AUTOMATIC RESET WITH EXISTING ACCOUNTS
-- ============================================
-- This script automatically maps existing auth accounts to users table
-- No manual ID copy-paste needed!
-- ============================================

-- STEP 1: Purge all existing data
DELETE FROM ngo_materials;
DELETE FROM ngo_inventory;
DELETE FROM schedules;
DELETE FROM user_stats;
DELETE FROM pickups;
DELETE FROM donations;
DELETE FROM ngos;
DELETE FROM users;

SELECT '✅ All data purged' as status;

-- STEP 2: Auto-insert users from existing auth accounts
-- This automatically uses the correct IDs from auth.users

-- Insert Nikhil (Citizen)
INSERT INTO users (id, name, email, role, address, lat, lng)
SELECT 
  id,
  'Nikhil',
  email,
  'citizen',
  '123 Green Street, Eco City',
  40.7128,
  -74.0060
FROM auth.users 
WHERE email = 'nikhil@demo.com';

-- Insert Manideep (Collector)
INSERT INTO users (id, name, email, role, address, lat, lng)
SELECT 
  id,
  'Manideep',
  email,
  'collector',
  '456 Collection Ave, Eco City',
  40.7580,
  -73.9855
FROM auth.users 
WHERE email = 'manideep@demo.com';

-- Insert Badrinath (NGO)
INSERT INTO users (id, name, email, role, address, lat, lng)
SELECT 
  id,
  'Badrinath',
  email,
  'ngo',
  '789 Charity Road, Eco City',
  40.7489,
  -73.9680
FROM auth.users 
WHERE email = 'badrinath@demo.com';

-- Insert Srishant (Admin)
INSERT INTO users (id, name, email, role, address, lat, lng)
SELECT 
  id,
  'Srishant Goutham',
  email,
  'admin',
  '321 Admin Plaza, Eco City',
  40.7614,
  -73.9776
FROM auth.users 
WHERE email = 'srishant@demo.com';

SELECT '✅ Users created' as status;

-- STEP 3: Create user_stats for citizen
INSERT INTO user_stats (user_id, total_pickups, waste_collected, co2_saved, green_points)
SELECT 
  id,
  0,
  0,
  0,
  0
FROM auth.users 
WHERE email = 'nikhil@demo.com';

SELECT '✅ User stats created' as status;

-- STEP 4: Add NGO record (with explicit UUID generation)
INSERT INTO ngos (id, name, email, address, lat, lng, description, accepted_waste_types)
VALUES (
  gen_random_uuid(),
  'Green Earth Foundation',
  'contact@greenearth.org',
  '100 Eco Boulevard, Eco City',
  40.7520,
  -73.9770,
  'Leading environmental NGO focused on recycling and sustainability',
  ARRAY['plastic', 'paper', 'metal', 'glass', 'ewaste']
);

SELECT '✅ NGO created' as status;

-- STEP 5: Verify everything
SELECT 
  '📊 VERIFICATION RESULTS' as section,
  '' as detail
UNION ALL
SELECT 
  '👥 Users Created',
  COUNT(*)::text || ' users'
FROM users
UNION ALL
SELECT 
  '📦 Pickups',
  COUNT(*)::text || ' pickups'
FROM pickups
UNION ALL
SELECT 
  '🎁 Donations',
  COUNT(*)::text || ' donations'
FROM donations
UNION ALL
SELECT 
  '🏢 NGOs',
  COUNT(*)::text || ' NGOs'
FROM ngos
UNION ALL
SELECT 
  '📈 User Stats',
  COUNT(*)::text || ' stats records'
FROM user_stats;

-- STEP 6: Check auth linkage
WITH auth_check AS (
  SELECT 
    au.email,
    u.name,
    u.role,
    CASE 
      WHEN u.id IS NULL THEN '❌ NOT LINKED' 
      ELSE '✅ LINKED' 
    END as status
  FROM auth.users au
  LEFT JOIN users u ON au.id = u.id
  WHERE au.email LIKE '%@demo.com'
)
SELECT 
  '🔗 AUTH LINKAGE CHECK' as section,
  '' as email,
  '' as name,
  '' as role,
  '' as status
UNION ALL
SELECT 
  '' as section,
  email,
  name,
  role,
  status
FROM auth_check
ORDER BY email;

-- ============================================
-- EXPECTED RESULTS:
-- ============================================
-- ✅ 4 users (nikhil, manideep, badrinath, srishant)
-- ✅ 1 NGO (Green Earth Foundation)
-- ✅ 1 user_stat (for Nikhil)
-- ✅ 0 pickups (fresh start)
-- ✅ 0 donations (fresh start)
-- ✅ All 4 auth accounts linked to users table
-- ============================================

SELECT '
🎉 DATABASE RESET COMPLETE!

You can now:
1. Login with: name@demo.com / demo123
2. Test donations (no more null ID errors)
3. Verify real-time updates work
4. Check admin pages load correctly

Accounts:
- nikhil@demo.com → Citizen Dashboard
- manideep@demo.com → Collector Dashboard
- badrinath@demo.com → NGO Dashboard  
- srishant@demo.com → Admin Dashboard
' as instructions;
