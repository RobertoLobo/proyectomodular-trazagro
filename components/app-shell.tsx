"use client"

import { useState, useCallback } from "react"
import { ScanScreen } from "@/components/scan-screen"
import { ProducerScreen } from "@/components/producer-screen"
import { ExploreScreen } from "@/components/explore-screen"
import { MapScreen } from "@/components/map-screen"
import { AboutScreen } from "@/components/about-screen"
import { BottomNav } from "@/components/bottom-nav"
import { useScreenNavigation } from "@/hooks/use-screen-navigation"

export type Screen = "scan" | "explore" | "map" | "about" | "producer"

export function AppShell() {
  const [selectedProducerId, setSelectedProducerId] = useState<string | null>(null)
  const [selectedBatchCode, setSelectedBatchCode] = useState<string | null>(null)

  const {
    currentScreen,
    slideDirection,
    navigateTo,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useScreenNavigation()

  const handleScanComplete = useCallback((batchCode: string) => {
    setSelectedBatchCode(batchCode)
    navigateTo("producer")
  }, [navigateTo])

  const handleSelectProducer = useCallback((producerId: string) => {
    setSelectedProducerId(producerId)
    setSelectedBatchCode(null)
    navigateTo("producer")
  }, [navigateTo])

  const handleBackFromProducer = useCallback(() => {
    navigateTo("explore")
  }, [navigateTo])

  const getAnimationClass = () => {
    if (slideDirection === "left") return "animate-slide-out-left"
    if (slideDirection === "right") return "animate-slide-out-right"
    return "animate-slide-in"
  }

  const renderScreen = () => {
    const screenClass = getAnimationClass()

    switch (currentScreen) {
      case "scan":
        return (
          <div className={screenClass}>
            <ScanScreen onScanComplete={handleScanComplete} />
          </div>
        )
      case "explore":
        return (
          <div className={screenClass}>
            <ExploreScreen onSelectProducer={handleSelectProducer} />
          </div>
        )
      case "map":
        return (
          <div className={screenClass}>
            <MapScreen />
          </div>
        )
      case "about":
        return (
          <div className={screenClass}>
            <AboutScreen />
          </div>
        )
      case "producer":
        return (
          <div className={screenClass}>
            <ProducerScreen
              producerId={selectedProducerId}
              batchCode={selectedBatchCode}
              onBack={handleBackFromProducer}
            />
          </div>
        )
      default:
        return (
          <div className={screenClass}>
            <ScanScreen onScanComplete={handleScanComplete} />
          </div>
        )
    }
  }

  return (
    <main
      className="min-h-screen bg-background pb-20 overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {renderScreen()}
      <BottomNav
        currentScreen={currentScreen === "producer" ? "explore" : currentScreen}
        onNavigate={navigateTo}
      />
    </main>
  )
}
