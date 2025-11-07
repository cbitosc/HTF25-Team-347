-- ============================================
-- FIX PICKUP STATUS CONSTRAINT
-- ============================================

-- STEP 1: Check current constraint
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'pickups'::regclass
  AND contype = 'c';

-- STEP 2: Drop old constraint
ALTER TABLE pickups DROP CONSTRAINT IF EXISTS pickups_status_check;

-- STEP 3: Add new constraint with all needed statuses
ALTER TABLE pickups ADD CONSTRAINT pickups_status_check
CHECK (status IN (
  'Requested',
  'Assigned', 
  'On the Way',
  'Picked Up',
  'Delivered',
  'pending',
  'scheduled',
  'in progress',
  'collected',
  'completed'
));

-- STEP 4: Verify constraint
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'pickups'::regclass
  AND contype = 'c';

SELECT '✅ Pickup status constraint updated!' as status;
SELECT 'Allowed statuses: pending, scheduled, in progress, collected, completed, Requested, Assigned, On the Way, Picked Up, Delivered' as allowed_values;
