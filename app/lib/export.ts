import type { Adjustments } from "~/components/image-editor-panel"

export type ExportFormat = "webp" | "jpg"

const MIME: Record<ExportFormat, string> = {
  webp: "image/webp",
  jpg: "image/jpeg",
}

export function getExportFilename(
  filename: string,
  suffix: string,
  format: ExportFormat
): string {
  const dot = filename.lastIndexOf(".")
  const base = dot === -1 ? filename : filename.slice(0, dot)
  return `${base}${suffix}.${format}`
}

export function buildFilterString(adjustments: Adjustments): string {
  return `brightness(${adjustments.brightness / 100}) contrast(${adjustments.contrast / 100}) saturate(${adjustments.saturation / 100})`
}

export async function exportImage(
  canvas: HTMLCanvasElement,
  adjustments: Adjustments,
  format: ExportFormat = "webp"
): Promise<Blob> {
  const offscreen = document.createElement("canvas")
  offscreen.width = canvas.width
  offscreen.height = canvas.height

  const ctx = offscreen.getContext("2d")
  if (!ctx) throw new Error("Could not get 2d context")

  ctx.filter = buildFilterString(adjustments)
  ctx.drawImage(canvas, 0, 0)

  return new Promise<Blob>((resolve, reject) => {
    offscreen.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error("Failed to create blob from canvas"))
      },
      MIME[format],
      1
    )
  })
}

export async function exportCombined(
  beforeCanvas: HTMLCanvasElement,
  afterCanvas: HTMLCanvasElement,
  beforeAdjustments: Adjustments,
  afterAdjustments: Adjustments,
  format: ExportFormat = "webp"
): Promise<Blob> {
  const targetHeight = Math.max(beforeCanvas.height, afterCanvas.height)
  const beforeW = Math.round(
    beforeCanvas.width * (targetHeight / beforeCanvas.height)
  )
  const afterW = Math.round(
    afterCanvas.width * (targetHeight / afterCanvas.height)
  )

  const offscreen = document.createElement("canvas")
  offscreen.width = beforeW + afterW
  offscreen.height = targetHeight

  const ctx = offscreen.getContext("2d")
  if (!ctx) throw new Error("Could not get 2d context")

  ctx.filter = buildFilterString(beforeAdjustments)
  ctx.drawImage(beforeCanvas, 0, 0, beforeW, targetHeight)

  ctx.filter = buildFilterString(afterAdjustments)
  ctx.drawImage(afterCanvas, beforeW, 0, afterW, targetHeight)

  return new Promise<Blob>((resolve, reject) => {
    offscreen.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error("Failed to create blob from canvas"))
      },
      MIME[format],
      1
    )
  })
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
