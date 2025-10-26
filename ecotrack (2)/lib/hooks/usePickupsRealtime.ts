import { useEffect, useState } from "react"
import { getPickupsByCollectorId, getPickupsByUserId, subscribeToPickups } from "@/lib/supabase/operations"
import type { Database } from "@/lib/supabase/database.types"

type Pickup = Database["public"]["Tables"]["pickups"]["Row"]

export function usePickupsRealtime(userId: string, role: "collector" | "citizen") {
  const [pickups, setPickups] = useState<Pickup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Initial fetch
    const fetchPickups = async () => {
      try {
        setLoading(true)
        const data = role === "collector" 
          ? await getPickupsByCollectorId(userId)
          : await getPickupsByUserId(userId)
        setPickups(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchPickups()

    // Subscribe to real-time updates
    const subscription = subscribeToPickups((payload) => {
      console.log("Pickup update received:", payload)
      
      if (payload.eventType === "INSERT") {
        const newPickup = payload.new as Pickup
        // Only add if it belongs to this user
        const belongsToUser = role === "collector" 
          ? newPickup.collector_id === userId
          : newPickup.user_id === userId
        
        if (belongsToUser) {
          setPickups((prev) => [newPickup, ...prev])
        }
      } else if (payload.eventType === "UPDATE") {
        const updatedPickup = payload.new as Pickup
        setPickups((prev) =>
          prev.map((p) => (p.id === updatedPickup.id ? updatedPickup : p))
        )
      } else if (payload.eventType === "DELETE") {
        const deletedId = payload.old.id
        setPickups((prev) => prev.filter((p) => p.id !== deletedId))
      }
    })

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [userId, role])

  return { pickups, loading, error, setPickups }
}
