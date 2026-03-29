import { useEffect, useRef, useState } from "react"
import { ChevronDown, RotateCcw, SlidersHorizontal } from "lucide-react"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import { DEFAULT_ADJUSTMENTS } from "~/components/image-editor-panel"
import type { Adjustments } from "~/components/image-editor-panel"

interface AdjustmentsPanelProps {
  adjustments: Adjustments
  onChange: (adjustments: Adjustments) => void
  onReset: () => void
}

const SLIDERS = [
  { key: "brightness" as const, label: "Brightness", min: 50, max: 150 },
  { key: "contrast" as const, label: "Contrast", min: 50, max: 150 },
  { key: "saturation" as const, label: "Saturation", min: 0, max: 200 },
]

export function AdjustmentsPanel({
  adjustments,
  onChange,
  onReset,
}: AdjustmentsPanelProps) {
  const handleChange = (key: keyof Adjustments, value: number) => {
    onChange({ ...adjustments, [key]: value })
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border p-3">
      {SLIDERS.map(({ key, label, min, max }) => (
        <div key={key} className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium">{label}</label>
            <span className="w-8 text-right text-xs text-muted-foreground tabular-nums">
              {adjustments[key]}
            </span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            value={adjustments[key]}
            onChange={(e) => handleChange(key, Number(e.target.value))}
            className="w-full accent-current"
          />
        </div>
      ))}

      <Button
        variant="ghost"
        size="xs"
        className="mt-1 self-end"
        onClick={onReset}
      >
        <RotateCcw className="mr-1 h-3 w-3" />
        Reset
      </Button>
    </div>
  )
}

export function AdjustmentsPopover({
  adjustments,
  onChange,
  onReset,
}: AdjustmentsPanelProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <Button variant="outline" size="sm" onClick={() => setOpen((p) => !p)}>
        <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
        Adjustments
        <ChevronDown
          className={cn(
            "ml-1.5 h-3 w-3 transition-transform duration-150",
            open && "rotate-180"
          )}
        />
      </Button>

      {open && (
        <div className="absolute top-full left-0 z-20 mt-1 w-64 rounded-md border bg-background p-3 shadow-md">
          <AdjustmentsPanel
            adjustments={adjustments}
            onChange={onChange}
            onReset={() => {
              onReset()
              setOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
