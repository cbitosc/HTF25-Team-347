-- Fix Database Issues
-- Run this script in your Supabase SQL Editor

-- 1. Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Set default UUID generation for all tables
ALTER TABLE donations 
  ALTER COLUMN id SET DEFAULT uuid_generate_v4();

ALTER TABLE pickups 
  ALTER COLUMN id SET DEFAULT uuid_generate_v4();

ALTER TABLE ngos 
  ALTER COLUMN id SET DEFAULT uuid_generate_v4();

ALTER TABLE users 
  ALTER COLUMN id SET DEFAULT uuid_generate_v4();

ALTER TABLE user_stats 
  ALTER COLUMN id SET DEFAULT uuid_generate_v4();

ALTER TABLE schedules 
  ALTER COLUMN id SET DEFAULT uuid_generate_v4();

ALTER TABLE ngo_inventory 
  ALTER COLUMN id SET DEFAULT uuid_generate_v4();

ALTER TABLE ngo_materials 
  ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- 4. Check current users and their roles
SELECT id, name, email, role, created_at 
FROM users 
ORDER BY role, name;

-- 5. Verify no duplicate user IDs exist in auth.users
-- (This query helps identify if someone has multiple accounts)
SELECT email, COUNT(*) as account_count
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- 6. Check donations table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'donations'
ORDER BY ordinal_position;

-- 7. Check pickups table structure  
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'pickups'
ORDER BY ordinal_position;

-- 8. Clean up any test data with NULL ids (if any exist)
DELETE FROM donations WHERE id IS NULL;
DELETE FROM pickups WHERE id IS NULL;

-- 9. Verify RLS policies are correctly filtering by role
SELECT schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('donations', 'pickups', 'users')
ORDER BY tablename, policyname;
