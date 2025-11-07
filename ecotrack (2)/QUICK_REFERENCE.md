# 🚀 Supabase Quick Reference

## Environment Setup
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

## Import Statements

```typescript
// Database operations
import { 
  getPickups, 
  updatePickup, 
  getDonations, 
  updateDonation,
  getUserById,
  getNGOById 
} from "@/lib/supabase/operations"

// Real-time hooks
import { usePickupsRealtime } from "@/lib/hooks/usePickupsRealtime"
import { useDonationsRealtime } from "@/lib/hooks/useDonationsRealtime"

// Types
import type { Database } from "@/lib/supabase/database.types"
```

## Common Patterns

### Real-Time Pickups (Collector/Citizen)
```typescript
const { pickups, loading, error } = usePickupsRealtime(userId, "collector")

if (loading) return <LoadingSpinner />
if (error) return <ErrorMessage error={error} />

// Use pickups - automatically updates in real-time!
```

### Real-Time Donations (NGO/Citizen)
```typescript
const { donations, loading, error } = useDonationsRealtime(ngoId, "ngo")

// donations automatically syncs across all users
```

### Update Pickup Status
```typescript
await updatePickup(pickupId, {
  status: "Delivered",
  delivered_date: new Date().toISOString()
})
// Real-time subscribers automatically notified!
// User stats automatically calculated!
```

### Update Donation Status
```typescript
await updateDonation(donationId, {
  status: "Accepted",
  pickup_date: new Date().toISOString()
})
// Donor sees update instantly!
```

### Get NGO Details with Inventory
```typescript
const ngo = await getNGOById("NGO-001")
console.log(ngo.inventory) // Array of inventory items
```

### Add to NGO Inventory
```typescript
await updateNGOInventory(ngoId, {
  item: "Plastic",
  quantity: 50,
  date: "2025-10-25",
  unit: "kg"
})
```

## Database Table Names

| Type | Table Name | Key Fields |
|------|-----------|-----------|
| Pickups | `pickups` | `user_id`, `collector_id`, `status` |
| Donations | `donations` | `donor_id`, `ngo_id`, `status` |
| Users | `users` | `email`, `role` |
| NGOs | `ngos` | `name`, `accepted_waste_types` |
| Inventory | `ngo_inventory` | `ngo_id`, `item`, `quantity` |
| Stats | `user_stats` | `user_id`, `total_pickups` |
| Schedules | `schedules` | `user_id`, `next_pickup` |

## Status Values

### Pickup Status
- `"Requested"` - Initial state
- `"Assigned"` - Assigned to collector
- `"On the Way"` - Collector en route
- `"Picked Up"` - Collected from user
- `"Delivered"` - Delivered to facility (triggers stats update)

### Donation Status
- `"Pending"` - Awaiting NGO review
- `"Accepted"` - NGO accepted
- `"Declined"` - NGO declined
- `"Completed"` - Pickup completed

## Field Name Conversions

| Old (Mock) | New (Supabase) |
|-----------|----------------|
| `userId` | `user_id` |
| `userName` | `user_name` |
| `collectorId` | `collector_id` |
| `collectorName` | `collector_name` |
| `donorId` | `donor_id` |
| `donorName` | `donor_name` |
| `ngoId` | `ngo_id` |
| `requestedDate` | `requested_date` |
| `pickedUpDate` | `picked_up_date` |
| `deliveredDate` | `delivered_date` |
| `pickupDate` | `pickup_date` |

## Error Handling

```typescript
try {
  const result = await updatePickup(id, updates)
  console.log("Success:", result)
} catch (error) {
  console.error("Database error:", error)
  // Show user-friendly error message
}
```

## Real-Time Subscription Cleanup

```typescript
useEffect(() => {
  const subscription = subscribeToPickups((payload) => {
    console.log("Change detected:", payload)
  })

  // IMPORTANT: Always cleanup!
  return () => {
    subscription.unsubscribe()
  }
}, [])
```

## Testing Real-Time

1. Open two browser windows
2. Window 1: Collector dashboard
3. Window 2: Citizen dashboard  
4. Update pickup in Window 1
5. See instant update in Window 2! ✨

## Common Issues

### "Missing environment variables"
→ Create `.env.local` with Supabase credentials

### Real-time not working
→ Enable in Supabase Dashboard > Database > Replication

### TypeScript errors on field names
→ Use snake_case (e.g., `user_id` not `userId`)

### Data not appearing
→ Check Supabase Table Editor to verify data exists

## Useful Commands

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Check TypeScript errors
pnpm tsc --noEmit
```

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Run schema.sql
3. ✅ Add environment variables
4. ✅ Enable realtime
5. ✅ Test with sample data
6. ✅ Migrate pages one by one
7. ✅ Deploy to production!

---

📖 **Full Documentation:**
- `README_SUPABASE.md` - Overview
- `SUPABASE_SETUP.md` - Setup guide
- `MIGRATION_GUIDE.md` - Migration details
