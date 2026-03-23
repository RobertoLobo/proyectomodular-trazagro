import { MapPin, Navigation } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Location } from "@/lib/types"

interface LocationCardProps {
  location: Location
}

export function LocationCard({ location }: LocationCardProps) {
  return (
    <Card className="p-4 rounded-2xl hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="bg-primary/10 rounded-xl p-2">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <Badge variant="outline" className="rounded-full">
            {location.distanceKm} km
          </Badge>
        </div>

        {/* Content */}
        <div>
          <h4 className="font-semibold text-lg">{location.name}</h4>
          <p className="text-sm text-muted-foreground capitalize">{location.type.replaceAll("_", " ")}</p>
        </div>

        {/* Action */}
        <Button variant="outline" className="w-full rounded-xl bg-transparent" size="sm">
          <Navigation className="h-4 w-4 mr-2" />
          {"Cómo llegar"}
        </Button>
      </div>
    </Card>
  )
}
