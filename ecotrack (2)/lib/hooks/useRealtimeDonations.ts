import { useEffect, useState } from 'react'
import { subscribeToDonations } from '@/lib/supabase/operations'
import type { Database } from '@/lib/supabase/database.types'

type Donation = Database['public']['Tables']['donations']['Row']

export function useRealtimeDonations(initialDonations: Donation[]) {
  const [donations, setDonations] = useState<Donation[]>(initialDonations)

  useEffect(() => {
    setDonations(initialDonations)
  }, [initialDonations])

  useEffect(() => {
    const channel = subscribeToDonations((payload) => {
      if (payload.eventType === 'INSERT') {
        setDonations((current) => [payload.new as Donation, ...current])
      } else if (payload.eventType === 'UPDATE') {
        setDonations((current) =>
          current.map((donation) =>
            donation.id === payload.new.id ? (payload.new as Donation) : donation
          )
        )
      } else if (payload.eventType === 'DELETE') {
        setDonations((current) =>
          current.filter((donation) => donation.id !== payload.old.id)
        )
      }
    })

    return () => {
      channel.unsubscribe()
    }
  }, [])

  return donations
}
