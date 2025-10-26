-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('citizen', 'admin', 'collector', 'ngo')),
  address TEXT,
  lat NUMERIC,
  lng NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_stats table
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_pickups INTEGER DEFAULT 0,
  waste_collected NUMERIC DEFAULT 0,
  co2_saved NUMERIC DEFAULT 0,
  green_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create pickups table
CREATE TABLE IF NOT EXISTS pickups (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  type TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Requested', 'Assigned', 'On the Way', 'Picked Up', 'Delivered')),
  collector_id UUID REFERENCES users(id) ON DELETE SET NULL,
  collector_name TEXT,
  requested_date TIMESTAMPTZ DEFAULT NOW(),
  assigned_date TIMESTAMPTZ,
  picked_up_date TIMESTAMPTZ,
  delivered_date TIMESTAMPTZ,
  photo_proof TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id TEXT PRIMARY KEY,
  donor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  donor_name TEXT NOT NULL,
  ngo_id TEXT NOT NULL,
  item TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  address TEXT NOT NULL,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Accepted', 'Declined', 'Completed')),
  date TIMESTAMPTZ DEFAULT NOW(),
  pickup_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ngos table
CREATE TABLE IF NOT EXISTS ngos (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  description TEXT NOT NULL,
  accepted_waste_types TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ngo_inventory table
CREATE TABLE IF NOT EXISTS ngo_inventory (
  id TEXT PRIMARY KEY,
  ngo_id TEXT REFERENCES ngos(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  date TEXT NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL,
  waste_type TEXT NOT NULL,
  recurring BOOLEAN DEFAULT TRUE,
  next_pickup TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pickups_user_id ON pickups(user_id);
CREATE INDEX IF NOT EXISTS idx_pickups_collector_id ON pickups(collector_id);
CREATE INDEX IF NOT EXISTS idx_pickups_status ON pickups(status);
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_ngo_id ON donations(ngo_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_ngo_inventory_ngo_id ON ngo_inventory(ngo_id);
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON schedules(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pickups_updated_at BEFORE UPDATE ON pickups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON donations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ngos_updated_at BEFORE UPDATE ON ngos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ngo_inventory_updated_at BEFORE UPDATE ON ngo_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickups ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngo_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can customize these based on your auth requirements)
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON users FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all user_stats" ON user_stats FOR SELECT USING (true);
CREATE POLICY "Enable insert for all user_stats" ON user_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all user_stats" ON user_stats FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all pickups" ON pickups FOR SELECT USING (true);
CREATE POLICY "Enable insert for all pickups" ON pickups FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all pickups" ON pickups FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all pickups" ON pickups FOR DELETE USING (true);

CREATE POLICY "Enable read access for all donations" ON donations FOR SELECT USING (true);
CREATE POLICY "Enable insert for all donations" ON donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all donations" ON donations FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all ngos" ON ngos FOR SELECT USING (true);
CREATE POLICY "Enable insert for all ngos" ON ngos FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all ngos" ON ngos FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all ngo_inventory" ON ngo_inventory FOR SELECT USING (true);
CREATE POLICY "Enable insert for all ngo_inventory" ON ngo_inventory FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all ngo_inventory" ON ngo_inventory FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all schedules" ON schedules FOR SELECT USING (true);
CREATE POLICY "Enable insert for all schedules" ON schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all schedules" ON schedules FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all schedules" ON schedules FOR DELETE USING (true);
