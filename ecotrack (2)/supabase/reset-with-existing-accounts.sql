-- ============================================
-- RESET DATA WITH EXISTING DEMO ACCOUNTS
-- ============================================
-- This script purges all data and re-links to existing auth accounts
-- Existing accounts: name@demo.com with password: demo123
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

-- STEP 2: Get existing auth user IDs
-- Run this first to see your auth user IDs:
SELECT id, email, created_at 
FROM auth.users 
WHERE email LIKE '%@demo.com'
ORDER BY email;

-- ============================================
-- STEP 3: Copy the IDs from above and paste them below
-- ============================================

-- IMPORTANT: Replace these placeholder UUIDs with actual IDs from Step 2

-- Insert Nikhil (Citizen)
INSERT INTO users (id, name, email, role, address, lat, lng)
VALUES (
  'REPLACE_WITH_NIKHIL_ID',  -- Get from: SELECT id FROM auth.users WHERE email = 'nikhil@demo.com'
  'Nikhil',
  'nikhil@demo.com',
  'citizen',
  '123 Green Street, Eco City',
  40.7128,
  -74.0060
);

-- Insert Manideep (Collector)
INSERT INTO users (id, name, email, role, address, lat, lng)
VALUES (
  'REPLACE_WITH_MANIDEEP_ID',  -- Get from: SELECT id FROM auth.users WHERE email = 'manideep@demo.com'
  'Manideep',
  'manideep@demo.com',
  'collector',
  '456 Collection Ave, Eco City',
  40.7580,
  -73.9855
);

-- Insert Badrinath (NGO)
INSERT INTO users (id, name, email, role, address, lat, lng)
VALUES (
  'REPLACE_WITH_BADRINATH_ID',  -- Get from: SELECT id FROM auth.users WHERE email = 'badrinath@demo.com'
  'Badrinath',
  'badrinath@demo.com',
  'ngo',
  '789 Charity Road, Eco City',
  40.7489,
  -73.9680
);

-- Insert Srishant (Admin)
INSERT INTO users (id, name, email, role, address, lat, lng)
VALUES (
  'REPLACE_WITH_SRISHANT_ID',  -- Get from: SELECT id FROM auth.users WHERE email = 'srishant@demo.com'
  'Srishant Goutham',
  'srishant@demo.com',
  'admin',
  '321 Admin Plaza, Eco City',
  40.7614,
  -73.9776
);

-- Create user_stats for citizen
INSERT INTO user_stats (user_id, total_pickups, waste_collected, co2_saved, green_points)
VALUES ('REPLACE_WITH_NIKHIL_ID', 0, 0, 0, 0);

-- Add NGO record
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

-- ============================================
-- STEP 4: Verify setup
-- ============================================

-- Check users table matches auth
SELECT 
  au.email as auth_email,
  u.name,
  u.role,
  CASE WHEN u.id IS NULL THEN '❌ MISSING' ELSE '✅ LINKED' END as status
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE au.email LIKE '%@demo.com'
ORDER BY au.email;

-- Count records
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'pickups', COUNT(*) FROM pickups
UNION ALL SELECT 'donations', COUNT(*) FROM donations
UNION ALL SELECT 'ngos', COUNT(*) FROM ngos
UNION ALL SELECT 'user_stats', COUNT(*) FROM user_stats;

-- ============================================
-- If everything looks good, you should see:
-- ✅ 4 users in users table
-- ✅ 1 NGO in ngos table  
-- ✅ 1 user_stat for Nikhil
-- ✅ All auth accounts linked to users table
-- ============================================
