-- Check actual pickups table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'pickups'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check a sample pickup to see actual data
SELECT * FROM pickups LIMIT 1;
