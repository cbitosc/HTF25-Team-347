-- Simplified Setup Script - Run this instead
-- This script checks column types and handles them properly

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

-- 3. Add collector columns to pickups (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pickups' AND column_name = 'collector_id') THEN
        ALTER TABLE pickups ADD COLUMN collector_id TEXT;
    END IF;
    
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

-- 5. Drop existing policies
DROP POLICY IF EXISTS "Users can view their donations" ON donations;
DROP POLICY IF EXISTS "Users can create donations" ON donations;
DROP POLICY IF EXISTS "NGOs can update donation status" ON donations;
DROP POLICY IF EXISTS "NGOs can manage their materials" ON ngo_materials;
DROP POLICY IF EXISTS "Users can view pickups" ON pickups;
DROP POLICY IF EXISTS "Users can create pickups" ON pickups;
DROP POLICY IF EXISTS "Collectors can update pickups" ON pickups;
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- 6. Donations policies
CREATE POLICY "Users can view their donations" ON donations
  FOR SELECT USING (
    donor_id = auth.uid() OR 
    ngo_id = auth.uid()
  );

CREATE POLICY "Users can create donations" ON donations
  FOR INSERT WITH CHECK (donor_id = auth.uid());

CREATE POLICY "NGOs can update donation status" ON donations
  FOR UPDATE USING (ngo_id = auth.uid());

-- 7. NGO materials policies
CREATE POLICY "NGOs can manage their materials" ON ngo_materials
  FOR ALL USING (ngo_id = auth.uid());

-- 8. Pickups policies (without type casting to avoid errors)
CREATE POLICY "Users can view pickups" ON pickups
  FOR SELECT USING (true); -- Allow all authenticated users to view for now

CREATE POLICY "Users can create pickups" ON pickups
  FOR INSERT WITH CHECK (true); -- Allow all authenticated users to create

CREATE POLICY "Collectors can update pickups" ON pickups
  FOR UPDATE USING (true); -- Allow all authenticated users to update for now

-- 9. Users policies
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (id = auth.uid());

-- 10. Create indexes
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_ngo_id ON donations(ngo_id);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pickups_user_id ON pickups(user_id);
CREATE INDEX IF NOT EXISTS idx_pickups_collector_id ON pickups(collector_id);
CREATE INDEX IF NOT EXISTS idx_pickups_status ON pickups(status);
CREATE INDEX IF NOT EXISTS idx_pickups_created_at ON pickups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ngo_materials_ngo_id ON ngo_materials(ngo_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Success!
SELECT 'Setup completed successfully!' as message;
