import { Download, Eye, Grid3x3, Lock, Unlock } from "lucide-react"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import type { ExportFormat } from "~/lib/export"

export const ASPECT_RATIO_PRESETS = [
  { label: "Free", value: undefined },
  { label: ".876", value: 0.876 },
  { label: "1:1", value: 1 },
  { label: "4:5", value: 0.8 },
  { label: "3:4", value: 0.75 },
] as const

export type AspectRatioPreset = (typeof ASPECT_RATIO_PRESETS)[number]["value"]

interface SharedToolbarProps {
  showGrid: boolean
  onToggleGrid: () => void
  lockAspect: boolean
  onToggleLock: () => void
  aspectRatio: AspectRatioPreset
  onAspectRatioChange: (value: AspectRatioPreset) => void
  onDownloadBoth: () => void
  canDownloadBoth: boolean
  onDownloadCombined: () => void
  canDownloadCombined: boolean
  exportFormat: ExportFormat
  onExportFormatChange: (format: ExportFormat) => void
  onPreview: () => void
  canPreview: boolean
}

export function SharedToolbar({
  showGrid,
  onToggleGrid,
  lockAspect,
  onToggleLock,
  aspectRatio,
  onAspectRatioChange,
  onDownloadBoth,
  canDownloadBoth,
  onDownloadCombined,
  canDownloadCombined,
  exportFormat,
  onExportFormatChange,
  onPreview,
  canPreview,
}: SharedToolbarProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border px-4 py-2">
      {/* Grid toggle */}
      <Button
        variant={showGrid ? "default" : "ghost"}
        size="sm"
        onClick={onToggleGrid}
        title="Toggle rule-of-thirds grid"
      >
        <Grid3x3 className="mr-1.5 h-4 w-4" />
        Grid
      </Button>

      <div className="h-5 w-px bg-border" />

      {/* Aspect ratio lock + presets */}
      <div className="flex items-center gap-2">
        <Button
          variant={lockAspect ? "default" : "ghost"}
          size="icon-sm"
          onClick={onToggleLock}
          title={lockAspect ? "Unlock aspect ratio" : "Lock aspect ratio"}
        >
          {lockAspect ? (
            <Lock className="h-4 w-4" />
          ) : (
            <Unlock className="h-4 w-4" />
          )}
        </Button>

        <div className="flex items-center rounded-md border">
          {ASPECT_RATIO_PRESETS.map(({ label, value }) => (
            <button
              key={label}
              disabled={!lockAspect}
              onClick={() => onAspectRatioChange(value)}
              className={cn(
                "px-2.5 py-1 text-xs transition-colors first:rounded-l-md last:rounded-r-md",
                "disabled:cursor-not-allowed disabled:opacity-40",
                lockAspect && aspectRatio === value
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Export format toggle */}
        <div className="flex items-center rounded-md border">
          {(["webp", "jpg"] as ExportFormat[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => onExportFormatChange(fmt)}
              className={cn(
                "px-2.5 py-1 text-xs transition-colors first:rounded-l-md last:rounded-r-md",
                exportFormat === fmt
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              {fmt.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-border" />

        <Button
          variant="outline"
          size="sm"
          onClick={onPreview}
          disabled={!canPreview}
        >
          <Eye className="mr-1.5 h-4 w-4" />
          Preview
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDownloadCombined}
          disabled={!canDownloadCombined}
        >
          <Download className="mr-1.5 h-4 w-4" />
          Combined
        </Button>
        <Button size="sm" onClick={onDownloadBoth} disabled={!canDownloadBoth}>
          <Download className="mr-1.5 h-4 w-4" />
          Download Both
        </Button>
      </div>
    </div>
  )
}
