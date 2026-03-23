"use client"

import { useEffect, useState } from "react"
import { Search, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { fetchAllProducers } from "@/lib/api"
import type { Producer } from "@/lib/types"
import { ProducerCard } from "./producer-card"

interface ExploreScreenProps {
  onSelectProducer: (producerId: string) => void
}

export function ExploreScreen({ onSelectProducer }: ExploreScreenProps) {
  const [producers, setProducers] = useState<Producer[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos")
  const [searchQuery, setSearchQuery] = useState<string>("")

  useEffect(() => {
    async function loadProducers() {
      const data = await fetchAllProducers()
      setProducers(data)
    }
    loadProducers()
  }, [])

  const categories = ["Todos", "Berries", "Frutas", "Verduras", "Orgánicos"]

  const filteredProducers = producers.filter((producer) => {
    const matchesCategory = selectedCategory === "Todos" || producer.category === selectedCategory
    const matchesSearch =
      searchQuery === "" ||
      producer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      producer.farmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      producer.location.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-lg mx-auto p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{"Explorar"}</h1>
            <Button variant="ghost" size="icon" className="rounded-full">
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar productores o productos..."
              className="pl-10 rounded-xl border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6 space-y-6 relative z-0">
        {/* Image carousel placeholder */}
        <div className="relative h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-secondary/20 via-accent/30 to-secondary/10">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-foreground">{"Productos Frescos"}</h2>
              <p className="text-sm text-muted-foreground">{"Directamente del productor"}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="rounded-full px-4 py-2 cursor-pointer whitespace-nowrap transition-all duration-200 hover:scale-105"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {filteredProducers.length}{" "}
            {filteredProducers.length === 1 ? "productor encontrado" : "productores encontrados"}
          </p>
          {filteredProducers.map((producer) => (
            <ProducerCard key={producer.id} producer={producer} onClick={() => onSelectProducer(producer.id)} />
          ))}
        </div>
      </div>
    </div>
  )
}
