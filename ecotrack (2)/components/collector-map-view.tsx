"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, MapPin } from "lucide-react"

interface Pickup {
  id: string
  type: string
  address: string
  status: string
  coords?: [number, number]
}

interface CollectorMapViewProps {
  pickups?: Pickup[]
}

export function CollectorMapView({ pickups }: CollectorMapViewProps) {
  const defaultPickups: Pickup[] = [
    {
      id: "P001",
      type: "E-Waste - 15 kg",
      address: "123 Main St",
      status: "Assigned",
      coords: [51.505, -0.09],
    },
    {
      id: "P002",
      type: "Plastic - 30 kg",
      address: "456 Oak Ave",
      status: "Assigned",
      coords: [51.51, -0.1],
    },
    {
      id: "P003",
      type: "Metal - 50 kg",
      address: "789 Pine Rd",
      status: "Assigned",
      coords: [51.49, -0.08],
    },
  ]

  const displayPickups = pickups || defaultPickups

  return (
    <div className="h-[90vh] w-full rounded-lg overflow-hidden border border-border bg-gradient-to-br from-slate-50 to-slate-100">
      <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
        {/* Grid background */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="800" height="600" fill="url(#grid)" />

        {/* Pickup markers */}
        {displayPickups.map((pickup, index) => {
          // Calculate position based on index for demo purposes
          const x = 150 + index * 200
          const y = 200 + (index % 2) * 150

          return (
            <g key={pickup.id}>
              {/* Marker circle */}
              <circle cx={x} cy={y} r="20" fill="#10b981" opacity="0.2" />
              <circle cx={x} cy={y} r="12" fill="#10b981" />
              {/* Marker pin */}
              <path d={`M ${x} ${y + 12} L ${x - 8} ${y + 25} Q ${x} ${y + 30} ${x + 8} ${y + 25} Z`} fill="#10b981" />
              {/* Pickup ID label */}
              <text x={x} y={y} textAnchor="middle" dy="0.3em" className="text-xs font-bold fill-white" fontSize="12">
                {pickup.id}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Pickup details overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-border p-4 max-h-32 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {displayPickups.map((pickup) => (
            <Card key={pickup.id} className="border border-border">
              <CardContent className="pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{pickup.id}</span>
                  <Badge variant={pickup.status === "Assigned" ? "default" : "secondary"}>{pickup.status}</Badge>
                </div>
                <div className="flex items-start gap-2">
                  <Package className="w-3 h-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">{pickup.type}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3 h-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">{pickup.address}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
