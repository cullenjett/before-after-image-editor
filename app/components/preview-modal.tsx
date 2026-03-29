import { useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "~/components/ui/button"

interface PreviewModalProps {
  beforeSrc: string
  afterSrc: string
  onClose: () => void
}

export function PreviewModal({
  beforeSrc,
  afterSrc,
  onClose,
}: PreviewModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 flex max-h-[92vh] max-w-[92vw] flex-col gap-3 rounded-lg bg-background p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Preview</h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex min-h-0 gap-3 overflow-hidden">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-xs text-muted-foreground">Before</p>
            <img
              src={beforeSrc}
              alt="Before"
              className="max-h-[80vh] w-full rounded object-contain"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-xs text-muted-foreground">After</p>
            <img
              src={afterSrc}
              alt="After"
              className="max-h-[80vh] w-full rounded object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
