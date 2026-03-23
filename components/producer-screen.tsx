"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Bookmark, MapPin, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fetchProducerByBatchCode, fetchProducerById } from "@/lib/api"
import type { Producer, Batch } from "@/lib/types"
import { ProductCard } from "./product-card"

interface ProducerScreenProps {
  producerId: string | null
  batchCode: string | null
  onBack: () => void
}

type TabType = "details" | "products"

export function ProducerScreen({ producerId, batchCode, onBack }: ProducerScreenProps) {
  const [producer, setProducer] = useState<Producer | null>(null)
  const [batch, setBatch] = useState<Batch | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>("details")
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setNotFound(false)
      if (batchCode) {
        const result = await fetchProducerByBatchCode(batchCode)
        if (result) {
          setProducer(result.producer)
          setBatch(result.batch)
        } else {
          setNotFound(true)
        }
      } else if (producerId) {
        const prod = await fetchProducerById(producerId)
        if (prod) {
          setProducer(prod)
          setBatch(null)
        } else {
          setNotFound(true)
        }
      }
      setIsLoading(false)
    }
    loadData()
  }, [producerId, batchCode])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  if (notFound || !producer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6">
        <p className="text-muted-foreground text-center">
          {batchCode
            ? `No se encontró un productor con el código de lote "${batchCode}".`
            : "No se encontró el productor."}
        </p>
        <Button variant="outline" onClick={onBack} className="rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with blurred background */}
      <div className="relative h-36 bg-gradient-to-br from-primary/20 via-accent/30 to-primary/10">
        <div className="absolute inset-0 backdrop-blur-sm bg-primary/5" />
        <div className="relative h-full flex flex-col justify-between p-6">
          <button onClick={onBack} className="self-start text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-balance text-foreground">{producer.name}</h1>
            <p className="text-sm text-muted-foreground">{producer.farmName}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 mt-12 space-y-6 pb-24">
        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            variant={isSaved ? "default" : "outline"}
            size="lg"
            className="flex-1 rounded-xl"
            onClick={() => setIsSaved(!isSaved)}
          >
            <Bookmark className={`h-5 w-5 mr-2 ${isSaved ? "fill-current" : ""}`} />
            {isSaved ? "Guardado" : "Guardar"}
          </Button>
          <Button variant="outline" size="lg" className="flex-1 rounded-xl bg-transparent">
            <MapPin className="h-5 w-5 mr-2" />
            {"Ubicación"}
          </Button>
        </div>

        {/* Batch details if from QR scan */}
        {batch && (
          <Card className="p-6 space-y-4 rounded-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-lg">{batch.productName}</h2>
                <p className="text-sm text-muted-foreground">Lote: {batch.code}</p>
              </div>
              <Package className="h-6 w-6 text-primary" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">{"Fecha de Fabricación"}</p>
                <p className="font-medium">{new Date(batch.fabricationDate).toLocaleDateString("es-MX")}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{"Lugar de Fabricación"}</p>
                <p className="font-medium text-sm">{batch.fabricationPlace}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">{"Certificaciones"}</p>
              <div className="flex flex-wrap gap-2">
                {producer.certifications.map((cert) => (
                  <Badge key={cert} variant="secondary" className="rounded-full">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">{"Etiquetas"}</p>
              <div className="flex flex-wrap gap-2">
                {batch.tags.map((tag) => (
                  <Badge key={tag} className="rounded-full bg-primary/10 text-primary hover:bg-primary/20">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab("details")}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === "details" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {"Detalles"}
            {activeTab === "details" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === "products" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {"Más Productos"}
            {activeTab === "products" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        </div>

        {/* Tab content */}
        {activeTab === "details" ? (
          <Card className="p-6 space-y-4 rounded-2xl">
            <div>
              <h3 className="font-semibold mb-2">{"Ubicación"}</h3>
              <p className="text-sm text-muted-foreground">{producer.location}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{"Certificaciones"}</h3>
              <div className="flex flex-wrap gap-2">
                {producer.certifications.map((cert) => (
                  <Badge key={cert} variant="secondary" className="rounded-full">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {producer.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
