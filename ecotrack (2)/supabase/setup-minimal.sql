-- Minimal Setup - No foreign keys to avoid type issues
-- Run this script first

-- 1. Create donations table (no foreign keys)
CREATE TABLE IF NOT EXISTS donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_id TEXT,
  donor_name TEXT,
  ngo_id TEXT,
  item TEXT,
  quantity NUMERIC DEFAULT 0,
  address TEXT,
  lat NUMERIC DEFAULT 0,
  lng NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create ngo_materials table (no foreign keys)
CREATE TABLE IF NOT EXISTS ngo_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ngo_id TEXT,
  material_type TEXT,
  weight NUMERIC,
  source TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Add collector columns to pickups
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

-- 4. Enable RLS (but with permissive policies)
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngo_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickups ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON donations;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON donations;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON ngo_materials;
DROP POLICY IF EXISTS "Enable read for authenticated" ON pickups;
DROP POLICY IF EXISTS "Enable insert for authenticated" ON pickups;
DROP POLICY IF EXISTS "Enable update for authenticated" ON pickups;
DROP POLICY IF EXISTS "Enable read for all" ON users;

-- 6. Create simple permissive policies
CREATE POLICY "Enable read access for all users" ON donations
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON donations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON donations
  FOR UPDATE USING (true);

CREATE POLICY "Enable all for authenticated users" ON ngo_materials
  FOR ALL USING (true);

CREATE POLICY "Enable read for authenticated" ON pickups
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated" ON pickups
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated" ON pickups
  FOR UPDATE USING (true);

CREATE POLICY "Enable read for all" ON users
  FOR SELECT USING (true);

CREATE POLICY "Enable update for own profile" ON users
  FOR UPDATE USING (true);

-- 7. Create indexes
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_ngo_id ON donations(ngo_id);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ngo_materials_ngo_id ON ngo_materials(ngo_id);

-- Success!
SELECT 'Tables created successfully! All security policies are permissive for testing.' as message;
