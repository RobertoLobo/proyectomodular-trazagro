"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("TrazAgro global error:", error)
  }, [error])

  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ maxWidth: "24rem", textAlign: "center" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
              Algo salió mal
            </h2>
            <p style={{ color: "#666", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              Ocurrió un error crítico. Por favor recarga la página.
            </p>
            <button
              onClick={reset}
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "9999px",
                backgroundColor: "#4a9e5c",
                color: "white",
                border: "none",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: "500",
              }}
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
