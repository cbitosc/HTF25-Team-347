# Getting Started with Supabase Integration

## ✅ Step-by-Step Checklist

### 1. Set Up Supabase Account (5 minutes)
- [ ] Go to [supabase.com](https://supabase.com)
- [ ] Sign up for a free account
- [ ] Create a new project
- [ ] Wait for project to finish setting up

### 2. Get Your Credentials (2 minutes)
- [ ] In your Supabase project dashboard
- [ ] Go to **Settings** → **API**
- [ ] Copy **Project URL** (looks like `https://xxxxx.supabase.co`)
- [ ] Copy **anon/public key** (long string starting with `eyJ...`)

### 3. Configure Environment Variables (1 minute)
- [ ] Your `.env.local` file already exists in the project root
- [ ] Open it in any text editor
- [ ] Replace the placeholder values with your actual credentials:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- [ ] Save the file
- [ ] **Restart your dev server** (`pnpm dev`)

### 4. Create Database Schema (3 minutes)
- [ ] Go to your Supabase dashboard
- [ ] Click **SQL Editor** in the left sidebar
- [ ] Click **New Query**
- [ ] Open `supabase/schema.sql` from this project
- [ ] Copy ALL the contents
- [ ] Paste into the SQL Editor
- [ ] Click **Run** button
- [ ] Wait for success message ✅

### 5. Enable Realtime (2 minutes)

**Option A: Via SQL (Recommended)**
- [ ] In SQL Editor, run this:
  ```sql
  ALTER PUBLICATION supabase_realtime ADD TABLE pickups;
  ALTER PUBLICATION supabase_realtime ADD TABLE donations;
  ALTER PUBLICATION supabase_realtime ADD TABLE user_stats;
  ALTER PUBLICATION supabase_realtime ADD TABLE ngos;
  ALTER PUBLICATION supabase_realtime ADD TABLE ngo_inventory;
  ```

**Option B: Via Table Editor (if available)**
- [ ] Go to **Table Editor**
- [ ] For each table (pickups, donations, etc.), enable "Realtime" toggle

### 6. Add Test Data (2 minutes)
- [ ] In SQL Editor, click **New Query**
- [ ] Open `supabase/seed.sql` from this project
- [ ] Copy ALL the contents
- [ ] Paste into the SQL Editor
- [ ] Click **Run** button
- [ ] You should see: "Test data inserted successfully!"

### 7. Test the Integration (2 minutes)
- [ ] Make sure dev server is running: `pnpm dev`
- [ ] Open http://localhost:3000
- [ ] Click on the **Collector** role
- [ ] You should see 3 test pickups! 🎉

### 8. Test Real-Time Updates (Optional)
- [ ] Open browser console (F12)
- [ ] Look for "Pickup update received:" messages
- [ ] Go to Supabase **Table Editor** → **pickups**
- [ ] Edit a pickup status
- [ ] Watch it update in your app instantly! ✨

## 🎯 What You Should See

### After Step 7:
**Collector Dashboard should show:**
- ✅ 3 active pickups
- ✅ E-Waste pickup (15 kg)
- ✅ Plastic pickup (8 kg)
- ✅ Metal pickup (25 kg)

### If You See Loading State:
- Check browser console for errors
- Verify `.env.local` has correct credentials
- Restart dev server after adding credentials

### If You See Error Message:
**"Error loading pickups: Missing Supabase environment variables"**
→ Add credentials to `.env.local` and restart server

**"Error loading pickups: [other error]"**
→ Check that schema.sql was run successfully in Supabase

## 🔥 Next Steps

Once it's working:
1. ✅ Test marking a pickup as "Delivered"
2. ✅ Watch stats automatically update
3. ✅ Try opening two browser windows and see real-time sync!
4. ✅ Update other pages (NGO, Citizen, Admin) using `MIGRATION_GUIDE.md`

## 📚 Quick Links

- **Supabase Dashboard:** [app.supabase.com](https://app.supabase.com)
- **Full Setup Guide:** `SUPABASE_SETUP.md`
- **Migration Guide:** `MIGRATION_GUIDE.md`
- **Quick Reference:** `QUICK_REFERENCE.md`

## 🆘 Troubleshooting

### "Failed to fetch" errors
→ Check your internet connection and Supabase project status

### Real-time not working
→ Make sure you ran the ALTER PUBLICATION commands in Step 5

### Data not showing
→ Verify seed.sql was run successfully (check Table Editor)

### Wrong collector ID
→ The collector page uses UUID: `550e8400-e29b-41d4-a716-446655440002`

---

**🎉 Once you see the pickups, you're all set!**

The collector page is now pulling data from Supabase and will update in real-time when changes occur.
