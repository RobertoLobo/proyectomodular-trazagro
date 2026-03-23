"use client"

import { QrCode, Compass, Map, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  currentScreen: "scan" | "explore" | "map" | "about"
  onNavigate: (screen: "scan" | "explore" | "map" | "about") => void
}

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: "scan" as const, icon: QrCode, label: "Escanear" },
    { id: "explore" as const, icon: Compass, label: "Explorar" },
    { id: "map" as const, icon: Map, label: "Mapa" },
    { id: "about" as const, icon: Info, label: "Sobre Nosotros" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
      <div className="max-w-lg mx-auto grid grid-cols-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentScreen === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex flex-col items-center justify-center py-3 gap-1 transition-colors",
                isActive ? "text-secondary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
