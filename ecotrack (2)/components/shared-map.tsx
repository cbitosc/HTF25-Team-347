"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full" />,
})

const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false })

export interface MapLocation {
  id: string
  lat: number
  lng: number
  title: string
  description?: string
  type?: "pickup" | "ngo" | "collector" | "center"
  status?: string
}

interface SharedMapProps {
  locations: MapLocation[]
  center?: [number, number]
  zoom?: number
  showRoute?: boolean
  height?: string
}

export function SharedMap({ locations, center, zoom = 13, showRoute = false, height = "500px" }: SharedMapProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    // Fix Leaflet default icon paths
    const L = require("leaflet")
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    })
  }, [])

  if (!isMounted) {
    return <Skeleton className="w-full" style={{ height }} />
  }

  // Filter out invalid locations (0,0 coordinates)
  const validLocations = locations.filter(loc => loc.lat !== 0 && loc.lng !== 0)

  // Default center to first valid location or fallback to London
  const mapCenter = center || (validLocations.length > 0 ? [validLocations[0].lat, validLocations[0].lng] : [51.505, -0.09]) as [
    number,
    number,
  ]

  // Show message if no valid locations
  if (validLocations.length === 0 && locations.length > 0) {
    return (
      <div className="w-full rounded-lg overflow-hidden border border-border flex items-center justify-center bg-muted" style={{ height }}>
        <p className="text-muted-foreground">No valid location data available for mapping</p>
      </div>
    )
  }

  // Route coordinates for polyline (only valid locations)
  const routeCoordinates = showRoute
    ? (validLocations.map((loc) => [loc.lat, loc.lng]) as [number, number][])
    : []

  return (
    <div className="w-full rounded-lg overflow-hidden border border-border" style={{ height }}>
      {/* @ts-ignore - Dynamic import causes type issues */}
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        {/* @ts-ignore - Dynamic import causes type issues */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render markers */}
        {validLocations.map((location) => (
          // @ts-ignore - Dynamic import causes type issues
          <Marker key={location.id} position={[location.lat, location.lng]}>
            {/* @ts-ignore - Dynamic import causes type issues */}
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-sm mb-1">{location.title}</h3>
                {location.description && (
                  <p className="text-xs text-muted-foreground mb-1">{location.description}</p>
                )}
                {location.status && (
                  <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded">
                    {location.status}
                  </span>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render route if enabled */}
        {showRoute && routeCoordinates.length > 1 && (
          // @ts-ignore - Dynamic import causes type issues
          <Polyline positions={routeCoordinates} pathOptions={{ color: "#3b82f6", weight: 3, opacity: 0.7 }} />
        )}
      </MapContainer>
    </div>
  )
}
