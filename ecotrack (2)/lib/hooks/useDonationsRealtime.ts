import { useEffect, useState } from "react"
import { getDonationsByNGO, getDonationsByDonor, subscribeToDonations } from "@/lib/supabase/operations"
import type { Database } from "@/lib/supabase/database.types"

type Donation = Database["public"]["Tables"]["donations"]["Row"]

export function useDonationsRealtime(userId: string, role: "ngo" | "citizen") {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Initial fetch
    const fetchDonations = async () => {
      try {
        setLoading(true)
        const data = role === "ngo" 
          ? await getDonationsByNGO(userId)
          : await getDonationsByDonor(userId)
        setDonations(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchDonations()

    // Subscribe to real-time updates
    const subscription = subscribeToDonations((payload) => {
      console.log("Donation update received:", payload)
      
      if (payload.eventType === "INSERT") {
        const newDonation = payload.new as Donation
        // Only add if it belongs to this user
        const belongsToUser = role === "ngo" 
          ? newDonation.ngo_id === userId
          : newDonation.donor_id === userId
        
        if (belongsToUser) {
          setDonations((prev) => [newDonation, ...prev])
        }
      } else if (payload.eventType === "UPDATE") {
        const updatedDonation = payload.new as Donation
        setDonations((prev) =>
          prev.map((d) => (d.id === updatedDonation.id ? updatedDonation : d))
        )
      } else if (payload.eventType === "DELETE") {
        const deletedId = payload.old.id
        setDonations((prev) => prev.filter((d) => d.id !== deletedId))
      }
    })

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [userId, role])

  return { donations, loading, error, setDonations }
}
