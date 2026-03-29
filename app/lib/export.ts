import type { Adjustments } from "~/components/image-editor-panel"

export function appendCropped(filename: string): string {
  const dot = filename.lastIndexOf(".")
  if (dot === -1) return filename + "_cropped"
  return filename.slice(0, dot) + "_cropped" + filename.slice(dot)
}

export function buildFilterString(adjustments: Adjustments): string {
  return `brightness(${adjustments.brightness / 100}) contrast(${adjustments.contrast / 100}) saturate(${adjustments.saturation / 100})`
}

export async function exportImage(
  canvas: HTMLCanvasElement,
  adjustments: Adjustments
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
      "image/jpeg",
      0.9
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
