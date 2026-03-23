import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-xl font-bold">Página no encontrada</h2>
          <p className="text-muted-foreground text-sm">
            La página que buscas no existe o fue movida.
          </p>
        </div>
        <Button asChild className="rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  )
}
