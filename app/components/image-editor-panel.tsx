import { forwardRef, useMemo, useRef } from "react"
import { Cropper } from "react-advanced-cropper"
import type { CropperRef } from "react-advanced-cropper"
import "react-advanced-cropper/dist/style.css"
import { RotateCcw, RotateCw } from "lucide-react"
import { cn } from "~/lib/utils"

export interface Adjustments {
  brightness: number
  contrast: number
  saturation: number
}

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
}

interface ImageEditorPanelProps {
  src: string
  adjustments: Adjustments
  aspectRatio?: number
  showGrid: boolean
  className?: string
}

export const ImageEditorPanel = forwardRef<CropperRef, ImageEditorPanelProps>(
  ({ src, adjustments, aspectRatio, showGrid, className }, ref) => {
    const filterString = useMemo(
      () =>
        `brightness(${adjustments.brightness / 100}) contrast(${adjustments.contrast / 100}) saturate(${adjustments.saturation / 100})`,
      [adjustments]
    )

    const isDragging = useRef(false)
    const lastX = useRef(0)

    const handleScrubMouseDown = (e: React.MouseEvent) => {
      e.preventDefault()
      isDragging.current = true
      lastX.current = e.clientX

      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging.current) return
        const delta = e.clientX - lastX.current
        lastX.current = e.clientX
        if (ref && "current" in ref && ref.current) {
          ref.current.rotateImage(delta * 0.25)
        }
      }

      const onMouseUp = () => {
        isDragging.current = false
        window.removeEventListener("mousemove", onMouseMove)
        window.removeEventListener("mouseup", onMouseUp)
      }

      window.addEventListener("mousemove", onMouseMove)
      window.addEventListener("mouseup", onMouseUp)
    }

    return (
      <div className={cn("flex min-h-0 flex-col gap-1.5", className)}>
        <Cropper
          ref={ref}
          src={src}
          stencilProps={{
            aspectRatio,
            grid: showGrid,
            gridClassName: "cropper-grid-red",
          }}
          backgroundWrapperProps={{
            style: { filter: filterString, transition: "filter 150ms" },
          }}
          className="min-h-0 flex-1 rounded-md bg-neutral-900"
        />

        {/* Rotation scrubber — drag left/right to rotate */}
        <div
          className="relative flex h-8 cursor-ew-resize items-center justify-center overflow-hidden rounded-md border bg-muted/30 select-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0px, transparent 9px, color-mix(in oklch, currentColor 12%, transparent) 9px, color-mix(in oklch, currentColor 12%, transparent) 10px)",
          }}
          onMouseDown={handleScrubMouseDown}
          title="Drag left/right to rotate"
        >
          <RotateCcw className="absolute left-2 h-3.5 w-3.5 text-muted-foreground/50" />
          <div className="h-4 w-0.5 rounded-full bg-primary" />
          <RotateCw className="absolute right-2 h-3.5 w-3.5 text-muted-foreground/50" />
        </div>
      </div>
    )
  }
)

ImageEditorPanel.displayName = "ImageEditorPanel"
