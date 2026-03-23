"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import type { Screen } from "@/components/app-shell"

const SCREEN_ORDER: Exclude<Screen, "producer">[] = ["scan", "explore", "map", "about"]
const SWIPE_THRESHOLD = 0.65
const ANIMATION_DELAY = 150

export function useScreenNavigation(initialScreen: Screen = "scan") {
  const [currentScreen, setCurrentScreen] = useState<Screen>(initialScreen)
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | "none">("none")
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const navigateTo = useCallback((target: Screen) => {
    const effectiveCurrent = currentScreen === "producer" ? "explore" : currentScreen
    const currentIndex = SCREEN_ORDER.indexOf(effectiveCurrent as Exclude<Screen, "producer">)
    const targetIndex = SCREEN_ORDER.indexOf(target as Exclude<Screen, "producer">)

    if (targetIndex === -1 || currentIndex === -1) {
      setCurrentScreen(target)
      return
    }

    if (targetIndex > currentIndex) {
      setSlideDirection("left")
    } else if (targetIndex < currentIndex) {
      setSlideDirection("right")
    }

    setTimeout(() => {
      setCurrentScreen(target)
      setSlideDirection("none")
    }, ANIMATION_DELAY)
  }, [currentScreen])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback(() => {
    const swipeDistance = touchStartX.current - touchEndX.current
    const minSwipeDistance = window.innerWidth * SWIPE_THRESHOLD

    if (Math.abs(swipeDistance) < minSwipeDistance) return
    if (currentScreen === "producer") return

    const currentIndex = SCREEN_ORDER.indexOf(currentScreen as Exclude<Screen, "producer">)

    if (swipeDistance > 0 && currentIndex < SCREEN_ORDER.length - 1) {
      setSlideDirection("left")
      setTimeout(() => {
        setCurrentScreen(SCREEN_ORDER[currentIndex + 1])
        setSlideDirection("none")
      }, ANIMATION_DELAY)
    } else if (swipeDistance < 0 && currentIndex > 0) {
      setSlideDirection("right")
      setTimeout(() => {
        setCurrentScreen(SCREEN_ORDER[currentIndex - 1])
        setSlideDirection("none")
      }, ANIMATION_DELAY)
    }
  }, [currentScreen])

  return {
    currentScreen,
    slideDirection,
    navigateTo,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  }
}
