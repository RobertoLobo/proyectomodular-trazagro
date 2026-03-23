"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("TrazAgro error boundary caught:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="mx-auto bg-destructive/10 rounded-full p-4 w-fit">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Algo salió mal</h2>
          <p className="text-muted-foreground text-sm">
            Ocurrió un error inesperado. Por favor intenta de nuevo.
          </p>
        </div>
        <Button
          onClick={reset}
          className="rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
        >
          Intentar de nuevo
        </Button>
      </div>
    </div>
  )
}
