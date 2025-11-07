"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, Circle, Package, MapPin } from "lucide-react"
import { motion } from "framer-motion"
import { getPickupsByUserId } from "@/lib/supabase/operations"
import { useAuth } from "@/lib/auth/AuthContext"
import type { Database } from "@/lib/supabase/database.types"

type Pickup = Database["public"]["Tables"]["pickups"]["Row"]

const ALL_STEPS = ["Requested", "Assigned", "On the Way", "Picked Up", "Delivered"]

export function TrackStatusSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      {[1, 2].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex gap-3">
              <Skeleton className="h-6 w-6 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex items-center gap-4">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

interface PickupStatusCardProps {
  pickup: Pickup
  index: number
}

function PickupStatusCard({ pickup, index }: PickupStatusCardProps) {
  const getCurrentStepIndex = () => {
    return ALL_STEPS.indexOf(pickup.status)
  }

  const getTimestamp = (step: string) => {
    switch (step) {
      case "Requested":
        return pickup.requested_date
      case "Assigned":
        return pickup.assigned_date
      case "On the Way":
        return pickup.assigned_date // No separate field, use assigned
      case "Picked Up":
        return pickup.picked_up_date
      case "Delivered":
        return pickup.delivered_date
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="font-bold text-lg">{pickup.id}</p>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <Package className="w-4 h-4" />
                <span>{pickup.type}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <MapPin className="w-4 h-4" />
                <span>{pickup.address}</span>
              </div>
              {pickup.collector_name && (
                <p className="text-sm text-gray-600 mt-1">Collector: {pickup.collector_name}</p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ALL_STEPS.map((step, idx) => {
              const currentStepIndex = getCurrentStepIndex()
              const isCompleted = idx <= currentStepIndex
              const timestamp = getTimestamp(step)
              return (
                <div key={step} className="flex items-center gap-4">
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold">{step}</p>
                        {timestamp && (
                          <p className="text-sm text-muted-foreground">
                            {new Date(timestamp).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <Circle className="w-6 h-6 text-gray-300 flex-shrink-0" />
                      <p className="font-semibold text-gray-400">{step}</p>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function TrackStatus() {
  const { userId } = useAuth()
  const [pickups, setPickups] = useState<Pickup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPickups = async () => {
      if (!userId) {
        setLoading(false)
        return
      }
      try {
        const data = await getPickupsByUserId(userId)
        setPickups(data)
      } catch (error) {
        console.error("Failed to fetch pickups:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPickups()
  }, [userId])

  if (loading) {
    return <TrackStatusSkeleton />
  }

  if (pickups.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No Pickups Found.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">My Pickup Status</h2>
      <div className="space-y-4">
        {pickups.map((pickup, idx) => (
          <PickupStatusCard key={pickup.id} pickup={pickup} index={idx} />
        ))}
      </div>
    </div>
  )
}
