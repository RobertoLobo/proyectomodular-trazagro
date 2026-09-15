const QR_MAX_SIDE = 1024

export function normalizeBatchCode(raw: string): string {
  let value = raw.trim()

  try {
    const url = new URL(value)
    const fromQuery =
      url.searchParams.get("lote") ?? url.searchParams.get("batch") ?? url.searchParams.get("code")
    if (fromQuery) {
      value = fromQuery
    } else {
      const segments = url.pathname.split("/").filter(Boolean)
      if (segments.length > 0) value = segments[segments.length - 1]
    }
  } catch {
    const segments = value.split("/").filter(Boolean)
    if (segments.length > 1) value = segments[segments.length - 1]
  }

  return value.replace(/[^A-Za-z0-9-_]/g, "").toUpperCase()
}

function downscale(source: HTMLCanvasElement): HTMLCanvasElement {
  const largestSide = Math.max(source.width, source.height)
  if (largestSide <= QR_MAX_SIDE) return source

  const ratio = QR_MAX_SIDE / largestSide
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(source.width * ratio)
  canvas.height = Math.round(source.height * ratio)

  const context = canvas.getContext("2d", { willReadFrequently: true })
  if (!context) return source

  context.drawImage(source, 0, 0, canvas.width, canvas.height)
  return canvas
}

export async function decodeQrFromCanvas(source: HTMLCanvasElement): Promise<string | null> {
  const canvas = downscale(source)
  const context = canvas.getContext("2d", { willReadFrequently: true })
  if (!context) return null

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  const { default: jsQR } = await import("jsqr")

  const attempts: Array<"dontInvert" | "attemptBoth"> = ["dontInvert", "attemptBoth"]
  for (const inversionAttempts of attempts) {
    const result = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts })
    if (result?.data) return result.data
  }

  return null
}
