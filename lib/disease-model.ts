import type * as TF from "@tensorflow/tfjs"

export const MODEL_URL = "/models/fresas/model.json"
export const INPUT_SIZE = 128
export const MIN_REGION_AREA = 5

export const CLASS_NAMES: Record<number, string> = {
  0: "Fondo",
  1: "Fresa",
  2: "Anthracnose Fruit Rot",
  3: "Gray Mold",
  4: "Powdery Mildew Fruit",
}

export const CLASS_LABELS_ES: Record<number, string> = {
  1: "Fresa sana",
  2: "Antracnosis (pudrición del fruto)",
  3: "Moho gris (Botrytis)",
  4: "Cenicilla (oídio)",
}

export const DISEASE_CLASS_IDS = [2, 3, 4]

export const CLASS_COLORS: Record<number, [number, number, number]> = {
  1: [34, 197, 94],
  2: [239, 68, 68],
  3: [147, 51, 234],
  4: [234, 179, 8],
}

export interface DetectedRegion {
  classId: number
  name: string
  label: string
  area: number
  box: { x: number; y: number; width: number; height: number }
  centroid: { x: number; y: number }
}

export interface DiagnosisResult {
  maskSize: number
  mask: Uint8Array
  regions: DetectedRegion[]
  classPixels: Record<number, number>
  fruitPixels: number
  diseasedPixels: number
  affectedRatio: number
  hasFruit: boolean
  hasDisease: boolean
  inferenceMs: number
}

let tfPromise: Promise<typeof TF> | null = null
let modelPromise: Promise<TF.GraphModel> | null = null

async function getTf(): Promise<typeof TF> {
  if (!tfPromise) {
    tfPromise = import("@tensorflow/tfjs").then(async (tf) => {
      await tf.ready()
      return tf
    })
  }
  return tfPromise
}

export async function loadDiseaseModel(onProgress?: (fraction: number) => void): Promise<TF.GraphModel> {
  if (!modelPromise) {
    modelPromise = (async () => {
      const tf = await getTf()
      const model = await tf.loadGraphModel(MODEL_URL, { onProgress })
      const warmup = tf.zeros([1, INPUT_SIZE, INPUT_SIZE, 3])
      const output = model.predict(warmup) as TF.Tensor
      output.dispose()
      warmup.dispose()
      return model
    })().catch((error) => {
      modelPromise = null
      throw error
    })
  }
  return modelPromise
}

export function isModelLoaded(): boolean {
  return modelPromise !== null
}

function extractRegions(mask: Uint8Array, size: number): DetectedRegion[] {
  const visited = new Uint8Array(mask.length)
  const regions: DetectedRegion[] = []
  const stack: number[] = []

  for (let index = 0; index < mask.length; index++) {
    const classId = mask[index]
    if (classId === 0 || visited[index]) continue

    visited[index] = 1
    stack.length = 0
    stack.push(index)

    let area = 0
    let minX = size
    let minY = size
    let maxX = -1
    let maxY = -1
    let sumX = 0
    let sumY = 0

    while (stack.length > 0) {
      const current = stack.pop() as number
      const x = current % size
      const y = (current - x) / size

      area++
      sumX += x
      sumY += y
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y

      if (x > 0) {
        const left = current - 1
        if (!visited[left] && mask[left] === classId) {
          visited[left] = 1
          stack.push(left)
        }
      }
      if (x < size - 1) {
        const right = current + 1
        if (!visited[right] && mask[right] === classId) {
          visited[right] = 1
          stack.push(right)
        }
      }
      if (y > 0) {
        const up = current - size
        if (!visited[up] && mask[up] === classId) {
          visited[up] = 1
          stack.push(up)
        }
      }
      if (y < size - 1) {
        const down = current + size
        if (!visited[down] && mask[down] === classId) {
          visited[down] = 1
          stack.push(down)
        }
      }
    }

    if (area <= MIN_REGION_AREA) continue

    regions.push({
      classId,
      name: CLASS_NAMES[classId] ?? `Desconocida_${classId}`,
      label: CLASS_LABELS_ES[classId] ?? `Clase ${classId}`,
      area,
      box: { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 },
      centroid: { x: sumX / area, y: sumY / area },
    })
  }

  return regions.sort((a, b) => b.area - a.area)
}

export async function diagnoseImage(
  source: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | ImageData,
): Promise<DiagnosisResult> {
  const tf = await getTf()
  const model = await loadDiseaseModel()
  const startedAt = performance.now()

  const maskTensor = tf.tidy(() => {
    const pixels = tf.browser.fromPixels(source as HTMLCanvasElement)
    const resized = tf.image.resizeBilinear(pixels, [INPUT_SIZE, INPUT_SIZE])
    const normalized = tf.div(tf.cast(resized, "float32"), 255)
    const prediction = model.predict(tf.expandDims(normalized, 0)) as TF.Tensor
    return tf.squeeze(tf.argMax(prediction, -1)) as TF.Tensor2D
  })

  const raw = (await maskTensor.data()) as Int32Array
  maskTensor.dispose()

  const mask = new Uint8Array(raw.length)
  const classPixels: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 }

  for (let i = 0; i < raw.length; i++) {
    const value = raw[i]
    mask[i] = value
    classPixels[value] = (classPixels[value] ?? 0) + 1
  }

  const diseasedPixels = DISEASE_CLASS_IDS.reduce((total, id) => total + (classPixels[id] ?? 0), 0)
  const fruitPixels = (classPixels[1] ?? 0) + diseasedPixels
  const regions = extractRegions(mask, INPUT_SIZE)

  return {
    maskSize: INPUT_SIZE,
    mask,
    regions,
    classPixels,
    fruitPixels,
    diseasedPixels,
    affectedRatio: fruitPixels > 0 ? diseasedPixels / fruitPixels : 0,
    hasFruit: fruitPixels > 0,
    hasDisease: regions.some((region) => DISEASE_CLASS_IDS.includes(region.classId)),
    inferenceMs: performance.now() - startedAt,
  }
}

export function buildMaskCanvas(result: DiagnosisResult): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  canvas.width = result.maskSize
  canvas.height = result.maskSize

  const context = canvas.getContext("2d")
  if (!context) return canvas

  const imageData = context.createImageData(result.maskSize, result.maskSize)
  for (let i = 0; i < result.mask.length; i++) {
    const classId = result.mask[i]
    const offset = i * 4
    if (classId === 0) {
      imageData.data[offset + 3] = 0
      continue
    }
    const [r, g, b] = CLASS_COLORS[classId] ?? [255, 255, 255]
    imageData.data[offset] = r
    imageData.data[offset + 1] = g
    imageData.data[offset + 2] = b
    imageData.data[offset + 3] = 255
  }

  context.putImageData(imageData, 0, 0)
  return canvas
}

export function renderDiagnosisOverlay(
  target: HTMLCanvasElement,
  photo: CanvasImageSource,
  photoWidth: number,
  photoHeight: number,
  result: DiagnosisResult,
  maskOpacity = 0.4,
): void {
  const context = target.getContext("2d")
  if (!context) return

  target.width = photoWidth
  target.height = photoHeight

  context.clearRect(0, 0, photoWidth, photoHeight)
  context.drawImage(photo, 0, 0, photoWidth, photoHeight)

  const maskCanvas = buildMaskCanvas(result)
  context.save()
  context.imageSmoothingEnabled = false
  context.globalAlpha = maskOpacity
  context.drawImage(maskCanvas, 0, 0, photoWidth, photoHeight)
  context.restore()

  const scaleX = photoWidth / result.maskSize
  const scaleY = photoHeight / result.maskSize
  const fontSize = Math.max(14, Math.round(photoWidth * 0.028))

  context.lineWidth = Math.max(2, Math.round(photoWidth * 0.005))
  context.font = `600 ${fontSize}px system-ui, sans-serif`
  context.textBaseline = "top"

  for (const region of result.regions) {
    if (!DISEASE_CLASS_IDS.includes(region.classId)) continue

    const [r, g, b] = CLASS_COLORS[region.classId] ?? [255, 255, 255]
    const x = region.box.x * scaleX
    const y = region.box.y * scaleY
    const width = region.box.width * scaleX
    const height = region.box.height * scaleY

    context.strokeStyle = `rgb(${r}, ${g}, ${b})`
    context.strokeRect(x, y, width, height)

    const text = region.name
    const textWidth = context.measureText(text).width
    const labelY = y - fontSize - 6 >= 0 ? y - fontSize - 6 : y + height + 4

    context.fillStyle = `rgba(${r}, ${g}, ${b}, 0.85)`
    context.fillRect(x, labelY, textWidth + 12, fontSize + 6)
    context.fillStyle = "#ffffff"
    context.fillText(text, x + 6, labelY + 3)
  }
}
