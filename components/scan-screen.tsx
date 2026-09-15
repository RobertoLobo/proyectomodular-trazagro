"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Camera, QrCode, ImagePlus, RotateCcw, Loader2, AlertTriangle, PackageSearch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DiagnosisReport } from "@/components/diagnosis-report"
import { decodeQrFromCanvas, normalizeBatchCode } from "@/lib/qr-scanner"
import { diagnoseImage, loadDiseaseModel, renderDiagnosisOverlay, type DiagnosisResult } from "@/lib/disease-model"

type ScanPhase = "idle" | "camera" | "processing" | "result"
type ModelPhase = "idle" | "loading" | "ready" | "error"

interface ScanScreenProps {
  onScanComplete: (batchCode: string) => void
}

const CAPTURE_MAX_SIDE = 1280

export function ScanScreen({ onScanComplete }: ScanScreenProps) {
  const [phase, setPhase] = useState<ScanPhase>("idle")
  const [modelPhase, setModelPhase] = useState<ModelPhase>("idle")
  const [modelProgress, setModelProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [batchCode, setBatchCode] = useState<string | null>(null)
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setModelPhase("loading")

    loadDiseaseModel((fraction) => {
      if (!cancelled) setModelProgress(fraction)
    })
      .then(() => {
        if (!cancelled) setModelPhase("ready")
      })
      .catch(() => {
        if (!cancelled) setModelPhase("error")
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => stopCamera, [stopCamera])

  const getCaptureCanvas = useCallback(() => {
    if (!captureCanvasRef.current) {
      captureCanvasRef.current = document.createElement("canvas")
    }
    return captureCanvasRef.current
  }, [])

  const startCamera = useCallback(async () => {
    setCameraError(null)
    setStatusMessage(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      })
      streamRef.current = stream
      setPhase("camera")

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => undefined)
      }
    } catch {
      setPhase("idle")
      setCameraError("No se pudo abrir la cámara. Concede el permiso o sube una foto desde la galería.")
    }
  }, [])

  const analyzeCanvas = useCallback(
    async (canvas: HTMLCanvasElement) => {
      setPhase("processing")
      setStatusMessage("Leyendo código QR...")

      let decoded: string | null = null
      try {
        decoded = await decodeQrFromCanvas(canvas)
      } catch {
        decoded = null
      }

      const code = decoded ? normalizeBatchCode(decoded) : null
      setBatchCode(code && code.length > 0 ? code : null)

      setStatusMessage("Analizando enfermedades...")
      let result: DiagnosisResult | null = null
      try {
        result = await diagnoseImage(canvas)
        setModelPhase("ready")
      } catch {
        setModelPhase("error")
        setStatusMessage(null)
      }

      setDiagnosis(result)

      const overlay = overlayCanvasRef.current ?? document.createElement("canvas")
      overlayCanvasRef.current = overlay

      if (result) {
        renderDiagnosisOverlay(overlay, canvas, canvas.width, canvas.height, result)
        setPreviewUrl(overlay.toDataURL("image/jpeg", 0.9))
      } else {
        setPreviewUrl(canvas.toDataURL("image/jpeg", 0.9))
      }

      setStatusMessage(null)
      setPhase("result")
    },
    [],
  )

  const capturePhoto = useCallback(async () => {
    const video = videoRef.current
    if (!video || video.videoWidth === 0) return

    const scale = Math.min(1, CAPTURE_MAX_SIDE / Math.max(video.videoWidth, video.videoHeight))
    const canvas = getCaptureCanvas()
    canvas.width = Math.round(video.videoWidth * scale)
    canvas.height = Math.round(video.videoHeight * scale)

    const context = canvas.getContext("2d", { willReadFrequently: true })
    if (!context) return

    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    stopCamera()
    await analyzeCanvas(canvas)
  }, [analyzeCanvas, getCaptureCanvas, stopCamera])

  const handleFile = useCallback(
    async (file: File) => {
      const bitmapUrl = URL.createObjectURL(file)
      const image = new Image()
      image.decoding = "async"

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve()
        image.onerror = () => reject(new Error("image"))
        image.src = bitmapUrl
      }).catch(() => undefined)

      if (image.naturalWidth === 0) {
        URL.revokeObjectURL(bitmapUrl)
        setCameraError("No se pudo leer la imagen seleccionada.")
        return
      }

      const scale = Math.min(1, CAPTURE_MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight))
      const canvas = getCaptureCanvas()
      canvas.width = Math.round(image.naturalWidth * scale)
      canvas.height = Math.round(image.naturalHeight * scale)

      const context = canvas.getContext("2d", { willReadFrequently: true })
      if (context) {
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        stopCamera()
        await analyzeCanvas(canvas)
      }

      URL.revokeObjectURL(bitmapUrl)
    },
    [analyzeCanvas, getCaptureCanvas, stopCamera],
  )

  const reset = useCallback(() => {
    setPhase("idle")
    setBatchCode(null)
    setDiagnosis(null)
    setPreviewUrl(null)
    setStatusMessage(null)
    setCameraError(null)
  }, [])

  const isBusy = phase === "processing"

  return (
    <div className="flex flex-col items-center p-6 overflow-y-auto" style={{ height: "calc(100vh - 5rem)" }}>
      <div className="w-full max-w-sm space-y-5 pb-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-balance">{"Escanea y diagnostica"}</h1>
          <p className="text-muted-foreground">
            {"Una sola foto lee el código QR del lote y revisa la sanidad del fruto"}
          </p>
        </div>

        <div className="relative aspect-square w-full max-w-[340px] mx-auto">
          <div className="absolute inset-0 rounded-3xl border-4 border-secondary/30 overflow-hidden bg-muted">
            {phase === "camera" ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            ) : previewUrl ? (
              <img src={previewUrl} alt="Resultado del análisis" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted via-accent/10 to-muted">
                {isBusy ? (
                  <Loader2 className="h-20 w-20 text-secondary animate-spin" />
                ) : (
                  <Camera className="h-24 w-24 text-muted-foreground/40" />
                )}
              </div>
            )}
          </div>

          <div className="absolute -top-4 -right-4 bg-secondary text-secondary-foreground rounded-full p-4 shadow-lg">
            {isBusy ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
          </div>

          <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-secondary rounded-tl-xl" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-secondary rounded-tr-xl" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-secondary rounded-bl-xl" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-secondary rounded-br-xl" />
        </div>

        {modelPhase === "loading" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
            {"Cargando modelo "}
            {Math.round(modelProgress * 100)}
            {"%"}
          </div>
        )}

        {modelPhase === "error" && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">
            <AlertTriangle className="h-4 w-4 mt-0.5 text-destructive shrink-0" />
            {"No se pudo cargar el modelo de diagnóstico. La lectura de QR sigue disponible."}
          </div>
        )}

        {cameraError && (
          <div className="flex items-start gap-2 rounded-xl border border-border bg-muted p-3 text-sm">
            <AlertTriangle className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            {cameraError}
          </div>
        )}

        {statusMessage && <p className="text-center text-sm text-muted-foreground">{statusMessage}</p>}

        {phase === "result" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-semibold">
                  <QrCode className="h-5 w-5 text-secondary" />
                  {"Código de lote"}
                </div>
                {batchCode ? (
                  <Badge variant="secondary" className="text-sm">
                    {batchCode}
                  </Badge>
                ) : (
                  <Badge variant="outline">{"No detectado"}</Badge>
                )}
              </div>

              {batchCode ? (
                <Button
                  onClick={() => onScanComplete(batchCode)}
                  className="w-full rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                >
                  <PackageSearch className="h-4 w-4" />
                  {"Ver trazabilidad del lote"}
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {"No se encontró un código QR en la foto. El diagnóstico del fruto sí se realizó."}
                </p>
              )}
            </div>

            {diagnosis && <DiagnosisReport result={diagnosis} />}
          </div>
        )}

        <div className="space-y-3">
          {phase === "camera" ? (
            <Button
              onClick={capturePhoto}
              size="lg"
              className="w-full rounded-full text-lg py-6 shadow-lg bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              <Camera className="h-5 w-5" />
              {"Tomar Foto"}
            </Button>
          ) : phase === "result" ? (
            <Button
              onClick={reset}
              size="lg"
              variant="outline"
              className="w-full rounded-full text-lg py-6"
            >
              <RotateCcw className="h-5 w-5" />
              {"Nueva captura"}
            </Button>
          ) : (
            <Button
              onClick={startCamera}
              disabled={isBusy}
              size="lg"
              className="w-full rounded-full text-lg py-6 shadow-lg bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              <Camera className="h-5 w-5" />
              {isBusy ? "Analizando..." : "Abrir cámara"}
            </Button>
          )}

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isBusy}
            variant="ghost"
            className="w-full rounded-full text-muted-foreground"
          >
            <ImagePlus className="h-4 w-4" />
            {"Usar una foto de la galería"}
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ""
              if (file) void handleFile(file)
            }}
          />
        </div>
      </div>
    </div>
  )
}
