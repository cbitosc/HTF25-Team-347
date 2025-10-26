-- Complete Supabase Setup Script for EcoTrack
-- Run this entire script in Supabase SQL Editor

-- 1. Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  donor_name TEXT,
  ngo_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item TEXT,
  quantity NUMERIC DEFAULT 0,
  address TEXT,
  lat NUMERIC DEFAULT 0,
  lng NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create ngo_materials table
CREATE TABLE IF NOT EXISTS ngo_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ngo_id UUID REFERENCES users(id) ON DELETE CASCADE,
  material_type TEXT,
  weight NUMERIC,
  source TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Update pickups table with collector fields
-- First check if columns exist and their types
DO $$ 
BEGIN
    -- Add collector_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pickups' AND column_name = 'collector_id') THEN
        ALTER TABLE pickups ADD COLUMN collector_id UUID REFERENCES users(id);
    END IF;
    
    -- Add collector_name if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pickups' AND column_name = 'collector_name') THEN
        ALTER TABLE pickups ADD COLUMN collector_name TEXT;
    END IF;
END $$;

-- 4. Enable Row Level Security
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngo_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickups ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their donations" ON donations;
DROP POLICY IF EXISTS "Users can create donations" ON donations;
DROP POLICY IF EXISTS "NGOs can manage their materials" ON ngo_materials;
DROP POLICY IF EXISTS "Users can view pickups" ON pickups;
DROP POLICY IF EXISTS "Users can create pickups" ON pickups;
DROP POLICY IF EXISTS "Collectors can update pickups" ON pickups;
DROP POLICY IF EXISTS "Users can view all users" ON users;

-- 6. Create RLS policies for donations
CREATE POLICY "Users can view their donations" ON donations
  FOR SELECT USING (donor_id = auth.uid() OR ngo_id = auth.uid());

CREATE POLICY "Users can create donations" ON donations
  FOR INSERT WITH CHECK (donor_id = auth.uid());

CREATE POLICY "NGOs can update donation status" ON donations
  FOR UPDATE USING (ngo_id = auth.uid());

-- 7. Create RLS policies for ngo_materials
CREATE POLICY "NGOs can manage their materials" ON ngo_materials
  FOR ALL USING (ngo_id = auth.uid());

-- 8. Create RLS policies for pickups
CREATE POLICY "Users can view their pickups" ON pickups
  FOR SELECT USING (
    user_id::uuid = auth.uid() OR 
    collector_id::uuid = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can create pickups" ON pickups
  FOR INSERT WITH CHECK (user_id::uuid = auth.uid());

CREATE POLICY "Collectors can update pickups" ON pickups
  FOR UPDATE USING (
    collector_id::uuid = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('collector', 'admin'))
  );

-- 9. Create RLS policies for users table
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (id = auth.uid());

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_ngo_id ON donations(ngo_id);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pickups_user_id ON pickups(user_id);
CREATE INDEX IF NOT EXISTS idx_pickups_collector_id ON pickups(collector_id);
CREATE INDEX IF NOT EXISTS idx_pickups_status ON pickups(status);
CREATE INDEX IF NOT EXISTS idx_pickups_created_at ON pickups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ngo_materials_ngo_id ON ngo_materials(ngo_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'EcoTrack database setup completed successfully!';
  RAISE NOTICE 'Tables created: donations, ngo_materials';
  RAISE NOTICE 'Columns added to pickups: collector_id, collector_name';
  RAISE NOTICE 'RLS policies enabled and configured';
  RAISE NOTICE 'Performance indexes created';
END $$;
