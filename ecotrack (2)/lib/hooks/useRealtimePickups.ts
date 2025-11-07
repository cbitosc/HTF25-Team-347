import { useEffect, useState } from 'react'
import { subscribeToPickups } from '@/lib/supabase/operations'
import type { Database } from '@/lib/supabase/database.types'

type Pickup = Database['public']['Tables']['pickups']['Row']

export function useRealtimePickups(initialPickups: Pickup[]) {
  const [pickups, setPickups] = useState<Pickup[]>(initialPickups)

  useEffect(() => {
    setPickups(initialPickups)
  }, [initialPickups])

  useEffect(() => {
    const channel = subscribeToPickups((payload) => {
      if (payload.eventType === 'INSERT') {
        setPickups((current) => [payload.new as Pickup, ...current])
      } else if (payload.eventType === 'UPDATE') {
        setPickups((current) =>
          current.map((pickup) =>
            pickup.id === payload.new.id ? (payload.new as Pickup) : pickup
          )
        )
      } else if (payload.eventType === 'DELETE') {
        setPickups((current) =>
          current.filter((pickup) => pickup.id !== payload.old.id)
        )
      }
    })

    return () => {
      channel.unsubscribe()
    }
  }, [])

  return pickups
}
