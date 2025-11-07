"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ListOrdered, Map } from "lucide-react"

interface OptimizedRouteModalProps {
  isOpen: boolean
  onClose: () => void
}

export function OptimizedRouteModal({ isOpen, onClose }: OptimizedRouteModalProps) {
  const optimizedRoute = [
    { id: "P002", address: "456 Oak Ave" },
    { id: "P003", address: "789 Pine Rd" },
    { id: "P001", address: "123 Main St" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListOrdered className="w-5 h-5" />
            Your Optimized Route
          </DialogTitle>
          <DialogDescription>
            This is the most efficient path to collect all assigned pickups. Follow the list in order.
          </DialogDescription>
        </DialogHeader>

        {/* Route List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <ol className="list-decimal list-inside space-y-2">
            {optimizedRoute.map((route, index) => (
              <li key={route.id} className="text-sm">
                <Card className="p-3 mt-1 ml-4 border">
                  <div className="font-medium text-sm">{route.id}</div>
                  <div className="text-xs text-muted-foreground">{route.address}</div>
                </Card>
              </li>
            ))}
          </ol>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Button className="flex-1 btn-hover">
            <Map className="w-4 h-4 mr-2" />
            Start Route
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
