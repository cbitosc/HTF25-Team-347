# Migration Guide: From Mock Data to Supabase

This guide shows how to update your existing pages to use Supabase with real-time synchronization.

## Overview

The integration provides:
- ✅ Real-time updates across all user types
- ✅ Automatic stats calculation
- ✅ Persistent data storage
- ✅ Custom React hooks for easy integration

## Quick Start

### 1. Replace imports

**Before (Mock Data):**
```typescript
import { getPickupsByCollectorId, updatePickup } from "@/lib/data-store"
```

**After (Supabase):**
```typescript
import { updatePickup } from "@/lib/supabase/operations"
import { usePickupsRealtime } from "@/lib/hooks/usePickupsRealtime"
```

### 2. Use Real-time Hooks

## Example: Collector Page

**Before:**
```typescript
const [pickups, setPickups] = useState<Pickup[]>(getPickupsByCollectorId("C001"))
```

**After:**
```typescript
const collectorId = "your-collector-id" // Get from auth/localStorage
const { pickups, loading, error } = usePickupsRealtime(collectorId, "collector")

// pickups automatically updates when ANY user makes changes!
```

## Example: NGO Page

**Before:**
```typescript
import { getDonationsByNGO, updateDonation } from "@/lib/data-store"

const [donations, setDonations] = useState(getDonationsByNGO("NGO-001"))

const confirmAction = () => {
  updateDonation(selectedDonation.id, { status: newStatus })
  setDonations(getDonationsByNGO(ngoId)) // Manual refresh
}
```

**After:**
```typescript
import { updateDonation } from "@/lib/supabase/operations"
import { useDonationsRealtime } from "@/lib/hooks/useDonationsRealtime"

const ngoId = "your-ngo-id" // Get from auth/localStorage
const { donations, loading, error } = useDonationsRealtime(ngoId, "ngo")

const confirmAction = async () => {
  await updateDonation(selectedDonation.id, { status: newStatus })
  // donations automatically updates via real-time subscription!
  // NO manual refresh needed!
}
```

## Example: Citizen Dashboard

**Before:**
```typescript
import { getPickupsByUserId } from "@/lib/data-store"

useEffect(() => {
  const userPickups = getPickupsByUserId(userId)
  setPickups(userPickups)
}, [userId])
```

**After:**
```typescript
import { usePickupsRealtime } from "@/lib/hooks/usePickupsRealtime"

const userId = "your-user-id" // Get from auth/localStorage  
const { pickups, loading, error } = usePickupsRealtime(userId, "citizen")

// When collector marks pickup as "Delivered", this updates INSTANTLY!
```

## Complete Page Update Example: Collector Page

```typescript
"use client"

import { useEffect, useState } from "react"
import { updatePickup } from "@/lib/supabase/operations"
import { usePickupsRealtime } from "@/lib/hooks/usePickupsRealtime"

export default function CollectorPage() {
  const [collectorId] = useState("C001") // Replace with real auth
  const { pickups, loading, error } = usePickupsRealtime(collectorId, "collector")
  
  const confirmActionHandler = async () => {
    if (!selectedPickup || !confirmAction) return

    const updates = confirmAction === "pickup"
      ? { status: "Picked Up" as const, picked_up_date: new Date().toISOString() }
      : { status: "Delivered" as const, delivered_date: new Date().toISOString() }

    try {
      await updatePickup(selectedPickup.id, updates)
      // pickups state automatically updates via real-time hook!
      setShowConfirm(false)
    } catch (err) {
      console.error("Failed to update pickup:", err)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    // Your existing JSX...
    // pickups will auto-update when changes occur anywhere in the system!
  )
}
```

## Key Changes by Page

### `/app/collector/page.tsx`
- Replace `getPickupsByCollectorId` with `usePickupsRealtime(collectorId, "collector")`
- Replace `updatePickup` calls with async version from operations
- Remove manual `setPickups` calls after updates

### `/app/ngo/page.tsx`
- Replace `getDonationsByNGO` with `useDonationsRealtime(ngoId, "ngo")`
- Replace `getNGOById` with async version from operations
- Remove manual `setDonations` calls after updates

### `/app/dashboard/page.tsx` (Citizen)
- Replace `getPickupsByUserId` with `usePickupsRealtime(userId, "citizen")`
- Add stats subscription to see real-time stat updates
- Remove manual refreshes

### `/app/admin/page.tsx`
- Use `getSystemStats` from operations for analytics
- Subscribe to pickups/donations for real-time dashboard updates

## Real-Time Synchronization Flow

```
Collector Dashboard                 Citizen Dashboard
      │                                    │
      │ Marks pickup as "Delivered"        │
      │                                    │
      ▼                                    │
  updatePickup()                           │
      │                                    │
      ▼                                    │
  Supabase ───────────────────────────────▶│
  (Real-time event)                        │
                                           ▼
                              Status updates to "Delivered"
                              Stats increment automatically!
```

## Type Conversions

Some field names changed to match database conventions:

| Old (Mock Data)    | New (Supabase)       |
|--------------------|----------------------|
| `userId`           | `user_id`            |
| `userName`         | `user_name`          |
| `collectorId`      | `collector_id`       |
| `collectorName`    | `collector_name`     |
| `requestedDate`    | `requested_date`     |
| `pickedUpDate`     | `picked_up_date`     |
| `deliveredDate`    | `delivered_date`     |
| `donorId`          | `donor_id`           |
| `donorName`        | `donor_name`         |
| `ngoId`            | `ngo_id`             |
| `pickupDate`       | `pickup_date`        |

TypeScript will help you catch these during migration!

## Testing Real-Time Features

1. Open two browser windows side-by-side
2. Window 1: Collector dashboard
3. Window 2: Citizen dashboard (same user's pickups)
4. In Window 1: Mark a pickup as "Delivered"
5. Watch Window 2: Status updates **instantly** without refresh!

## Error Handling

```typescript
const { pickups, loading, error } = usePickupsRealtime(userId, "citizen")

if (loading) return <LoadingSpinner />
if (error) return <ErrorMessage error={error} />

// Render your UI with pickups
```

## Need Help?

- Review `lib/supabase/operations.ts` for all available functions
- Check `lib/hooks/` for custom real-time hooks
- See `SUPABASE_SETUP.md` for database configuration
- All functions are fully typed with TypeScript!
