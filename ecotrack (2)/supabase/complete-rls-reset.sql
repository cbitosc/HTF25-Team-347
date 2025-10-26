-- ============================================
-- COMPLETE RLS RESET - REMOVES ALL POLICIES
-- ============================================
-- This script removes ALL existing policies and creates fresh ones
-- ============================================

-- STEP 1: Get all existing policy names and drop them
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

SELECT '✅ All existing policies dropped' as status;

-- STEP 2: Create new simple policies for all tables

-- ===== USERS TABLE =====
CREATE POLICY "Enable all for authenticated users"
  ON users FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ===== PICKUPS TABLE =====
CREATE POLICY "Enable all for authenticated users"
  ON pickups FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ===== DONATIONS TABLE =====
CREATE POLICY "Enable all for authenticated users"
  ON donations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ===== NGO_INVENTORY TABLE =====
CREATE POLICY "Enable all for authenticated users"
  ON ngo_inventory FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ===== NGO_MATERIALS TABLE =====
CREATE POLICY "Enable all for authenticated users"
  ON ngo_materials FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ===== NGOS TABLE =====
CREATE POLICY "Enable all for authenticated users"
  ON ngos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ===== USER_STATS TABLE =====
CREATE POLICY "Enable all for authenticated users"
  ON user_stats FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ===== SCHEDULES TABLE =====
CREATE POLICY "Enable all for authenticated users"
  ON schedules FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- STEP 3: Verify new policies
SELECT 
  tablename,
  policyname,
  cmd,
  permissive,
  CASE 
    WHEN cmd = 'ALL' THEN '✅ Full Access'
    ELSE '⚠️  Limited'
  END as access_level
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

SELECT '
✅ RLS RESET COMPLETE!

All tables now have a single policy:
- "Enable all for authenticated users"
- Grants full SELECT, INSERT, UPDATE, DELETE access
- No more permission denied errors

You can now:
✅ Accept/decline donations as NGO
✅ Assign collectors as Admin
✅ Update pickups as Collector
✅ Create donations/pickups as Citizen
' as result;
