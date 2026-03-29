import { useState, useCallback } from "react"

import { Upload } from "lucide-react"
import { cn } from "~/lib/utils"

interface ImageDropZoneProps {
  label: string
  src: string | null
  onFile: (file: File) => void
}

export function ImageDropZone({ label, src, onFile }: ImageDropZoneProps) {
  const [dragging, setDragging] = useState(false)

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return
      onFile(file)
    },
    [onFile]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => setDragging(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset input so same file can be re-selected
    e.target.value = ""
  }

  return (
    <div
      className={cn(
        "relative flex h-full min-h-48 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors",
        dragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/30",
        src && "border-solid"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept="image/*"
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        onChange={handleInputChange}
      />

      {src ? (
        <div className="flex flex-col items-center gap-1 p-3 text-center">
          <p className="text-xs text-muted-foreground">
            {label} loaded — drop or click to replace
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 p-6 text-center">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">
            Drag & drop or click to browse
          </p>
        </div>
      )}
    </div>
  )
}
