-- Setup script for demo accounts
-- Run this in your Supabase SQL Editor

-- First, create the demo users in the auth.users table via Supabase Dashboard:
-- 1. Go to Authentication > Users > Add User
-- 2. Create these 4 users:
--    - Email: nikhil@demo.com, Password: demo123
--    - Email: manideep@demo.com, Password: demo123
--    - Email: badrinath@demo.com, Password: demo123
--    - Email: srishant@demo.com, Password: demo123

-- Then run this SQL to create their profiles:

-- Delete existing demo users if any
DELETE FROM users WHERE email LIKE '%@demo.com';

-- Insert demo user profiles
-- Replace the UUIDs below with the actual UUIDs from auth.users after creating them
INSERT INTO users (id, email, name, role, created_at) VALUES
  -- Citizen
  ((SELECT id FROM auth.users WHERE email = 'nikhil@demo.com'), 'nikhil@demo.com', 'Nikhil', 'citizen', NOW()),
  -- Collector
  ((SELECT id FROM auth.users WHERE email = 'manideep@demo.com'), 'manideep@demo.com', 'Manideep', 'collector', NOW()),
  -- NGO
  ((SELECT id FROM auth.users WHERE email = 'badrinath@demo.com'), 'badrinath@demo.com', 'Badrinath', 'ngo', NOW()),
  -- Admin
  ((SELECT id FROM auth.users WHERE email = 'srishant@demo.com'), 'srishant@demo.com', 'Srishant Goutham', 'admin', NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- Create some initial demo data
-- Sample pickup request from Nikhil (citizen)
INSERT INTO pickups (user_id, waste_type, weight, status, pickup_date, address, notes, created_at)
SELECT 
  (SELECT id FROM auth.users WHERE email = 'nikhil@demo.com'),
  'Plastic',
  5.0,
  'pending',
  (CURRENT_DATE + INTERVAL '2 days')::date,
  '123 Main Street, Downtown',
  'Please collect from main gate',
  NOW() - INTERVAL '1 day'
WHERE EXISTS (SELECT 1 FROM auth.users WHERE email = 'nikhil@demo.com');

-- You can add more demo data as needed
