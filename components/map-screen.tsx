"use client"

import { useEffect, useState } from "react"
import { MapPin } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fetchNearbyStores } from "@/lib/api"
import type { Location } from "@/lib/types"
import { LocationCard } from "./location-card"

export function MapScreen() {
  const [locations, setLocations] = useState<Location[]>([])

  useEffect(() => {
    async function loadLocations() {
      const data = await fetchNearbyStores()
      setLocations(data)
    }
    loadLocations()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-80 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(/map-background.png)`,
          }}
        />

        {/* Blur overlay to make it decorative */}
        <div className="absolute inset-0 backdrop-blur-[2px] bg-accent/10" />

        {/* Content overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center space-y-3">
            <div className="bg-secondary text-secondary-foreground rounded-full p-4 inline-block shadow-lg">
              <MapPin className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground drop-shadow-sm">{"Guadalajara, Jalisco"}</h2>
              <p className="text-sm text-foreground/80 drop-shadow-sm">{"Tu ubicación actual"}</p>
            </div>
          </div>
        </div>

        <div className="absolute top-16 left-12 bg-primary text-primary-foreground rounded-full p-2 shadow-lg z-10 animate-bounce">
          <MapPin className="h-4 w-4" />
        </div>
        <div
          className="absolute top-28 right-16 bg-primary text-primary-foreground rounded-full p-2 shadow-lg z-10 animate-bounce"
          style={{ animationDelay: "0.2s" }}
        >
          <MapPin className="h-4 w-4" />
        </div>
        <div
          className="absolute bottom-20 left-20 bg-primary text-primary-foreground rounded-full p-2 shadow-lg z-10 animate-bounce"
          style={{ animationDelay: "0.4s" }}
        >
          <MapPin className="h-4 w-4" />
        </div>
        <div
          className="absolute top-40 left-1/2 bg-secondary text-secondary-foreground rounded-full p-2 shadow-lg z-10 animate-bounce"
          style={{ animationDelay: "0.6s" }}
        >
          <MapPin className="h-5 w-5" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6 space-y-4 pb-24">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{"Cerca de ti"}</h2>
          <Badge variant="secondary" className="rounded-full">
            {locations.length} lugares
          </Badge>
        </div>

        {/* Horizontal scroll of locations */}
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
          {locations.map((location) => (
            <div key={location.id} className="flex-shrink-0 w-72">
              <LocationCard location={location} />
            </div>
          ))}
        </div>

        {/* Vertical list */}
        <div className="space-y-3 pt-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{"Todos los lugares"}</h3>
          {locations.map((location) => (
            <Card key={location.id} className="p-4 rounded-xl hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="bg-secondary/20 text-primary rounded-full p-2">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{location.name}</h4>
                    <p className="text-sm text-muted-foreground capitalize">{location.type.replaceAll("_", " ")}</p>
                  </div>
                </div>
                <Badge variant="outline" className="rounded-full">
                  {location.distanceKm} km
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
