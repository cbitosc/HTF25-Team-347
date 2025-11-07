# EcoTrack Critical Fixes Guide

## ✅ Issues Fixed in Code

1. **Donation ID Generation** - Added UUID generation for donations
2. **Admin Page Links** - Fixed links from `/dashboard/admin/*` to `/admin/*`
3. **Admin Pickups Page** - Now uses real Supabase data
4. **Real-time Subscriptions** - Added for collectors and NGOs
5. **Removed Duplicate Donation Page** - Deleted `/dashboard/donations/new`

## 🔧 Database Fixes Required

Run this SQL in your **Supabase SQL Editor**:

```sql
-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Set default UUID generation for donations
ALTER TABLE donations 
  ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- 3. Set default UUID generation for pickups
ALTER TABLE pickups 
  ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- 4. Clean up any NULL IDs
DELETE FROM donations WHERE id IS NULL;
DELETE FROM pickups WHERE id IS NULL;
```

## 🔴 Real-time Issues to Fix

### Enable Realtime in Supabase:

1. Go to **Supabase Dashboard** > **Database** > **Replication**
2. Enable realtime for these tables:
   - ✅ `pickups`
   - ✅ `donations`
   - ✅ `users`

3. Or run this SQL:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE pickups;
ALTER PUBLICATION supabase_realtime ADD TABLE donations;
ALTER PUBLICATION supabase_realtime ADD TABLE users;
```

## 🔍 Check User Roles

Run this to verify each demo user has only ONE role:

```sql
SELECT id, name, email, role, created_at 
FROM users 
ORDER BY role, name;
```

**Expected Result:**
- Srishant Goutham → admin
- Nikhil → citizen
- Manideep → collector  
- Badrinath → ngo

If Nikhil shows up with multiple roles, there's a database issue. Run:

```sql
-- Check for duplicate emails
SELECT email, COUNT(*) as count
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- If duplicates exist, keep only one per email:
DELETE FROM users
WHERE id NOT IN (
  SELECT MIN(id)
  FROM users
  GROUP BY email
);
```

## 🐛 Current Known Issues

### Issue 1: Donation Submission Fails
**Status:** ✅ FIXED
- Added `id: crypto.randomUUID()` 
- Added `date: new Date().toISOString()`

### Issue 2: Admin Cannot Assign Collectors
**Potential Causes:**
1. RLS policies blocking admin updates
2. Collector list not loading
3. Update operation failing

**Check in Supabase SQL:**
```sql
-- Verify admin has proper permissions
SELECT * FROM pg_policies 
WHERE tablename = 'pickups' 
AND policyname LIKE '%admin%';

-- Test if admin can update
UPDATE pickups 
SET collector_id = 'test-id', 
    collector_name = 'Test Collector'
WHERE id = 'some-pickup-id';
```

### Issue 3: Real-time Stops Working
**Possible Causes:**
1. Realtime not enabled (see section above)
2. Subscription cleanup issue
3. Network/connection issue

**Test Real-time:**
```javascript
// Open browser console on collector page
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient('YOUR_URL', 'YOUR_ANON_KEY')

supabase
  .channel('test')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'pickups' },
    (payload) => console.log('Change received!', payload)
  )
  .subscribe()
```

### Issue 4: User Shows Multiple Roles
**Root Cause:** Either:
1. Multiple accounts with same email
2. Auth context not filtering properly
3. Database has incorrect data

**Fix:** Run the duplicate check query above and verify auth context.

## 📋 Testing Checklist

After applying fixes, test in this order:

### 1. Admin Tests
- [ ] Login as Srishant Goutham
- [ ] Navigate to `/admin` - should see real stats
- [ ] Click "User Management" → `/admin/users`
- [ ] Click "Monitor Pickups" → `/admin/pickups`
- [ ] Click "Analytics & Reports" → `/admin/analytics`
- [ ] Try assigning a collector to a pickup

### 2. Citizen Tests
- [ ] Login as Nikhil
- [ ] Create a pickup request
- [ ] Create a donation at `/dashboard/donations`
- [ ] Should NOT see collector/NGO/admin pages

### 3. Collector Tests
- [ ] Login as Manideep
- [ ] Should see pickups immediately (real-time)
- [ ] Try updating pickup status
- [ ] Create new pickup as citizen, verify it appears

### 4. NGO Tests
- [ ] Login as Badrinath
- [ ] Should see donations list
- [ ] Accept/Decline a donation
- [ ] Create new donation as citizen, verify it appears

## 🚀 Quick Fix Commands

```bash
# 1. Restart dev server
npm run dev

# 2. Clear browser cache or use incognito mode

# 3. Check Supabase connection
curl https://YOUR_PROJECT_REF.supabase.co/rest/v1/users \\
  -H "apikey: YOUR_ANON_KEY"
```

## 📞 If Issues Persist

1. **Check Browser Console** - Look for errors
2. **Check Network Tab** - Verify API calls succeed
3. **Check Supabase Logs** - Database > Logs
4. **Verify Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

## 🎯 Next Steps After Fixes

1. Test all role-based access
2. Verify real-time updates work consistently
3. Test donation and pickup creation
4. Verify admin can manage all resources
5. Test in incognito mode to confirm no cache issues
