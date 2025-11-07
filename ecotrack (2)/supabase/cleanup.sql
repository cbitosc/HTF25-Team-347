-- Cleanup script to remove all test/seed data
-- Run this in Supabase SQL Editor to start fresh

-- Delete all data from tables (in correct order due to foreign keys)
DELETE FROM ngo_inventory;
DELETE FROM donations;
DELETE FROM pickups;
DELETE FROM schedules;
DELETE FROM user_stats;
DELETE FROM ngos;
DELETE FROM users;

-- Verify deletion
SELECT 'All test data removed!' as message;
SELECT COUNT(*) as pickup_count FROM pickups;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as donation_count FROM donations;
SELECT COUNT(*) as ngo_count FROM ngos;

-- All counts should be 0
