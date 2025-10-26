-- ============================================
-- PURGE ALL DATA FROM ECOTRACK DATABASE
-- ============================================
-- WARNING: This will DELETE ALL data from all tables!
-- Use this to start fresh with clean tables.
-- Run this in Supabase SQL Editor
-- ============================================

-- Disable RLS temporarily for cleanup (optional, but helps avoid permission issues)
-- You'll need to be authenticated as the Supabase service role or have admin privileges

-- 1. Delete all data from dependent tables first (to avoid foreign key issues)
DELETE FROM ngo_materials;
DELETE FROM ngo_inventory;
DELETE FROM schedules;
DELETE FROM user_stats;

-- 2. Delete pickups and donations
DELETE FROM pickups;
DELETE FROM donations;

-- 3. Delete NGO records
DELETE FROM ngos;

-- 4. Delete all users (this will cascade to related records if FK constraints are set)
DELETE FROM users;

-- 5. Verify all tables are empty
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'pickups', COUNT(*) FROM pickups
UNION ALL
SELECT 'donations', COUNT(*) FROM donations
UNION ALL
SELECT 'ngos', COUNT(*) FROM ngos
UNION ALL
SELECT 'user_stats', COUNT(*) FROM user_stats
UNION ALL
SELECT 'schedules', COUNT(*) FROM schedules
UNION ALL
SELECT 'ngo_inventory', COUNT(*) FROM ngo_inventory
UNION ALL
SELECT 'ngo_materials', COUNT(*) FROM ngo_materials;

-- 6. Reset any sequences (if you have auto-increment IDs, though you're using UUIDs)
-- Not needed for UUID-based tables

-- ============================================
-- CONFIRMATION MESSAGE
-- ============================================
SELECT 'All data has been purged. You can now run your setup scripts to add fresh demo data.' as message;
