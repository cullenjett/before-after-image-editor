import { useRef, useState, useCallback, useEffect } from "react"
import type { CropperRef } from "react-advanced-cropper"
import { Download, X } from "lucide-react"
import { ImageDropZone } from "~/components/image-drop-zone"
import {
  ImageEditorPanel,
  DEFAULT_ADJUSTMENTS,
  type Adjustments,
} from "~/components/image-editor-panel"
import { AdjustmentsPopover } from "~/components/adjustments-panel"
import {
  SharedToolbar,
  type AspectRatioPreset,
} from "~/components/shared-toolbar"
import { PreviewModal } from "~/components/preview-modal"
import { Button } from "~/components/ui/button"
import { exportImage, downloadBlob, appendCropped } from "~/lib/export"

interface ImageState {
  src: string | null
  filename: string
  adjustments: Adjustments
}

const defaultImageState = (): ImageState => ({
  src: null,
  filename: "",
  adjustments: { ...DEFAULT_ADJUSTMENTS },
})

export default function Home() {
  const [before, setBefore] = useState<ImageState>(defaultImageState)
  const [after, setAfter] = useState<ImageState>(defaultImageState)
  const [showGrid, setShowGrid] = useState(true)
  const [lockAspect, setLockAspect] = useState(true)
  const [aspectRatio, setAspectRatio] = useState<AspectRatioPreset>(0.876)

  const beforeRef = useRef<CropperRef>(null)
  const afterRef = useRef<CropperRef>(null)
  const beforeUrlRef = useRef<string | null>(null)
  const afterUrlRef = useRef<string | null>(null)
  const previewUrlsRef = useRef<{ before: string; after: string } | null>(null)
  const [previewSrcs, setPreviewSrcs] = useState<{
    before: string
    after: string
  } | null>(null)

  useEffect(() => {
    return () => {
      if (beforeUrlRef.current) URL.revokeObjectURL(beforeUrlRef.current)
      if (afterUrlRef.current) URL.revokeObjectURL(afterUrlRef.current)
    }
  }, [])

  const handleBeforeFile = useCallback((file: File) => {
    if (beforeUrlRef.current) URL.revokeObjectURL(beforeUrlRef.current)
    const src = URL.createObjectURL(file)
    beforeUrlRef.current = src
    setBefore((prev) => ({ ...prev, src, filename: file.name }))
  }, [])

  const handleAfterFile = useCallback((file: File) => {
    if (afterUrlRef.current) URL.revokeObjectURL(afterUrlRef.current)
    const src = URL.createObjectURL(file)
    afterUrlRef.current = src
    setAfter((prev) => ({ ...prev, src, filename: file.name }))
  }, [])

  const handleBeforeClear = () => {
    if (beforeUrlRef.current) {
      URL.revokeObjectURL(beforeUrlRef.current)
      beforeUrlRef.current = null
    }
    setBefore(defaultImageState())
  }

  const handleAfterClear = () => {
    if (afterUrlRef.current) {
      URL.revokeObjectURL(afterUrlRef.current)
      afterUrlRef.current = null
    }
    setAfter(defaultImageState())
  }

  const handleBeforeReset = () => {
    setBefore((prev) => ({ ...prev, adjustments: { ...DEFAULT_ADJUSTMENTS } }))
    beforeRef.current?.reset()
  }

  const handleAfterReset = () => {
    setAfter((prev) => ({ ...prev, adjustments: { ...DEFAULT_ADJUSTMENTS } }))
    afterRef.current?.reset()
  }

  const handleBeforeDownload = async () => {
    const canvas = beforeRef.current?.getCanvas()
    if (!canvas) return
    const blob = await exportImage(canvas, before.adjustments)
    downloadBlob(blob, appendCropped(before.filename))
  }

  const handleAfterDownload = async () => {
    const canvas = afterRef.current?.getCanvas()
    if (!canvas) return
    const blob = await exportImage(canvas, after.adjustments)
    downloadBlob(blob, appendCropped(after.filename))
  }

  const handleDownloadBoth = async () => {
    const beforeCanvas = beforeRef.current?.getCanvas()
    const afterCanvas = afterRef.current?.getCanvas()
    if (!beforeCanvas || !afterCanvas) return
    const [beforeBlob, afterBlob] = await Promise.all([
      exportImage(beforeCanvas, before.adjustments),
      exportImage(afterCanvas, after.adjustments),
    ])
    downloadBlob(beforeBlob, appendCropped(before.filename))
    downloadBlob(afterBlob, appendCropped(after.filename))
  }

  const handlePreview = async () => {
    const beforeCanvas = beforeRef.current?.getCanvas()
    const afterCanvas = afterRef.current?.getCanvas()
    if (!beforeCanvas || !afterCanvas) return
    const [beforeBlob, afterBlob] = await Promise.all([
      exportImage(beforeCanvas, before.adjustments),
      exportImage(afterCanvas, after.adjustments),
    ])
    if (previewUrlsRef.current) {
      URL.revokeObjectURL(previewUrlsRef.current.before)
      URL.revokeObjectURL(previewUrlsRef.current.after)
    }
    const srcs = {
      before: URL.createObjectURL(beforeBlob),
      after: URL.createObjectURL(afterBlob),
    }
    previewUrlsRef.current = srcs
    setPreviewSrcs(srcs)
  }

  const handleClosePreview = () => {
    if (previewUrlsRef.current) {
      URL.revokeObjectURL(previewUrlsRef.current.before)
      URL.revokeObjectURL(previewUrlsRef.current.after)
      previewUrlsRef.current = null
    }
    setPreviewSrcs(null)
  }

  const handleToggleLock = () => {
    setLockAspect((prev) => !prev)
    if (lockAspect) {
      setAspectRatio(undefined)
    }
  }

  const resolvedAspectRatio = lockAspect ? aspectRatio : undefined

  return (
    <div className="flex h-svh flex-col gap-4 overflow-hidden p-4">
      <header className="flex items-center gap-2">
        <h1 className="text-lg font-semibold">Before & After Editor</h1>
      </header>

      <SharedToolbar
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid((p) => !p)}
        lockAspect={lockAspect}
        onToggleLock={handleToggleLock}
        aspectRatio={aspectRatio}
        onAspectRatioChange={setAspectRatio}
        onDownloadBoth={handleDownloadBoth}
        canDownloadBoth={!!before.src && !!after.src}
        onPreview={handlePreview}
        canPreview={!!before.src && !!after.src}
      />

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-4 overflow-hidden">
        {/* Before column */}
        <div className="flex h-full flex-col gap-2 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-sm font-medium">Before</h2>
              {before.filename && (
                <p className="truncate text-xs text-muted-foreground">
                  {before.filename}
                </p>
              )}
            </div>
            {before.src && (
              <div className="flex items-center gap-1.5">
                <AdjustmentsPopover
                  adjustments={before.adjustments}
                  onChange={(adjustments) =>
                    setBefore((prev) => ({ ...prev, adjustments }))
                  }
                  onReset={handleBeforeReset}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBeforeDownload}
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Download
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleBeforeClear}
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {!before.src ? (
            <ImageDropZone
              label="Before Photo"
              src={before.src}
              onFile={handleBeforeFile}
            />
          ) : (
            <ImageEditorPanel
              ref={beforeRef}
              src={before.src}
              adjustments={before.adjustments}
              aspectRatio={resolvedAspectRatio}
              showGrid={showGrid}
              className="min-h-0 flex-1"
            />
          )}
        </div>

        {/* After column */}
        <div className="flex h-full flex-col gap-2 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-sm font-medium">After</h2>
              {after.filename && (
                <p className="truncate text-xs text-muted-foreground">
                  {after.filename}
                </p>
              )}
            </div>
            {after.src && (
              <div className="flex items-center gap-1.5">
                <AdjustmentsPopover
                  adjustments={after.adjustments}
                  onChange={(adjustments) =>
                    setAfter((prev) => ({ ...prev, adjustments }))
                  }
                  onReset={handleAfterReset}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAfterDownload}
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Download
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleAfterClear}
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {!after.src ? (
            <ImageDropZone
              label="After Photo"
              src={after.src}
              onFile={handleAfterFile}
            />
          ) : (
            <ImageEditorPanel
              ref={afterRef}
              src={after.src}
              adjustments={after.adjustments}
              aspectRatio={resolvedAspectRatio}
              showGrid={showGrid}
              className="min-h-0 flex-1"
            />
          )}
        </div>
      </div>

      {previewSrcs && (
        <PreviewModal
          beforeSrc={previewSrcs.before}
          afterSrc={previewSrcs.after}
          onClose={handleClosePreview}
        />
      )}
    </div>
  )
}
