# PRD: Before/After Photo Editor

## Problem Statement

Plastic surgery clinic staff need a way to produce consistent, polished before/after photo pairs for use in patient-facing slideshows and documentation. Source photos taken at different appointments are often inconsistent — varying in crop, orientation, brightness, and color balance. There is no existing tool in the clinic's workflow that lets staff quickly align and retouch two photos side by side, bake those adjustments into final exports, and do so without sending sensitive patient images to an external server.

---

## Solution

A single-page web application that runs entirely in the browser. Staff load two images (before and after) via drag-and-drop or file picker. Both images are displayed side by side with independent crop, zoom, pan, rotate, brightness, contrast, and saturation controls. A shared toolbar provides a toggleable rule-of-thirds grid (to match framing across both images), an aspect ratio lock with portrait-oriented presets, and a "Download Both" button that exports both images as JPEGs with all adjustments baked in — no data ever leaves the browser.

---

## User Stories

1. As a clinic staff member, I want to load a "before" photo by dragging it onto a drop zone, so that I can start editing without navigating a file dialog.
2. As a clinic staff member, I want to load a "before" photo via a "Browse" button, so that I have a fallback when drag-and-drop is inconvenient.
3. As a clinic staff member, I want to load an "after" photo independently of the "before" photo, so that each image can be swapped without affecting the other.
4. As a clinic staff member, I want both images displayed side by side simultaneously, so that I can visually compare and match their framing while editing.
5. As a clinic staff member, I want to crop the before image independently of the after image, so that each photo can be framed optimally given its unique composition.
6. As a clinic staff member, I want to zoom and pan within the crop frame on each image independently, so that I can precisely control which part of the image is included in the final crop.
7. As a clinic staff member, I want to rotate each image independently in 90° increments, so that I can quickly correct a photo taken in the wrong orientation.
8. As a clinic staff member, I want to fine-tune the rotation of each image by ±1° at a time, so that I can correct a slightly tilted photo.
9. As a clinic staff member, I want to adjust the brightness of each image independently, so that I can correct for different lighting conditions between appointments.
10. As a clinic staff member, I want to adjust the contrast of each image independently, so that I can make the subject stand out consistently across both photos.
11. As a clinic staff member, I want to adjust the saturation of each image independently, so that I can normalize skin tone differences caused by varying camera settings.
12. As a clinic staff member, I want to see a live preview of my brightness, contrast, and saturation adjustments on the cropper, so that I can judge the result before exporting.
13. As a clinic staff member, I want to toggle a rule-of-thirds grid overlay on both images simultaneously, so that I can align key facial features (e.g., eyes) to the same grid line on both photos.
14. As a clinic staff member, I want the grid toggle to apply to both images at once, so that I don't have to toggle it separately on each panel.
15. As a clinic staff member, I want to lock the aspect ratio of both croppers to the same preset, so that the exported before and after images have identical dimensions.
16. As a clinic staff member, I want to choose from portrait-oriented aspect ratio presets (1:1, 4:5, 3:4), so that I can quickly enforce a standard format without manually matching crop shapes.
17. As a clinic staff member, I want a free-form crop option, so that I have full flexibility when no standard ratio is appropriate.
18. As a clinic staff member, I want the aspect ratio lock to constrain both croppers simultaneously when enabled, so that both images are guaranteed to share the same output dimensions.
19. As a clinic staff member, I want to reset a single image's crop, rotation, and adjustments back to the original uploaded state, so that I can start over on one image without losing the work done on the other.
20. As a clinic staff member, I want to download both edited images in a single action, so that I don't have to export them one at a time.
21. As a clinic staff member, I want the downloaded files to be named "before.jpg" and "after.jpg", so that they are easy to identify when inserting into a slideshow.
22. As a clinic staff member, I want the brightness, contrast, and saturation adjustments to be baked into the exported JPEG, so that the final files look exactly like the on-screen preview in any viewer.
23. As a clinic staff member, I want the exported JPEGs to be high quality (90% compression), so that the images look sharp in printed or projected documentation.
24. As a clinic staff member, I want all image processing to happen in my browser without sending photos to a server, so that patient images are never transmitted externally and HIPAA compliance is maintained.
25. As a clinic staff member, I want to replace a loaded image by dropping a new file onto the same drop zone, so that I can correct a wrong photo selection without refreshing the page.

---

## Implementation Decisions

### Modules

**ImageDropZone**
Accepts a file via drag-and-drop or a browse button (file input, `accept="image/*"`). Converts the selected file to an object URL using `URL.createObjectURL` and emits it to the parent. Revokes the previous object URL when the image is replaced or the component unmounts to avoid memory leaks. Renders a placeholder state when no image is loaded and a thumbnail/replace state when one is.

**ImageEditorPanel**
Wraps the `react-advanced-cropper` `<Cropper>` component. Accepts the image source URL, a `showGrid` boolean, an optional `aspectRatio` number, and an adjustments object `{ brightness, contrast, saturation }`. Applies the CSS filter string (`brightness(x) contrast(x) saturate(x)`) to the cropper image via `imageClassName`. Applies a rule-of-thirds overlay (two horizontal + two vertical lines via CSS `linear-gradient`) via `stencilProps.previewClassName` when `showGrid` is true. Exposes a ref to the underlying cropper instance so the parent can call `getCanvas()` on export. Includes rotate controls (−90°, +90°, −1°, +1°) that call `cropperRef.rotateImage(angle)`.

**AdjustmentsPanel**
Renders three labeled range sliders: Brightness (50–150, default 100), Contrast (50–150, default 100), Saturation (0–200, default 100). Emits updated adjustment values to the parent on change. Includes a "Reset" button that resets the sliders to defaults and signals the parent to call `cropperRef.reset()` on the associated cropper.

**SharedToolbar**
Rendered once at the top of the page. Contains: a grid toggle button; a segmented aspect ratio selector (Free / 1:1 / 4:5 / 3:4) that is only interactive when the lock is enabled; a lock/unlock toggle that enables aspect ratio linking; and a "Download Both" button. All state it controls (showGrid, aspectRatio, lockAspect) lives in the parent route and is passed down as props.

**exportImage utility**
Pure function with signature `exportImage(canvas: HTMLCanvasElement, adjustments: Adjustments): Promise<Blob>`. Receives the cropped canvas from `cropperRef.getCanvas()`, creates an identically sized offscreen canvas, sets `ctx.filter` to the same filter string used in the live preview, draws the source canvas onto the offscreen canvas, and returns a JPEG blob at quality 0.9. This is the only module with unit tests.

### Architecture

- All state (both images' sources, adjustments, showGrid, aspectRatio, lockAspect) lives in the home route component.
- No global state manager — React `useState` is sufficient given the shallow component tree.
- Object URLs are the only representation of image data in memory; no base64 conversion.
- SSR is enabled in the React Router config but this app is fully client-interactive; no server loaders or actions are needed.
- Export is triggered by creating a temporary `<a>` element with `URL.createObjectURL(blob)` and programmatically clicking it. Both exports run in parallel via `Promise.all`.

### Aspect Ratio Values

| Preset | Numeric value passed to cropper |
|---|---|
| Free | `undefined` |
| 1:1 | `1` |
| 4:5 | `0.8` |
| 3:4 | `0.75` |

### CSS Filter Mapping

| Slider | Range | CSS function | Default |
|---|---|---|---|
| Brightness | 50–150 | `brightness(val/100)` | `1.0` |
| Contrast | 50–150 | `contrast(val/100)` | `1.0` |
| Saturation | 0–200 | `saturate(val/100)` | `1.0` |

---

## Testing Decisions

### What makes a good test
Tests should verify external behavior — given these inputs, produce this output — without asserting on internal implementation details (how the function is structured, what intermediate variables are used). Tests should be fast, deterministic, and require no browser environment.

### Modules to test

**`exportImage` utility**
This is the highest-risk module: if the CSS filter is not correctly applied to the canvas before export, the downloaded images will not match the on-screen preview. Because it is a pure function that takes a canvas and an adjustments object and returns a blob, it can be tested in isolation with a mocked canvas.

Test cases:
- Default adjustments (all at 100) → `ctx.filter` is set to `brightness(1) contrast(1) saturate(1)` before `drawImage` is called
- Non-default adjustments (e.g., brightness 130, contrast 80, saturation 150) → filter string matches expected CSS values
- Returns a Blob of type `image/jpeg`
- Output canvas dimensions match the input canvas dimensions

### Modules not tested in v1
ImageDropZone, ImageEditorPanel, AdjustmentsPanel, SharedToolbar — these are UI components whose correctness is best verified by manual browser testing. Canvas rendering behavior and the cropper library's internal state are not meaningful to unit test.

---

## Out of Scope

- User authentication or access control
- Saving or persisting edited images server-side
- Undo/redo history (per-image reset to original is the only recovery mechanism)
- Annotation or drawing tools (arrows, text, circles)
- A combined side-by-side export (single image with both photos merged)
- Mobile / touch-optimized layout (this is a desktop staff tool)
- EXIF metadata preservation in exports
- Batch processing of multiple patient pairs in one session
- Any network requests after the initial page load

---

## Further Notes

- The `react-advanced-cropper` library is in beta (`~` version pinning is recommended per its README). The API may change in future versions.
- "Exposure" as a concept does not exist as a distinct CSS filter. Brightness is the closest analog and is used in its place.
- The rule-of-thirds overlay is implemented via CSS `linear-gradient` rather than a canvas draw call, so it never appears in the exported image — it is a purely visual editing aid.
- Patient images are treated as sensitive data. No telemetry, analytics, or error-reporting services should be added to this application that could inadvertently capture or transmit image data.
