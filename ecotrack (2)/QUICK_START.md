# EcoTrack Quick Start Guide

## ✅ All Fixes Applied!

All issues have been resolved:
- ✅ Donations page fixed to fetch NGO users correctly
- ✅ Admin pages all working with real data
- ✅ Collector shows real pickups (empty until someone creates one)
- ✅ All mock data removed
- ✅ Better error messages and logging

## 🧹 Step 1: Clear Browser Storage (REQUIRED!)

**Option A: Use the clear storage page**
Navigate to: http://localhost:3000/clear-storage.html
Click the button

**Option B: Manual clear**
1. Open browser console (F12)
2. Run:
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

## 🔐 Step 2: Demo Accounts

All 4 accounts are ready in Supabase:

| Name | Email | Password | Role |
|------|-------|----------|------|
| Nikhil | nikhil@demo.com | demo123 | Citizen |
| Manideep | manideep@demo.com | demo123 | Collector |
| Badrinath | badrinath@demo.com | demo123 | NGO |
| Srishant Goutham | srishant@demo.com | demo123 | Admin |

## 📝 Step 3: Test the Complete Flow

### Test 1: Create a Pickup (Nikhil - Citizen)

1. Sign in: `nikhil@demo.com` / `demo123`
2. From dashboard, click "Schedule Pickup"
3. Fill the form:
   - **Waste Type**: Select any (e.g., Plastic)
   - **Weight**: Enter amount (e.g., 10)
   - **Address**: Your test address
   - **Date**: Pick tomorrow or any future date
   - **Notes**: Optional
4. Click "Schedule Pickup"
5. ✅ **Check**: Success message appears
6. ✅ **Check**: Pickup appears in your "My Requests" or dashboard

### Test 2: Collector Sees Pickup (Manideep)

1. **Open a NEW incognito window or different browser**
2. Go to http://localhost:3000
3. Sign in: `manideep@demo.com` / `demo123`
4. ✅ **Check**: You should see Nikhil's pickup on the dashboard
5. Click "Update Status" button
6. ✅ **Check**: Status changes: pending → scheduled → collected → completed
7. Check these pages:
   - Click "View Assigned Pickups" - shows your assigned items
   - Click "Route Optimization" - shows route planning

### Test 3: Make a Donation (Nikhil - Citizen)

1. Go back to Nikhil's window
2. Click "Donate Items" from dashboard
3. Fill the donation form:
   - **Item Type**: Select (e.g., Electronics)
   - **Description**: Describe item (e.g., "Old laptop")
   - **Quantity**: Enter number
   - **Condition**: Select
   - **NGO**: **IMPORTANT** - Select "Badrinath" from dropdown
   - **Address**: Your pickup address
4. Click "Submit Donation"
5. ✅ **Check**: Success message
6. ✅ **Check**: Console shows "Donation created" (F12 to check)

### Test 4: NGO Receives Donation (Badrinath)

1. **Open ANOTHER incognito window**
2. Sign in: `badrinath@demo.com` / `demo123`
3. You're on the NGO dashboard
4. Click "Donations" tab
5. ✅ **Check**: You see Nikhil's donation
6. Click "Accept" or message donor
7. Go to "Inventory" tab
8. Click "Log New Materials"
9. Add a material:
   - **Item Type**: e.g., Aluminum
   - **Quantity**: e.g., 15
10. ✅ **Check**: Material appears in inventory table

### Test 5: Admin Monitors All (Srishant)

1. **Open ANOTHER incognito window**
2. Sign in: `srishant@demo.com` / `demo123`
3. Admin dashboard shows real stats
4. Navigate through:
   - **Analytics**: See real charts with actual data
   - **Manage Pickups**: See all pickups from all users
   - **Users**: See all 4 demo accounts
5. ✅ **Check**: All data is real from previous tests

## 🐛 Troubleshooting

### "No NGOs available" when donating
- Make sure you're signed in as a citizen (Nikhil)
- The NGO user (Badrinath) should exist in database
- Check browser console for errors

### Collector sees empty dashboard
- **This is CORRECT** if no pickups exist yet
- Create a pickup as Nikhil first
- Then check collector dashboard

### "Failed to submit donation"
- Check browser console (F12) for detailed error
- Make sure all form fields are filled
- **MUST select an NGO** from the dropdown
- Make sure you cleared localStorage

### Admin pages show 404
- Make sure you're signed in as admin (Srishant)
- Clear browser cache and storage
- Restart dev server if needed

### Auth errors / "Invalid refresh token"
- **Clear storage again** using the clear-storage.html page
- Sign out and sign in again
- Make sure you're using correct credentials

## 🎯 What Should Work

After following these steps:

✅ Citizens can schedule pickups
✅ Pickups appear in database immediately  
✅ Collectors see pending pickups in real-time
✅ Collectors can update pickup status
✅ Citizens can make donations to NGOs
✅ NGOs receive donations and can log materials
✅ Admin sees all activity from all users
✅ All stats and analytics show real data
✅ No mock data anywhere in the app

## 📊 Expected Behavior

- **Initially**: Dashboards may be empty (no mock data)
- **After creating data**: Everything updates in real-time
- **Real-time**: Changes in one account immediately visible to others
- **Persistent**: Data survives page refreshes and sign-outs

All data flows through Supabase in real-time! 🚀
