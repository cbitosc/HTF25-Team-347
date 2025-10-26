-- Add test pickup data for immediate testing
-- Run this in Supabase SQL Editor

-- Add a test pickup from Nikhil (citizen)
INSERT INTO pickups (user_id, waste_type, weight, status, pickup_date, address, notes)
SELECT 
  (SELECT id FROM users WHERE email = 'nikhil@demo.com'),
  'Plastic',
  10.0,
  'pending',
  (CURRENT_DATE + INTERVAL '1 day')::date,
  '123 Main Street, Downtown, City 12345',
  'Please collect from front gate'
WHERE EXISTS (SELECT 1 FROM users WHERE email = 'nikhil@demo.com')
AND NOT EXISTS (
  SELECT 1 FROM pickups 
  WHERE user_id = (SELECT id FROM users WHERE email = 'nikhil@demo.com')
  AND waste_type = 'Plastic'
  AND weight = 10.0
);

-- Add another test pickup
INSERT INTO pickups (user_id, waste_type, weight, status, pickup_date, address, notes)
SELECT 
  (SELECT id FROM users WHERE email = 'nikhil@demo.com'),
  'Metal',
  5.0,
  'pending',
  (CURRENT_DATE + INTERVAL '2 days')::date,
  '123 Main Street, Downtown, City 12345',
  'Metal cans and scrap'
WHERE EXISTS (SELECT 1 FROM users WHERE email = 'nikhil@demo.com')
AND NOT EXISTS (
  SELECT 1 FROM pickups 
  WHERE user_id = (SELECT id FROM users WHERE email = 'nikhil@demo.com')
  AND waste_type = 'Metal'
  AND weight = 5.0
);

-- Verify the data
SELECT 
  p.id,
  u.name as user_name,
  p.waste_type,
  p.weight,
  p.status,
  p.pickup_date,
  p.address
FROM pickups p
JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC;
