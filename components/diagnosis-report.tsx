"use client"

import { Leaf, ShieldAlert, ShieldCheck, ScanSearch } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CLASS_COLORS, DISEASE_CLASS_IDS, type DiagnosisResult } from "@/lib/disease-model"

interface DiagnosisReportProps {
  result: DiagnosisResult
}

interface DiseaseSummary {
  classId: number
  name: string
  label: string
  zones: number
  pixels: number
}

function summarize(result: DiagnosisResult): DiseaseSummary[] {
  const summaries = new Map<number, DiseaseSummary>()

  for (const region of result.regions) {
    if (!DISEASE_CLASS_IDS.includes(region.classId)) continue

    const existing = summaries.get(region.classId)
    if (existing) {
      existing.zones += 1
      existing.pixels += region.area
    } else {
      summaries.set(region.classId, {
        classId: region.classId,
        name: region.name,
        label: region.label,
        zones: 1,
        pixels: region.area,
      })
    }
  }

  return Array.from(summaries.values()).sort((a, b) => b.pixels - a.pixels)
}

export function DiagnosisReport({ result }: DiagnosisReportProps) {
  const diseases = summarize(result)
  const affected = Math.round(result.affectedRatio * 100)
  const totalPixels = result.maskSize * result.maskSize

  if (!result.hasFruit) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
        <div className="flex items-center gap-2 font-semibold">
          <ScanSearch className="h-5 w-5 text-muted-foreground" />
          {"Sin fresa detectada"}
        </div>
        <p className="text-sm text-muted-foreground">
          {"El modelo no encontró fruto en la imagen. Acércate más y vuelve a tomar la foto."}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 font-semibold">
          {result.hasDisease ? (
            <ShieldAlert className="h-5 w-5 text-destructive" />
          ) : (
            <ShieldCheck className="h-5 w-5 text-secondary" />
          )}
          {result.hasDisease ? "Enfermedad detectada" : "Fruto sano"}
        </div>
        <Badge variant={result.hasDisease ? "destructive" : "secondary"}>
          {affected}
          {"% afectado"}
        </Badge>
      </div>

      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={result.hasDisease ? "h-full bg-destructive" : "h-full bg-secondary"}
          style={{ width: `${Math.max(affected, result.hasDisease ? 4 : 100)}%` }}
        />
      </div>

      {diseases.length > 0 ? (
        <ul className="space-y-2">
          {diseases.map((disease) => {
            const [r, g, b] = CLASS_COLORS[disease.classId] ?? [255, 255, 255]
            const share = Math.round((disease.pixels / totalPixels) * 1000) / 10
            return (
              <li key={disease.classId} className="flex items-start gap-3">
                <span
                  className="mt-1 h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-tight">{disease.name}</p>
                  <p className="text-sm text-muted-foreground">{disease.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {disease.zones}
                    {disease.zones === 1 ? " zona · " : " zonas · "}
                    {share}
                    {"% de la imagen"}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Leaf className="h-4 w-4 text-secondary" />
          {"No se encontraron lesiones en el fruto segmentado."}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {"Inferencia local en "}
        {Math.round(result.inferenceMs)}
        {" ms"}
      </p>
    </div>
  )
}
