import { MoreVertical, Package } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="p-4 rounded-2xl hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="bg-primary/10 rounded-xl p-3 flex-shrink-0">
          <Package className="h-6 w-6 text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold truncate">{product.name}</h4>
              <p className="text-sm text-muted-foreground">{product.description}</p>
            </div>
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-full">
              {product.packageSize}
            </Badge>
            {product.available ? (
              <Badge className="rounded-full bg-green-500/10 text-green-700 hover:bg-green-500/20">
                {"Disponible"}
              </Badge>
            ) : (
              <Badge variant="secondary" className="rounded-full bg-muted text-muted-foreground">
                {"No disponible"}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
