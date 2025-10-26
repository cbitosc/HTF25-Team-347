-- Seed data for testing
-- Run this in Supabase SQL Editor after creating the schema

-- Insert test users
INSERT INTO users (id, name, email, role, address, lat, lng) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'John Citizen', 'john@example.com', 'citizen', '123 Green Street, Eco City', 51.505, -0.09),
  ('550e8400-e29b-41d4-a716-446655440002', 'Mike Collector', 'mike@example.com', 'collector', '456 Collector Ave', 51.508, -0.095),
  ('550e8400-e29b-41d4-a716-446655440003', 'Sarah Collector', 'sarah@example.com', 'collector', '789 Collector Blvd', 51.512, -0.085)
ON CONFLICT (email) DO NOTHING;

-- Get the actual UUID for C001 collector (Mike)
-- We'll use a fixed text ID for pickups but UUID for user references

-- Insert test pickups
INSERT INTO pickups (id, user_id, user_name, address, lat, lng, type, quantity, status, collector_id, collector_name, requested_date) VALUES
  ('P001', '550e8400-e29b-41d4-a716-446655440001', 'John Citizen', '123 Green Street, Eco City', 51.505, -0.09, 'E-Waste', 15, 'Assigned', '550e8400-e29b-41d4-a716-446655440002', 'Mike Collector', NOW() - INTERVAL '2 days'),
  ('P002', '550e8400-e29b-41d4-a716-446655440001', 'John Citizen', '456 Oak Avenue, Eco City', 51.51, -0.1, 'Plastic', 8, 'Requested', '550e8400-e29b-41d4-a716-446655440002', 'Mike Collector', NOW() - INTERVAL '1 day'),
  ('P003', '550e8400-e29b-41d4-a716-446655440001', 'John Citizen', '789 Pine Road, Eco City', 51.49, -0.08, 'Metal', 25, 'Picked Up', '550e8400-e29b-41d4-a716-446655440002', 'Mike Collector', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert NGO
INSERT INTO ngos (id, name, email, address, lat, lng, description, accepted_waste_types) VALUES
  ('NGO-001', 'Green Earth Foundation', 'contact@greenearth.org', '100 Recycling Center Blvd', 51.515, -0.12, 'Dedicated to sustainable waste management and environmental protection', ARRAY['Plastic', 'Metal', 'E-Waste', 'Paper', 'Glass'])
ON CONFLICT (id) DO NOTHING;

-- Insert test donations
INSERT INTO donations (id, donor_id, donor_name, ngo_id, item, quantity, address, lat, lng, status, date) VALUES
  ('DON-001', '550e8400-e29b-41d4-a716-446655440001', 'John Citizen', 'NGO-001', 'Aluminum Cans', 50, '123 Green Street', 51.505, -0.09, 'Pending', NOW() - INTERVAL '1 day'),
  ('DON-002', '550e8400-e29b-41d4-a716-446655440001', 'John Citizen', 'NGO-001', 'Plastic Bottles', 30, '456 Oak Avenue', 51.51, -0.1, 'Accepted', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- Insert NGO inventory
INSERT INTO ngo_inventory (id, ngo_id, item, quantity, date, unit) VALUES
  ('INV-001', 'NGO-001', 'Aluminum', 150, '2025-10-20', 'kg'),
  ('INV-002', 'NGO-001', 'Plastic', 280, '2025-10-19', 'kg'),
  ('INV-003', 'NGO-001', 'E-Waste', 45, '2025-10-18', 'kg')
ON CONFLICT (id) DO NOTHING;

-- Insert user stats for citizen
INSERT INTO user_stats (user_id, total_pickups, waste_collected, co2_saved, green_points) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 12, 156, 234, 1240)
ON CONFLICT (user_id) DO UPDATE SET
  total_pickups = EXCLUDED.total_pickups,
  waste_collected = EXCLUDED.waste_collected,
  co2_saved = EXCLUDED.co2_saved,
  green_points = EXCLUDED.green_points;

-- Success message
SELECT 'Test data inserted successfully!' as message;
SELECT COUNT(*) as pickup_count FROM pickups;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as donation_count FROM donations;
