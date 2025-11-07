# EcoTrack Testing Guide

## ✅ ALL FIXES COMPLETED!

All real-time data integration and missing pages have been implemented. Everything now uses Supabase instead of mock data.

## 🧹 FIRST: Clear Browser Storage

Before testing, **you must clear localStorage**:

1. Open http://localhost:3000 in your browser
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Run this command:
```javascript
localStorage.clear();
location.reload();
```

## 🔑 Demo Accounts

All 4 demo accounts are ready:

- **Nikhil** (Citizen): `nikhil@demo.com` / `demo123`
- **Manideep** (Collector): `manideep@demo.com` / `demo123`
- **Badrinath** (NGO): `badrinath@demo.com` / `demo123`
- **Srishant Goutham** (Admin): `srishant@demo.com` / `demo123`

## 📝 Complete Testing Flow

### Test 1: Citizen Creates Pickup (Nikhil)

1. Sign in as **nikhil@demo.com** / **demo123**
2. Go to "Schedule Pickup" from dashboard
3. Fill in pickup details:
   - Waste type: Plastic
   - Weight: 10kg
   - Address: Your test address
   - Date: Tomorrow's date
4. Submit the form
5. ✅ **Expected:** Pickup appears in your dashboard
6. ✅ **Expected:** Success toast notification

### Test 2: Collector Sees and Updates Pickup (Manideep)

1. **Open a new incognito window** or different browser
2. Sign in as **manideep@demo.com** / **demo123**
3. You should see Nikhil's pickup on the collector dashboard
4. Click "Update Status" button
5. ✅ **Expected:** Status changes from "pending" → "scheduled" → "collected" → "completed"
6. ✅ **Expected:** Success toast for each update
7. Navigate to "View Assigned Pickups" to see your assigned list
8. Navigate to "Route Optimization" to see route planning

### Test 3: Citizen Makes Donation (Nikhil)

1. Go back to Nikhil's browser window
2. Navigate to "Donate Items"
3. Fill in donation form:
   - Item type: Electronics
   - Description: Old laptop
   - Quantity: 1
   - Condition: Good
   - NGO: Select Badrinath's NGO
   - Address: Your address
4. Submit
5. ✅ **Expected:** Success message
6. ✅ **Expected:** Donation saved to database

### Test 4: NGO Receives Donation (Badrinath)

1. **Open another incognito window**
2. Sign in as **badrinath@demo.com** / **demo123**
3. Go to "Donations" tab
4. ✅ **Expected:** You see Nikhil's donation
5. Click "Accept" on the donation
6. Set a pickup date
7. Confirm acceptance
8. Go to "Inventory" tab
9. Click "Log New Materials"
10. Add material:
    - Item type: Aluminum
    - Weight: 15kg
11. ✅ **Expected:** Material appears in inventory table

### Test 5: Admin Monitors Everything (Srishant)

1. **Open another incognito window**
2. Sign in as **srishant@demo.com** / **demo123**
3. View dashboard overview
4. ✅ **Expected:** Real statistics from all users
5. Navigate to "Analytics"
6. ✅ **Expected:** Charts show real data:
   - Total waste collected
   - Number of pickups
   - CO₂ saved
   - Active collectors
7. Navigate to "Manage Pickups"
8. ✅ **Expected:** See all pickups from all users (Nikhil's pickups)
9. Navigate to "Users"
10. ✅ **Expected:** See all 4 demo accounts listed with real data

## 🎯 Key Features to Verify

### Real-Time Updates
- Changes made by one user should reflect across all relevant dashboards
- No page refresh needed (Supabase handles real-time subscriptions)

### Data Persistence
- All data is stored in Supabase
- Refreshing pages retains all data
- Signing out and back in shows same data

### Status Workflow
- Pickup status flows: pending → scheduled → collected → completed
- Donation status: Pending → Accepted/Declined

### Role-Based Access
- Each role sees appropriate pages and data
- Citizens see their own pickups and donations
- Collectors see available and assigned pickups
- NGOs see donations directed to them
- Admins see everything from all users

## 🐛 If Something Doesn't Work

1. **Check browser console** (F12) for errors
2. **Verify Supabase connection:**
   - Tables exist: `users`, `pickups`, `donations`, `ngo_materials`
   - RLS policies are enabled
   - Demo accounts exist in Authentication
3. **Clear localStorage again** if you see auth errors
4. **Check the server console** for backend errors

## 📊 What's Working Now

✅ Collector page shows real pickups from Supabase
✅ Collector can update pickup status
✅ NGO page shows real donations
✅ NGO can log materials to ngo_materials table
✅ Citizen dashboard shows real statistics
✅ Admin analytics shows real data from all users
✅ Admin users page shows all registered users
✅ Donations are saved to Supabase
✅ All 4 demo accounts share real-time data
✅ Collector assigned pickups page
✅ Collector route optimization page
✅ All mock data removed

## 🎉 Success Criteria

After testing, you should be able to:

1. ✅ Create pickups as Nikhil
2. ✅ See those pickups as Manideep
3. ✅ Update pickup status as Manideep
4. ✅ Make donations as Nikhil  
5. ✅ Receive donations as Badrinath
6. ✅ Log materials as Badrinath
7. ✅ Monitor all activity as Srishant
8. ✅ See real-time statistics everywhere

All data flows between the 4 demo accounts in real-time through Supabase!
