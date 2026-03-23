import { MapPin, ChevronRight, Award } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Producer } from "@/lib/types"

interface ProducerCardProps {
  producer: Producer
  onClick: () => void
}

export function ProducerCard({ producer, onClick }: ProducerCardProps) {
  const availableProducts = producer.products.filter((p) => p.available).length

  return (
    <Card
      onClick={onClick}
      className="p-4 rounded-2xl hover:shadow-lg transition-all duration-200 cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
    >
      <div className="flex items-start gap-4">
        {/* Icon/Avatar */}
        <div className="bg-gradient-to-br from-primary/20 to-accent/30 rounded-2xl p-4 flex-shrink-0">
          <div className="w-12 h-12 flex items-center justify-center text-2xl">🌱</div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{producer.name}</h3>
              <p className="text-sm text-muted-foreground truncate">{producer.farmName}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{producer.location}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="rounded-full">
              {availableProducts} productos
            </Badge>
            {producer.certifications.length > 0 && (
              <div className="flex items-center gap-1">
                <Award className="h-3 w-3 text-primary" />
                <Badge variant="outline" className="rounded-full border-primary/30 text-primary text-xs">
                  {producer.certifications.length} certificaciones
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
