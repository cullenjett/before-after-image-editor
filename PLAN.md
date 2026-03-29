# Plan: Before/After Photo Editor

**TL;DR**: Single-page, fully client-side editor. Two images loaded side-by-side, each independently edited via `react-advanced-cropper` (crop/rotate/zoom/pan) + CSS filters (brightness/contrast/saturation). A shared toolbar handles grid toggle, aspect ratio lock with presets, and downloading both exported images.

---

## Decisions

- Client-side only — no server processing, no uploads, no auth (avoids HIPAA concerns)
- `react-advanced-cropper` for crop/zoom/pan/rotate
- CSS filters for brightness/contrast/saturation (baked into canvas on export)
- "Exposure" maps to Brightness slider (`brightness()`) — Saturation added as the third adjustment slider
- Side-by-side simultaneously, controls panel below each cropper
- Fully independent editing; shared aspect ratio lock toggle
- Aspect ratio presets: Free / 1:1 / 4:5 / 3:4 — applies to both croppers when locked
- Export: download both as separate JPEG files (quality 0.9), CSS filters baked into canvas
- Reset per image: restores all edits to original uploaded image
- Rule-of-thirds grid: CSS `linear-gradient` overlay via `stencilProps` className, toggled globally
- No undo/redo in v1

---

## Phases

### Phase 1 — Core Layout & Image Loading

1. Install `react-advanced-cropper`
2. Rewrite `app/routes/home.tsx` with two-column layout + shared toolbar header
3. Create `app/components/image-drop-zone.tsx` — drag-and-drop zone + "Browse" file input; emits `File` to parent; uses `URL.createObjectURL` (revoked on unmount/replace)
4. Wire up `before`/`after` state in `home.tsx`: `{ file, src, adjustments: { brightness, contrast, saturation } }`

### Phase 2 — Cropper Integration

5. Create `app/components/image-editor-panel.tsx` wrapping `<Cropper>` with:
   - `ref` forwarded up for canvas export
   - `stencilProps.previewClassName` conditionally applies a CSS class with `linear-gradient` rule-of-thirds lines when `showGrid` is true
   - `aspectRatio` prop from shared state (`undefined` = free-form)
   - CSS filter applied via `imageClassName` — maps adjustments to `filter: brightness(X) contrast(Y) saturate(Z)`
   - `rotateImage` enabled
6. Add rotate controls (−90°/+90° buttons, ±1° fine-tune) calling `cropperRef.current.rotateImage(angle)` — placed below cropper, above sliders

### Phase 3 — Adjustments Panel

7. Create `app/components/adjustments-panel.tsx` — three labeled sliders:
   - **Brightness**: 50–150 (default 100) → CSS `brightness(val/100)`
   - **Contrast**: 50–150 (default 100) → CSS `contrast(val/100)`
   - **Saturation**: 0–200 (default 100) → CSS `saturate(val/100)`
   - **Reset** button: resets sliders + calls `cropperRef.current.reset()`

> Note: "Exposure" maps to the Brightness slider — CSS filters don't have a distinct exposure control. Saturation is substituted as the third useful adjustment for skin tone consistency.

### Phase 4 — Shared Toolbar

8. Create `app/components/shared-toolbar.tsx` containing:
   - **Grid toggle** (lucide `Grid3x3`): toggles `showGrid` on both panels
   - **Aspect ratio selector**: segmented buttons — Free / 1:1 / 4:5 / 3:4 — active only when lock is on
   - **Lock toggle** (`Lock`/`Unlock` icon): enables linking; applying lock immediately constrains both croppers to the selected preset
   - **Download Both** button

### Phase 5 — Export

9. `exportImage(cropperRef, adjustments)`: call `getCanvas()`, create offscreen canvas, set `ctx.filter`, `drawImage`, return JPEG blob at quality 0.9
10. "Download Both" handler: runs export for both images in parallel → triggers two `<a download>` clicks → `before.jpg` + `after.jpg`

---

## Relevant Files

| File | Role |
|---|---|
| `app/routes/home.tsx` | Main page — all shared state (showGrid, aspectRatio, lockAspect, before/after image state) |
| `app/components/image-drop-zone.tsx` | New — drag-and-drop + file browse |
| `app/components/image-editor-panel.tsx` | New — Cropper + rotate controls + grid integration |
| `app/components/adjustments-panel.tsx` | New — brightness/contrast/saturation sliders + reset |
| `app/components/shared-toolbar.tsx` | New — grid toggle, aspect ratio presets, lock, download both |
| `app/components/ui/button.tsx` | Reuse for all buttons |
| `app/lib/utils.ts` | Reuse `cn()` for conditional classnames |

---

## Verification Checklist

- [ ] Both drop zones accept drag-and-drop and file picker
- [ ] Crop/rotate/zoom each image independently — no cross-contamination
- [ ] Aspect ratio lock + 4:5 preset — both croppers constrain simultaneously
- [ ] Grid toggle — lines appear/disappear on both at once
- [ ] Sliders update live preview on cropper image
- [ ] Reset restores cropper + sliders for that image only
- [ ] Download Both — two JPEGs download with crop + adjustments baked in
- [ ] DevTools Network tab shows zero image requests after page load (fully client-side)
