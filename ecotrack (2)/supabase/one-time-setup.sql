-- ============================================
-- ONE-TIME DATABASE SETUP
-- ============================================
-- Run this once to fix UUID generation for all tables
-- Safe to run multiple times (uses IF NOT EXISTS where possible)
-- ============================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Set default UUID generation for all tables
ALTER TABLE donations ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE pickups ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE ngos ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE users ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE user_stats ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE schedules ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE ngo_inventory ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE ngo_materials ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- 3. Enable realtime (only add if not already added)
-- Check first which tables are already enabled:
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Add tables to realtime only if needed
-- If you get "already member" errors, that's OK - it means it's already enabled!
DO $$
BEGIN
  -- Try to add pickups
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE pickups;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'pickups already in realtime';
  END;

  -- Try to add donations
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE donations;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'donations already in realtime';
  END;

  -- Try to add users
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE users;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'users already in realtime';
  END;
END $$;

-- 4. Verify setup
SELECT '✅ UUID generation enabled for all tables' as status;

-- Show which tables have realtime enabled
SELECT 
  '📡 Realtime enabled for: ' || string_agg(tablename, ', ') as realtime_tables
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- ============================================
-- Setup complete! Now run auto-reset.sql
-- ============================================
