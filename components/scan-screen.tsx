"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ScanScreenProps {
  onScanComplete: (batchCode: string) => void
}

export function ScanScreen({ onScanComplete }: ScanScreenProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  const handleScan = async () => {
    setIsScanning(true)

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }

      setTimeout(() => {
        setIsScanning(false)
        if (mediaStream) {
          mediaStream.getTracks().forEach((track) => track.stop())
        }
        const randomBatchCodes = ["2A47JK", "VRD9K2", "CTR4L8", "ORG5M3", "TRP7N9"]
        const randomCode = randomBatchCodes[Math.floor(Math.random() * randomBatchCodes.length)]
        onScanComplete(randomCode)
      }, 2000)
    } catch (error) {
      console.error("Camera access denied:", error)
      setTimeout(() => {
        setIsScanning(false)
        onScanComplete("2A47JK")
      }, 1500)
    }
  }

  return (
    <div
      className="flex flex-col items-center justify-center p-6 overflow-hidden"
      style={{ height: "calc(100vh - 5rem)" }}
    >
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-balance">{"Escanea el código QR"}</h1>
          <p className="text-muted-foreground">{"Conoce el origen de tus productos"}</p>
        </div>

        <div className="relative aspect-square w-full max-w-[340px] mx-auto">
          <div className="absolute inset-0 rounded-3xl border-4 border-secondary/30 overflow-hidden bg-muted">
            {isScanning && stream ? (
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted via-accent/10 to-muted">
                {isScanning ? (
                  <div className="animate-pulse">
                    <QrCode className="h-24 w-24 text-secondary" />
                  </div>
                ) : (
                  <Camera className="h-24 w-24 text-muted-foreground/40" />
                )}
              </div>
            )}
          </div>

          <div className="absolute -top-4 -right-4 bg-secondary text-secondary-foreground rounded-full p-4 shadow-lg">
            <Camera className="h-6 w-6" />
          </div>

          <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-secondary rounded-tl-xl" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-secondary rounded-tr-xl" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-secondary rounded-bl-xl" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-secondary rounded-br-xl" />
        </div>

        <Button
          onClick={handleScan}
          disabled={isScanning}
          size="lg"
          className="w-full rounded-full text-lg py-6 shadow-lg bg-secondary hover:bg-secondary/90 text-secondary-foreground"
        >
          {isScanning ? "Escaneando..." : "Tomar Foto"}
        </Button>
      </div>
    </div>
  )
}
