# HH Goa 2026 — V2 Implementation Doc
## Migrating Existing Codebase to Match `hh_goa_v2_upgraded.html`

---

## Context for the Agent

You have an **existing React + Vite codebase** (`task-01/`) with the following already built and marked complete:

```
src/
  components/
    Cropper.jsx         ← EXISTS, needs visual rework
    FormFields.jsx      ← EXISTS, needs full visual rework + new screens
    ResultScreen.jsx    ← EXISTS, needs full visual rework
    Uploader.jsx        ← EXISTS, needs visual rework
  hooks/
    index.js
    useCardRenderer.js  ← EXISTS, canvas logic — needs full rewrite for new card
    useImageProcessor.js ← EXISTS, keep logic, minor changes
  styles/
    tokens.css          ← EXISTS, full replacement with new design tokens
  utils/
    canvasHelpers.js    ← EXISTS, rewrite for new card
    imageUtils.js       ← EXISTS, keep as-is
    index.js
    titlesList.js       ← EXISTS, update list content
  App.jsx               ← EXISTS, add new screens to step machine
  index.css             ← EXISTS, replace all styles
  main.jsx              ← EXISTS, no changes needed
```

**What exists but is wrong:** The codebase implements the old design doc (dark purple card, simple layout). All logic plumbing (HEIC conversion, crop, state machine, download, share) is correct and must be preserved. Only the **visuals and card output** need to change.

**What is new:** 4 new screens need to be added to the step machine that did not exist before:
- Scanning / Loading screen (Screen 3)
- Artifact Back (Screen 5)
- PFP Avatar screen (Screen 7)
- Crop screen is now part of Upload flow, not a separate step

**The reference design** is `hh_goa_v2_upgraded.html` — a fully static single-file HTML with all 8 screens laid out vertically. Every CSS class, color token, font, SVG, and copy string in that file is the authoritative source of truth. When in doubt, copy exactly from that file.

---

## Design System — Extract From HTML (Apply These Everywhere)

### CSS Custom Properties — Replace `tokens.css` entirely

```css
:root {
  --red: #C8001E;
  --yellow: #F0C229;
  --pink: #E8407A;
  --green: #2A7A4B;
  --cream: #F5EDD8;
  --ink: #1A1008;
  --orange: #D4511A;
  --blue: #2B5FA0;
  --paper: #EDE4C8;
  --fade: #B8A882;
  --rust: #A83210;
  --teal: #1A7A6E;
  --lime: #8BC34A;
}
```

### Fonts — Update `index.html` `<head>`

```html
<link href="https://fonts.googleapis.com/css2?family=Teko:wght@300;400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Abril+Fatface&family=Unbounded:wght@400;700;900&display=swap" rel="stylesheet">
```

Remove any existing Google Fonts link. These 4 families replace everything.

| Role | Family |
|---|---|
| Massive headlines | `'Unbounded', sans-serif` weight 900 |
| Big display numbers | `'Teko', sans-serif` weight 600–700 |
| Decorative/title | `'Abril Fatface', serif` |
| Body / labels / mono | `'Space Mono', monospace` |

### Global body style — Replace in `index.css`

```css
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: #111;
  font-family: 'Space Mono', monospace;
  padding: 12px;
}
```

### Shared Reusable CSS Classes — Add to `index.css`

Copy these verbatim from the HTML — they are used across multiple screens:

```css
/* Border strips (used on every screen top/bottom) */
.border-strip-top {
  height: 14px;
  background: repeating-linear-gradient(90deg,
    var(--yellow) 0, var(--yellow) 18px,
    var(--orange) 18px, var(--orange) 36px,
    var(--green) 36px, var(--green) 54px,
    var(--orange) 54px, var(--orange) 72px
  );
  border-bottom: 3px solid var(--ink);
}
.border-strip-bottom {
  height: 14px;
  background: repeating-linear-gradient(90deg,
    var(--green) 0, var(--green) 18px,
    var(--yellow) 18px, var(--yellow) 36px,
    var(--pink) 36px, var(--pink) 54px,
    var(--yellow) 54px, var(--yellow) 72px
  );
  border-top: 3px solid var(--ink);
}

/* Window bar (used on every screen) */
.windowbar {
  background: var(--ink); padding: 8px 14px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 2px solid var(--yellow);
}
.windowbar-title {
  font-family: 'Space Mono', monospace;
  font-size: 9px; color: var(--yellow); letter-spacing: .14em;
}
.wbtns { display: flex; gap: 7px; }
.wbtn { width: 13px; height: 13px; border-radius: 50%; border: 2px solid rgba(0,0,0,.3); }

/* Ticker (used on landing + mobile) */
.ticker-outer {
  background: var(--ink); overflow: hidden;
  border-top: 3px solid var(--yellow); border-bottom: 3px solid var(--yellow);
  padding: 8px 0;
}
.ticker-inner {
  display: inline-block; white-space: nowrap;
  animation: tick 20s linear infinite;
  font-family: 'Space Mono', monospace; font-size: 10px;
  color: var(--yellow); letter-spacing: .12em;
}
@keyframes tick { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

/* Decorative pattern row (used on form + artifact back) */
.back-pattern-row {
  display: flex; gap: 4px; justify-content: center;
  padding: 6px 0; margin: 8px 0;
  border-top: 1px solid var(--fade); border-bottom: 1px solid var(--fade);
}
.bp-diamond { width: 8px; height: 8px; background: var(--red); transform: rotate(45deg); }
.bp-circle { width: 8px; height: 8px; border-radius: 50%; border: 2px solid var(--ink); }

/* Art top band (truck art stripe — used on artifact screens) */
.art-top-band {
  height: 12px;
  background: repeating-linear-gradient(90deg,
    var(--red) 0, var(--red) 14px,
    var(--yellow) 14px, var(--yellow) 28px,
    var(--green) 28px, var(--green) 42px,
    var(--pink) 42px, var(--pink) 56px,
    var(--yellow) 56px, var(--yellow) 70px
  );
}

/* Pulse animation (used on scanning screen) */
@keyframes pulse { 0% { opacity: 1; } 100% { opacity: .4; } }
```

---

## Step Machine Overview

**Current state in `App.jsx`:** The existing code has steps: `upload → crop → form → result`

**New step machine — replace with:**

```
upload → crop → form → scanning → artifact-front → artifact-back → result → pfp
```

8 total steps. Map these to step numbers 0–7 in `App.jsx`:

| Step | Value | Screen | Component |
|---|---|---|---|
| 0 | `'upload'` | Landing / Upload | `Uploader.jsx` |
| 1 | `'crop'` | Crop & Frame | `Cropper.jsx` |
| 2 | `'form'` | Builder Form | `FormFields.jsx` |
| 3 | `'scanning'` | Scanning/Loading | `ScanningScreen.jsx` (NEW) |
| 4 | `'artifact-front'` | Artifact Front | `ArtifactFront.jsx` (NEW) |
| 5 | `'artifact-back'` | Artifact Back | `ArtifactBack.jsx` (NEW) |
| 6 | `'result'` | Result/Download | `ResultScreen.jsx` |
| 7 | `'pfp'` | PFP Avatar | `PfpScreen.jsx` (NEW) |

---

## Phase 1 — Design Token & Global Style Reset

**Files changed:** `tokens.css`, `index.css`, `index.html`
**Files created:** none
**Existing logic preserved:** all

### Tasks

1. **`src/styles/tokens.css`** — Delete all existing content. Replace with the `:root` block from the Design System section above. Nothing else in this file.

2. **`index.html`** — In `<head>`, remove any existing `<link>` to Google Fonts. Add the new font link from the Design System section. Set `<title>HH GOA BUILDER PAINT — V2</title>`.

3. **`src/index.css`** — Delete all existing content. Add:
   - The global `* {}` and `body {}` reset from Design System section above.
   - All shared reusable CSS classes listed in the Design System section (border strips, windowbar, ticker, pattern row, art-top-band, pulse keyframe, tick keyframe).
   - Do NOT add any component-specific styles here — those go in their component files as `<style>` blocks or CSS modules.

4. **`src/App.jsx`** — Update the step state initial value and the render switch:
   - Change initial step from whatever it currently is to `'upload'`.
   - Add cases for `'scanning'`, `'artifact-front'`, `'artifact-back'`, `'pfp'` — these will render placeholder `<div>TODO</div>` until the components are built in later phases.
   - Pass `formData` state (name, stack, role, builderTitle, city, xHandle) down as props to all components that need it.
   - Pass `croppedImageURL` down to artifact screens.

**Exit check:** Run `npm run dev`. The app loads. Font is Unbounded/Teko/Space Mono. Background is `#111`. No purple anywhere.

---

## Phase 2 — Uploader.jsx (Screen 1: Landing / Hero)

**File changed:** `src/components/Uploader.jsx`
**Existing logic preserved:** all HEIC detection, file input, drag-drop, blob storage — keep 100%
**What changes:** Everything visual. The entire JSX return is replaced.

### New JSX Structure (match HTML Screen 1 exactly)

```
<div className="hero">
  ├── poster-bg-text: "HACK HACK" (Unbounded 900, yellow, top-left, opacity 0.13)
  ├── poster-bg-text: "GOA" (Unbounded 900, cream, bottom-right, opacity 0.07)
  ├── poster-bg-text: "2026" (rotated 90deg, pink, right side, opacity 0.12)
  ├── <svg> hibiscus flower — top right (copy SVG from HTML line 925–932)
  ├── <svg> lotus — bottom left (copy SVG from HTML line 935–945)
  ├── .border-strip-top
  ├── .windowbar
  │     "⬛ HH GOA BUILDER PAINT v2.26 — [UNTITLED.BUILDER]"
  │     3 colored dots (pink, yellow, green)
  ├── .menubar (File / Edit / Builder / Identity / Help)
  ├── .hero-body
  │     ├── .corner-orn × 4 (tl, tr, bl, br)
  │     ├── .hero-annotation (right side: orange stamp + green pill)
  │     ├── .poster-sub-hindi: "हैकर हाउस"
  │     ├── .poster-headline: HACKER / HOUSE / GOA (GOA in pink)
  │     ├── .year-pill: 2026
  │     └── .inner-window
  │           ├── .inner-window-top: "NEW FILE — BUILDER_IDENTITY.ART" / "hhgoa.com"
  │           └── .upload-area  ← THIS IS THE REAL CLICK/DROP TARGET
  │                 ├── .upload-big: "APNA FACE DAALO →"
  │                 ├── .upload-arrow-big: ⇪
  │                 └── .upload-sub: "JPG · PNG · HEIC — ANY CROP WORKS — MOBILE OK"
  ├── .ticker-outer / .ticker-inner (scrolling text)
  ├── .hero-info-row (3 chips: "// BUILDER DETECTED", date, hhgoa.com)
  └── .border-strip-bottom
```

### CSS to add to `Uploader.jsx` (as a `<style>` tag or CSS module)

Copy these class definitions verbatim from the HTML:
- `.hero` (lines 22–27)
- `.poster-bg-text` and `.pbt-hacker`, `.pbt-goa`, `.pbt-2026` (lines 30–48)
- `.diagonal-band` and `.diagonal-band-text` (lines 105–117)
- `.poster-headline`, `.poster-sub-hindi`, `.year-pill` (lines 120–143)
- `.hero-annotation`, `.anno-stamp`, `.anno-stamp-text`, `.anno-pill` (lines 146–165)
- `.inner-window`, `.inner-window-top` (lines 167–177)
- `.upload-big`, `.upload-area`, `.upload-arrow-big`, `.upload-sub` (lines 179–203)
- `.menubar`, `.menuitem` (lines 96–101)
- `.hero-info-row`, `.info-chip` (lines 220–229)
- `.corner-orn`, `.corner-orn.tl/.tr/.bl/.br` (lines 231–239)

### Wiring the file input

- The hidden `<input type="file">` ref stays exactly as it was in the old code.
- `.upload-area` div gets `onClick` → trigger file input click, `onDragOver` + `onDrop` handlers (already exist in old code, just move to new element).
- Show a loading overlay inside `.inner-window` during HEIC conversion (spinner + "Converting your iPhone photo...") — keep existing logic, just update the JSX wrapper.
- On success: call `setStep('crop')`.

### Responsiveness notes

- At mobile width (< 480px): reduce `.poster-headline` font-size from 72px to 52px.
- At mobile width: reduce `.poster-bg-text` opacity further (they crowd the layout).
- `.menubar` — hide on mobile (display: none below 480px) or make it scroll horizontally.
- `.inner-window` takes full width on mobile.

**Exit check:** Landing page looks identical to HTML Screen 1. Uploading a JPG transitions to crop step. HEIC shows spinner.

---

## Phase 3 — Cropper.jsx (Crop Step, between Upload and Form)

**File changed:** `src/components/Cropper.jsx`
**Existing logic preserved:** `react-easy-crop` integration, `getCroppedImg()` call, crop pixel output — keep 100%
**What changes:** Visual wrapper only — make it look like an HH Goa branded screen.

### New wrapper structure

The crop screen is not explicitly shown in the HTML as a separate screen — it sits between Screen 1 and Screen 2. Style it as a minimal branded panel:

```
<div style={{ background: 'var(--cream)', border: '4px solid var(--ink)' }}>
  ├── .border-strip-top
  ├── .windowbar
  │     "⬛ APNI PHOTO FRAME KAR — STEP 1 OF 3"
  │     3 dots (red, yellow, green)
  ├── <div> eyebrow label: "// FRAME YOUR FACE · PORTRAIT CROP LOCKED"
  ├── <div> heading: "KAISA DIKHNA HAI?" (Unbounded 900, ink color)
  ├── react-easy-crop component (existing, unchanged)
  │     aspect = 3/4 (portrait rectangle)
  ├── zoom slider — style to match: border-bottom 3px solid ink, no track bg
  ├── Rotate button — styled as .tag (same style as form tags)
  ├── CTA: "FACE LOCK KAR →" — styled as .generate-btn (red, yellow text, Unbounded)
  └── .border-strip-bottom
```

### No new CSS needed

Re-use classes already defined: `.border-strip-top/bottom`, `.windowbar`, `.wbtns`, `.wbtn`, `.generate-btn`, `.tag` (define `.generate-btn` and `.tag` in `index.css` so they're globally available — copy from HTML lines 329–343 and 299–305).

**Exit check:** Crop screen is HH Goa branded. Portrait 3:4 crop. Confirming crop moves to form step.

---

## Phase 4 — FormFields.jsx (Screen 2: Builder Form)

**File changed:** `src/components/FormFields.jsx`
**Existing logic preserved:** form state (name, stack, role, builderTitle, city, xHandle), validation, title chip selection, custom type toggle — keep all logic
**What changes:** Entire visual output replaced to match HTML Screen 2 exactly.

### New JSX structure (match HTML Screen 2 exactly)

```
<div className="form-screen">
  ├── <div className="form-poster-bg">BUILD</div>  ← decorative bg text
  ├── .border-strip-top
  ├── .windowbar
  │     "⬛ NAAM KYA HAI, BUILDER? — STEP 2 OF 3"
  ├── <div className="form-body">
  │     ├── .form-eyebrow: "// IDENTITY CONFIGURATION IN PROGRESS"
  │     ├── .form-heading-big: "TERI / IDENTITY (in red) / KYA HAI?"
  │     │
  │     ├── .field-group: Name
  │     │     .field-label: "TERA NAAM KYA HAI? / Your name"
  │     │     .field-inp (input, uppercase, Teko 28px)
  │     │     .field-decoration: "NAAM ✓" (shown when filled)
  │     │
  │     ├── .field-group: Stack
  │     │     .field-label: "KYA CHALTA HAI MACHINE MEIN? / Your stack"
  │     │     .field-inp
  │     │     .field-decoration: "STACK ✓"
  │     │
  │     ├── .field-group: City (optional)
  │     │     .field-label: "KAHAN SE AAYA HAI? / City, Country"
  │     │     .field-inp
  │     │
  │     ├── .field-group: X Handle (optional)
  │     │     .field-label: "TU X PE KYA HAI? / @handle"
  │     │     .field-inp (strip @ on input)
  │     │
  │     ├── Role tags section:
  │     │     .tags-label: "TU KYA BANATA HAI? / Your role"
  │     │     .tags-row (flex wrap):
  │     │       .tag (each): Builder / Designer / Founder / AI Hacker / Chaos Agent
  │     │       Active tag gets .active class (red bg, yellow text)
  │     │
  │     ├── .title-box (generated builder title):
  │     │     ::before: "// GENERATED BUILDER TITLE"
  │     │     .title-box-name (Unbounded 900, yellow on ink bg, 20px)
  │     │     .title-box-regen: "↻ EK AUR" button → cycles to next title
  │     │     Toggle: show text input instead (custom title mode)
  │     │
  │     ├── .back-pattern-row (decorative divider)
  │     │
  │     └── <button className="generate-btn">
  │           "JUGAAD KARO → GENERATE MY ARTIFACT"
  │           Disabled state: opacity 0.4, cursor not-allowed
  └── .border-strip-bottom
```

### CSS to add (copy from HTML)
- `.form-screen`, `.form-poster-bg`, `.form-body`, `.form-eyebrow`, `.form-heading-big` (lines 244–267)
- `.field-group`, `.field-label`, `.field-inp`, `.field-decoration` (lines 270–289)
- `.tags-label`, `.tags-row`, `.tag`, `.tag.active` (lines 292–305)
- `.title-box`, `.title-box-name`, `.title-box-regen` (lines 308–328)
- `.generate-btn` (lines 329–343) — add to `index.css` (shared)

### Logic changes

- **Builder title:** Keep existing chip-select logic. The `.title-box-regen` "↻ EK AUR" button calls the existing `regenerateTitle()` logic.
- **Custom title toggle:** Add a small link below `.title-box`: "✏ TYPE MY OWN" — toggles visibility of a `.field-inp` and hides `.title-box-name` + chips.
- **Validation:** Generate button disabled until: name.trim() && stack.trim() && builderTitle.trim() are all non-empty.
- **On submit:** Call `setStep('scanning')`.

**Exit check:** Form screen matches HTML Screen 2 exactly. All fields work. Tags select/deselect. "EK AUR" cycles titles. Generate button activates correctly.

---

## Phase 5 — ScanningScreen.jsx (Screen 3: NEW COMPONENT)

**File:** `src/components/ScanningScreen.jsx` — CREATE NEW
**Existing logic:** none — this is pure UI + timed animation
**Purpose:** Fake loading screen that runs for ~3 seconds before auto-advancing to artifact-front.

### Behaviour

- Renders immediately when step becomes `'scanning'`.
- Runs a timed sequence: each scan line advances from `wait` → `active` → `done` with a 600ms delay between each.
- Progress bar animates from 0% → 100% over ~3.5s using CSS animation or `setInterval`.
- After all lines complete: auto-call `setStep('artifact-front')`.
- During scanning: also trigger `renderCard()` from `useCardRenderer` (the actual canvas render runs in the background during this fake loading sequence — this hides any real render time).

### JSX structure (match HTML Screen 3 exactly)

```
<div className="scan-screen">
  ├── <div className="scan-bg-text">SCAN</div>
  ├── .border-strip-top
  ├── .windowbar (yellow border, pulsing dot)
  │     "⬛ BUILDER AUTHENTICATION IN PROGRESS"
  ├── <div className="scan-body">
  │     ├── .scan-eyebrow: "// IDENTITY AUTHENTICATION IN PROGRESS"
  │     ├── .scan-headline: "SCANNING / BUILDER…"
  │     │
  │     ├── .scan-line × 6 (each with icon + text + optional result):
  │     │     Line 1: "SCANNING BUILDER VIBES" → FACE FOUND
  │     │     Line 2: "ANALYSING STACK POTENTIAL" → stack value from formData
  │     │     Line 3: "DETECTING JUGAAD COEFFICIENT" → ✓ HIGH
  │     │     Line 4: "MEASURING SHIP VELOCITY…" → 97%
  │     │     Line 5: "CALCULATING GOA COMPATIBILITY"
  │     │     Line 6: "GENERATING ARTIFACT…"
  │     │
  │     ├── .scan-progress-wrap
  │     │     .scan-progress-label (left: "BUILDER AUTHENTICATION", right: animated %)
  │     │     .scan-progress-track
  │     │       .scan-progress-fill (width animates 0→100%)
  │     │       .scan-progress-text: "JUGAAD IN PROGRESS · PLEASE HOLD"
  │     │
  │     └── .gen-bar: "GENERATING ARTIFACT · GOA COMPATIBILITY: CALCULATING · DO NOT CLOSE TAB"
  └── .border-strip-bottom
```

### Scan line state logic

```jsx
const SCAN_LINES = [
  { main: 'SCANNING BUILDER VIBES', sub: 'FACE FOUND · AESTHETIC CONFIRMED', result: '✓ OK' },
  { main: 'ANALYSING STACK POTENTIAL', sub: `${formData.stack} DETECTED`, result: '✓ OK' },
  { main: 'DETECTING JUGAAD COEFFICIENT', sub: 'CHECKING CHAOS TOLERANCE', result: '✓ HIGH' },
  { main: 'MEASURING SHIP VELOCITY…', sub: 'CALCULATING 3AM PRODUCTIVITY INDEX', result: '97%' },
  { main: 'CALCULATING GOA COMPATIBILITY', sub: 'CHECKING ARABIAN SEA PROXIMITY TOLERANCE' },
  { main: 'GENERATING ARTIFACT…', sub: 'COMPOSING VINTAGE POSTER · APPLYING INK TEXTURES' }
];

// State: lineProgress = 0..6 (how many lines are done/active)
// useEffect with setInterval: increment lineProgress every 600ms
// When lineProgress === 6: setStep('artifact-front') after 400ms delay
```

### Icon states per line

- `done` (lineProgress > index): green circle, ✓, strikethrough text
- `active` (lineProgress === index): yellow circle, →, yellow text, pulse animation
- `wait` (lineProgress < index): empty circle, grey text

### CSS (copy from HTML lines 348–416)
- `.scan-screen`, `.scan-bg-text`, `.scan-body`
- `.scan-eyebrow`, `.scan-headline`
- `.scan-line`, `.scan-icon`, `.scan-icon.done/.active/.wait`
- `.scan-text-wrap`, `.scan-text-main`, `.scan-text-main.done/.active`, `.scan-text-sub`
- `.scan-result`, `.scan-progress-wrap`, `.scan-progress-label`
- `.scan-progress-track`, `.scan-progress-fill`, `.scan-progress-text`
- `.gen-bar`

**Exit check:** Scanning screen animates all 6 lines sequentially. Progress bar fills. Auto-advances to artifact-front after ~3.5s.

---

## Phase 6 — useCardRenderer.js + canvasHelpers.js (Canvas Rebuild)

**Files changed:** `src/hooks/useCardRenderer.js`, `src/utils/canvasHelpers.js`
**This is the most complex phase. The old canvas code drew a dark purple card — delete it entirely.**

### Canvas output spec

- **Canvas size:** 1080 × 1620px (2:3 portrait — renders the full Artifact Front layout)
- **Internal draw scale:** Draw at 1× then export (canvas is already 1080px wide)
- **Output:** PNG via `canvas.toDataURL('image/png')`

### Draw order — Artifact Front card (match HTML Screen 4)

The canvas must reproduce the HTML Screen 4 layout as a rasterized image. Draw in this exact order:

```
1.  BACKGROUND
    - Fill entire canvas: var(--cream) = #F5EDD8

2.  ART-BG-CIRCLE
    - Circle: cx=860, cy=-80, r=320, fill=#F0C229, opacity 0.18

3.  ART-BG-STRIPE
    - Polygon (diagonal): bottom-left triangle, fill=#C8001E, opacity 0.08
    - Use ctx.beginPath(), moveTo, lineTo to create the clip-path polygon equivalent

4.  ART-NAME-GIANT (background watermark text)
    - Text: formData.name (first name top line, last name second line)
    - Font: 900 88px 'Unbounded', color=#1A1008, opacity 0.06
    - Position: top:20, left:-8

5.  LARGE HIBISCUS SVG — background decoration
    - Draw as SVG path using ctx.ellipse() calls
    - Center: (540, 400), 5 rotated ellipses alternating pink/yellow + red center circle
    - Opacity: 0.12

6.  ART-TOP-BAND (truck art stripe)
    - Height: 12px, y=0, repeating color segments:
      red(14px), yellow(14px), green(14px), pink(14px), yellow(14px)
    - Function: drawArtTopBand(ctx, y, width)

7.  ART-TITLE-PLATE (red header bar)
    - Rect: x=0, y=12, w=1080, h=~110, fill=#C8001E
    - Border bottom: 3px solid #1A1008
    - Left: "HACKER\nHOUSE" in Unbounded 900 44px yellow
    - Left small: "// BUILDER IDENTITY ARTIFACT #247" in Space Mono 16px
    - Right: "हैकर हाउस\nगोवा" in serif 40px yellow
    - Right small: "OCT 28–31 · 2026" in Space Mono 14px

8.  PHOTO ZONE
    - Rect border: x=32, y=140, w=1016, h=560
      fill: linear gradient top-to-bottom yellow→cream
      stroke: 3px #1A1008
    - Draw cropped user photo inside this rect (ctx.drawImage with clipping)
    - Photo is full-width within the zone, centered

9.  STICKERS OVER PHOTO (positioned absolutely in HTML, draw at fixed coords)
    - Top-right sticker: "★ QUALITY\nBUILDER ★"
      - Orange rect (200×80px) at x=820, y=148, rotated 4deg
      - Teko 700 22px cream text
    - Top-left sticker: "// BUILDER\nDETECTED"
      - Yellow rect (180×70px) at x=40, y=148, rotated -3deg
      - Teko 700 20px ink text, 3px ink border
    - Bottom-center sticker: "PHOTO CUTOUT GOES HERE" — OMIT in final card
      (this was a placeholder in the HTML design only)

10. SMALL DECORATIVE SVGS INSIDE PHOTO ZONE
    - Scooter SVG: bottom-left of photo zone (copy path from HTML lines 1258–1262)
    - Coconut tree SVG: top-right of photo zone (copy path from HTML lines 1264–1270)

11. "SHIP" BACKGROUND TEXT (inside photo zone, very low opacity)
    - "SHIP" in Unbounded 900, 140px, #C8001E, opacity 0.07
    - Centered horizontally at bottom of photo zone

12. WAVE SVG (below photo zone)
    - Sinusoidal wave path, fill=#2B5FA0, opacity 0.15
    - Full width, height 80px, at y=700

13. SEAL (100% GOA COMPAT.)
    - Circle: x=900, y=700, r=68
    - Stroke: 3px #C8001E
    - Fill: #F5EDD8
    - Inner stroke: rgba(200,0,30,.12) inset 4px
    - Text: "100%" in Abril Fatface 36px red
    - Text: "GOA COMPAT." in Teko 700 20px red

14. NAME DISPLAY
    - formData.name split into first/last
    - First name: Unbounded 900, 88px, #C8001E
    - Last name: Unbounded 900, 88px, #F5EDD8 with 4px #1A1008 stroke
      (use ctx.strokeText then ctx.fillText)
    - Position: left-aligned, y=~820

15. TITLE LABEL (black pill with yellow text)
    - Black rect with slight rotation (-0.5deg) containing:
    - formData.builderTitle in Abril Fatface 36px yellow
    - Padding: 12px 28px

16. INGREDIENTS BOX
    - Rect with 2px ink border, white fill at 40% opacity, label "INGREDIENTS"
    - Parse formData.stack by "/" or "," separator → up to 3 items
    - Each row: item name left, colored bar middle, generated percentage right
    - Colors: red/orange/green cycling
    - Font: Teko 600 28px ink

17. EASTER EGG CHIPS
    - 4 chips in a row: "404: SLEEP NOT FOUND" / "WORKS ON MY MACHINE" /
      "COFFEE: CRITICAL" / "JUGAAD IN PROGRESS"
    - Each: Space Mono 12px, fade color, 1px fade border, small padding

18. ART-BOTTOM-BAND
    - Black rect at bottom, h=~50px
    - Border top: 2px #F0C229
    - Left text: "MADE IN GOA · BUILT TO SHIP · #FrameInGoa · OCT 28–31 2026"
      Space Mono 14px fade
    - Right text: "HHGOA.COM" in Teko 700 30px yellow

19. ART-TOP-BAND (draw again at very bottom as footer stripe)
```

### Helper functions to write in `canvasHelpers.js`

```js
// Draw the truck-art repeating color stripe
export function drawArtBand(ctx, y, width, height = 12)

// Draw a rounded rect (polyfill for ctx.roundRect)
export function drawRoundRect(ctx, x, y, w, h, r)

// Draw text with ink stroke (for outlined last name)
export function drawStrokedText(ctx, text, x, y, strokeColor, strokeWidth)

// Draw the ingredients box from a stack string
export function drawIngredients(ctx, stackString, x, y, w)

// Draw a sticker (rotated rect + text)
export function drawSticker(ctx, text, x, y, bgColor, textColor, rotation)

// Draw the hibiscus SVG as canvas paths
export function drawHibiscus(ctx, cx, cy, scale, opacity)
```

### Font loading — critical

Before any canvas draw calls, ensure fonts are loaded:

```js
await document.fonts.load("900 48px 'Unbounded'");
await document.fonts.load("700 48px 'Teko'");
await document.fonts.load("400 48px 'Abril Fatface'");
await document.fonts.load("400 14px 'Space Mono'");
```

Or use: `await document.fonts.ready`

### Hook interface (keep same as existing)

```js
// useCardRenderer.js
export function useCardRenderer() {
  const canvasRef = useRef(null);

  const renderCard = async (formData, croppedImageURL) => {
    // Create offscreen canvas
    // Run all draw steps
    // Store canvas in canvasRef
  };

  const getDataURL = () => canvasRef.current?.toDataURL('image/png');
  const getCanvas = () => canvasRef.current;

  return { renderCard, getDataURL, getCanvas };
}
```

**Exit check:** Call `renderCard()` with test data. Export PNG and inspect. Card matches HTML Screen 4 visually. Name, title, stack ingredients, stickers are all correct.

---

## Phase 7 — ArtifactFront.jsx (Screen 4: NEW COMPONENT)

**File:** `src/components/ArtifactFront.jsx` — CREATE NEW
**Purpose:** Display the rendered canvas as an `<img>`, show card front, let user flip to back.

### JSX structure

```
<div style={{ background: '#111', padding: '20px 12px' }}>
  <!-- Screen label style: "04 · YOUR BUILDER ARTIFACT" -->
  <div className="screen-label">YOUR BUILDER ARTIFACT</div>

  <!-- The rendered card -->
  <img
    src={cardDataURL}
    alt="Your HH Goa Builder Artifact"
    style={{ width: '100%', maxWidth: '540px', display: 'block', margin: '0 auto',
             border: '4px solid var(--ink)', boxShadow: '8px 8px 0 var(--ink)' }}
  />

  <!-- Navigation row -->
  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
    <button className="act-btn primary" onClick={() => setStep('artifact-back')}>
      FLIP → SEE BACK
    </button>
    <button className="act-btn ghost" onClick={() => setStep('result')}>
      SKIP TO DOWNLOAD
    </button>
  </div>
</div>
```

### Props received
- `cardDataURL` — the PNG data URL from `useCardRenderer`
- `setStep` — to navigate forward/backward

**Note:** The canvas render was triggered during the scanning screen (Phase 5). By the time this screen shows, `cardDataURL` should already be ready. Handle the case where it's still null (show a spinner).

**Exit check:** Artifact front screen shows the rendered PNG card. Flip button navigates to artifact-back.

---

## Phase 8 — ArtifactBack.jsx (Screen 5: NEW COMPONENT)

**File:** `src/components/ArtifactBack.jsx` — CREATE NEW
**Purpose:** Show the "product label" back of the card. This is a pure HTML/CSS screen — it is NOT part of the downloadable PNG (the download is artifact front only).

### JSX structure (match HTML Screen 5 exactly)

```
<div className="card-back">
  ├── .art-top-band
  ├── .back-header (green bg)
  │     Left: "PRODUCT\nINFORMATION" (Unbounded 900 18px yellow)
  │           "CERTIFIED BUILDER · HACKER HOUSE GOA 2026" (Space Mono 8px)
  │     Right: "BATCH NO." + "GOA-2026-{randomNum}" (Abril Fatface 22px yellow)
  ├── .back-body
  │     ├── .back-pattern-row
  │     ├── .back-section-title: "INGREDIENTS (PER BUILDER)"
  │     ├── .ing-table
  │     │     Rows derived from formData.stack (parse "/" or ",")
  │     │     + "CONTROLLED CHAOS" (25%)
  │     │     + "BLACK COFFEE (ARABICA)" (15%)
  │     │     + "GOA SUNLIGHT (D/W/V)" (10%)
  │     │     + "QUESTIONABLE IDEAS" (10%)
  │     │     Each row has: name | mini-bar-track | percentage
  │     │
  │     ├── .back-pattern-row
  │     ├── .back-section-title: "DIRECTIONS FOR USE"
  │     ├── .directions-text (5 bullet items — copy from HTML)
  │     │
  │     ├── .warning-box (yellow, ⚠ WARNING header)
  │     │     Warning text — copy from HTML
  │     │
  │     ├── .mfg-block
  │     │     Left: manufacturing info with formData.name, date, city
  │     │     Right: "गोवा" in serif 32px
  │     │
  │     └── .barcode
  │           .barcode-bars (copy bar pattern from HTML)
  │           .barcode-num: "HH-GOA-2026-{num}-{name}"
  └── .art-top-band
```

### Dynamic values from formData

- `name` → appears in mfg-block "FOR: {name}"
- `stack` → parsed into ingredients table top rows
- `city` → "MANUFACTURED AT: {city}" (fallback: "GOA, INDIA")
- Batch number: generate a random 3-digit number on mount, store in state

### CSS (copy from HTML lines 660–777)
- `.card-back`, `.back-header`, `.back-header-brand`, `.back-header-batch`
- `.back-body`, `.back-section-title`
- `.ing-table`, `.mini-bar-track`, `.mini-bar-fill`
- `.directions-text`
- `.warning-box`, `.warning-text`
- `.mfg-block`, `.mfg-text`, `.mfg-hindi`
- `.barcode`, `.barcode-bars`, `.barcode-bar`, `.barcode-bar.wide`, `.barcode-bar.gap`, `.barcode-num`

### Navigation

```jsx
<div style={{ display: 'flex', gap: '10px', padding: '16px', background: '#111' }}>
  <button className="act-btn ghost" onClick={() => setStep('artifact-front')}>
    ← FLIP BACK
  </button>
  <button className="act-btn primary" onClick={() => setStep('result')}>
    DOWNLOAD / SHARE →
  </button>
</div>
```

**Exit check:** Artifact back screen shows all dynamic content. Batch number is random. Stack ingredients are derived from form input.

---

## Phase 9 — ResultScreen.jsx (Screen 6: Existing, Full Visual Rework)

**File changed:** `src/components/ResultScreen.jsx`
**Existing logic preserved:** download trigger, share to X logic — keep 100%
**What changes:** Entire JSX return replaced to match HTML Screen 6.

### New JSX structure (match HTML Screen 6 exactly)

```
<div className="result-screen">
  ├── <div className="result-poster-bg">SHIP SHIP</div>
  ├── .border-strip-top
  ├── .windowbar
  │     "⬛ ARTIFACT GENERATED · {name}.ART"
  ├── .result-top (green bg)
  │     Left: "IDENTITY\nGENERATED." (Unbounded 900 36px yellow)
  │           "// WELCOME TO THE HOUSE, BUILDER.\nSHIP KARO. NOW." (Space Mono 8px)
  │     Right: "✓" (Abril Fatface 54px yellow)
  ├── .result-body
  │     ├── .result-mini-card (preview of the card)
  │     │     .rmc-left (tricolor stripe)
  │     │     .rmc-body:
  │     │       .rmc-name: formData.name (split into lines)
  │     │       .rmc-title: formData.builderTitle
  │     │       .rmc-stack: formData.stack
  │     │       .rmc-badge: "★ GOA COMPATIBILITY: 100% ★"
  │     │     Right column: "HH GOA\n2026" + "गोवा"
  │     │
  │     ├── .actions-grid
  │     │     .act-btn.primary: "⬇ DOWNLOAD ARTIFACT" → triggerDownload()
  │     │     .act-btn.x: "POST TO X → #FrameInGoa" → shareToX()
  │     │     .act-btn.ghost: "↻ MAKE ANOTHER / REGEN TITLE" → setStep('upload')
  │     │
  │     ├── .caption-box
  │     │     .caption-label: "// PRE-FILLED CAPTION:"
  │     │     .caption-text: (see tweet copy below)
  │     │
  │     └── Footer: "BUILT IN GOA · MADE TO SHIP · hhgoa.com"
  └── .border-strip-bottom
```

### Tweet copy

```
Just got my Builder Artifact from Hacker House Goa 2026.
Shipping at a private beach resort in October.
Find me there. 🌴🛵

#FrameInGoa #HackerHouseGoa @247pmstudio
```

### Download logic (keep existing, update filename)

```js
const triggerDownload = () => {
  const dataURL = getDataURL(); // from useCardRenderer
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = `hh-goa-2026-${formData.name.toLowerCase().replace(/\s+/g, '-')}.png`;
  a.click();
};
```

### Share to X logic (keep existing)

```js
const shareToX = () => {
  triggerDownload(); // download first
  setTimeout(() => {
    const text = encodeURIComponent(
      `Just got my Builder Artifact from Hacker House Goa 2026.\nShipping at a private beach resort in October.\nFind me there. 🌴🛵\n\n#FrameInGoa #HackerHouseGoa @247pmstudio`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  }, 300);
};
```

### CSS (copy from HTML lines 781–869)
- `.result-screen`, `.result-poster-bg`, `.result-top`, `.result-big`, `.result-sub`, `.result-check`
- `.result-body`, `.result-mini-card`, `.rmc-left`, `.rmc-body`, `.rmc-name`, `.rmc-title`, `.rmc-stack`, `.rmc-badge`
- `.actions-grid`, `.act-btn`, `.act-btn.primary`, `.act-btn.x`, `.act-btn.ghost`
- `.caption-box`, `.caption-label`, `.caption-text`

**Exit check:** Result screen matches HTML Screen 6. Download produces a real PNG. Share to X opens pre-filled tweet. "Make another" resets to upload.

---

## Phase 10 — PfpScreen.jsx (Screen 7: NEW COMPONENT)

**File:** `src/components/PfpScreen.jsx` — CREATE NEW
**Purpose:** Show the round PFP/avatar version of the card and the square social version. This screen comes after result — it is optional (user reaches it via a "See your PFP version" button on result screen, OR it's the 8th step automatically).

### Update ResultScreen.jsx

Add a 4th button in `.actions-grid`:

```jsx
<button className="act-btn" style={{ background: 'var(--blue)', color: 'var(--cream)' }}
  onClick={() => setStep('pfp')}>
  → SEE YOUR PFP VERSION
</button>
```

### PFP Canvas render (add to canvasHelpers.js)

Create a **second canvas** for the PFP — separate from the artifact front canvas:

- **Round PFP:** 500×500px circle crop of the user's photo
  - Yellow top half background, red bottom half
  - User photo centered/cropped as circle
  - "HH GOA 2026" label at top
  - Name at bottom
  - Builder title in black bar at very bottom

- **Square PFP:** 500×500px square
  - Tricolor stripe top (red/yellow/green)
  - Yellow header area with user photo
  - Name in Unbounded below
  - Builder title in Space Mono
  - Tricolor stripe bottom

### JSX structure (match HTML Screen 7 exactly)

```
<div style={{ background: 'var(--ink)', padding: '28px', border: '4px solid var(--yellow)' }}>

  <!-- Round PFP -->
  <div className="pfp-outer">
    ├── .pfp-bg-circle (yellow top half)
    ├── red bottom half div
    ├── decorative inner border
    ├── hibiscus SVG (top right, opacity .3) — copy from HTML lines 1569–1574
    ├── user photo (circular clipped img)
    ├── .pfp-top-label: "HH GOA 2026"
    ├── .pfp-name: formData.name (first name only)
    └── .pfp-title-bar: formData.builderTitle
  </div>

  <!-- Label -->
  <div>// AVATAR · PROFILE PICTURE · TWITTER / X · INSTAGRAM</div>
  <div>1:1 SQUARE VERSION ALSO GENERATED</div>

  <!-- Square PFP -->
  <div style={{ width: '200px', height: '200px', background: 'var(--cream)', ... }}>
    ├── tricolor top stripe (6px)
    ├── yellow header area (80px) with hibiscus SVG + user photo
    ├── name (Unbounded 900 16px red)
    ├── builder title (Space Mono 6px fade)
    └── tricolor bottom stripe
  </div>

  <!-- Download buttons -->
  <button className="act-btn primary">⬇ DOWNLOAD ROUND PFP</button>
  <button className="act-btn x">⬇ DOWNLOAD SQUARE PFP</button>
  <button className="act-btn ghost" onClick={() => setStep('result')}>← BACK</button>
</div>
```

### CSS (copy from HTML lines 874–910)
- `.pfp-outer`, `.pfp-bg-circle`, `.pfp-name`, `.pfp-title-bar`, `.pfp-top-label`, `.pfp-person`

**Exit check:** PFP screen shows round and square versions with user photo. Both versions downloadable as PNGs.

---

## Phase 11 — Responsiveness Pass (All Screens)

Apply these responsive rules after all screens are built. Add to `index.css` at the bottom.

### Breakpoints

```css
/* Mobile: max-width 480px */
@media (max-width: 480px) {

  /* Landing screen */
  .poster-headline { font-size: 52px !important; }
  .pbt-hacker { font-size: 90px; opacity: 0.08; }
  .pbt-goa { font-size: 120px; opacity: 0.05; }
  .menubar { display: none; }
  .hero-flower-tr { width: 70px; height: 70px; }
  .hero-flower-bl { width: 90px; height: 90px; }
  .corner-orn { display: none; }

  /* Form screen */
  .form-heading-big { font-size: 18px; }
  .field-inp { font-size: 22px; }
  .tags-row { gap: 5px; }
  .tag { font-size: 8px; padding: 4px 9px; }
  .generate-btn { font-size: 13px; padding: 14px 10px; }

  /* Scan screen */
  .scan-headline { font-size: 28px; }

  /* Artifact */
  .art-name-display { font-size: 32px; }
  .art-title-text { font-size: 14px; }

  /* Result */
  .result-big { font-size: 26px; }
  .act-btn { font-size: 11px; padding: 12px 10px; }

  /* PFP */
  .pfp-outer { width: 240px; height: 240px; }
}
```

### Safe area insets (for iPhone notch/Dynamic Island)

```css
.generate-btn, .actions-grid {
  padding-bottom: max(16px, env(safe-area-inset-bottom));
}
```

### Touch targets

All buttons must have `min-height: 44px` — add this to `.act-btn`, `.generate-btn`, `.tag`, `.title-box-regen`.

**Exit check:** Full flow works at 375px (iPhone SE) and 390px (iPhone 14). No horizontal scroll at any step. All tap targets are reachable.

---

## Phase 12 — titlesList.js Update

**File changed:** `src/utils/titlesList.js`
**Replace existing list with:**

```js
export const BUILDER_TITLES = [
  "THE PIXEL ALCHEMIST",
  "VIBE ENGINEER",
  "FULL STACK GREMLIN",
  "PROMPT WHISPERER",
  "API ABUSER",
  "SERIAL SIDE PROJECTER",
  "BROKE PROD ONCE",
  "NEVER READ THE DOCS",
  "CEO OF SIDE PROJECTS",
  "CAFFEINATED CODER",
  "DEBUGGING IN PROD",
  "ONE MORE FEATURE",
  "DESIGN? WHAT DESIGN",
  "JUST SHIP IT",
  "LIVING IN MY TERMINAL",
  "LOCALHOST LEGEND",
  "MVP FACTORY",
  "GIT PUSH THERAPIST",
  "ZERO TO DEPLOYED",
  "BUILDING IN PUBLIC",
  "CHAOS AGENT CERTIFIED",
  "JUGAAD ENGINEER",
  "WILL SHIP FOR CHAI",
  "404: SLEEP NOT FOUND"
];
```

---

## Phase 13 — App.jsx Final Wiring

**File changed:** `src/App.jsx`
**Replace step machine with the full 8-step version:**

```jsx
import { useState } from 'react';
import Uploader from './components/Uploader';
import Cropper from './components/Cropper';
import FormFields from './components/FormFields';
import ScanningScreen from './components/ScanningScreen';
import ArtifactFront from './components/ArtifactFront';
import ArtifactBack from './components/ArtifactBack';
import ResultScreen from './components/ResultScreen';
import PfpScreen from './components/PfpScreen';
import { useCardRenderer } from './hooks/useCardRenderer';
import { useImageProcessor } from './hooks/useImageProcessor';

export default function App() {
  const [step, setStep] = useState('upload');
  const [croppedImageURL, setCroppedImageURL] = useState(null);
  const [formData, setFormData] = useState({
    name: '', stack: '', role: 'Builder',
    builderTitle: '', city: '', xHandle: ''
  });
  const [cardDataURL, setCardDataURL] = useState(null);

  const { processImage, originalBlob } = useImageProcessor();
  const { renderCard, getDataURL } = useCardRenderer();

  const handleScanComplete = async () => {
    // Render canvas during scanning phase
    const url = await renderCard(formData, croppedImageURL);
    setCardDataURL(url);
    setStep('artifact-front');
  };

  const screens = {
    'upload':        <Uploader setStep={setStep} processImage={processImage} setCroppedImageURL={setCroppedImageURL} />,
    'crop':          <Cropper setStep={setStep} originalBlob={originalBlob} setCroppedImageURL={setCroppedImageURL} />,
    'form':          <FormFields setStep={setStep} formData={formData} setFormData={setFormData} />,
    'scanning':      <ScanningScreen setStep={setStep} formData={formData} onComplete={handleScanComplete} />,
    'artifact-front':<ArtifactFront setStep={setStep} cardDataURL={cardDataURL} />,
    'artifact-back': <ArtifactBack setStep={setStep} formData={formData} />,
    'result':        <ResultScreen setStep={setStep} formData={formData} getDataURL={getDataURL} />,
    'pfp':           <PfpScreen setStep={setStep} formData={formData} croppedImageURL={croppedImageURL} />,
  };

  return (
    <div style={{ maxWidth: '540px', margin: '0 auto' }}>
      {screens[step]}
    </div>
  );
}
```

---

## Phase 14 — Deployment Check

Before pushing to Vercel/Netlify:

```
[ ] npm run build — no errors
[ ] dist/ folder generated
[ ] Test full flow in production build (npm run preview)
[ ] Upload JPG — works
[ ] Upload PNG — works
[ ] Upload HEIC (from real iPhone) — converts and works
[ ] Form fills, title generates, "Generate" activates
[ ] Scanning animates all 6 lines, auto-advances
[ ] Artifact front renders with real photo
[ ] Artifact back shows dynamic stack from form
[ ] Result screen: download produces PNG
[ ] Result screen: Share to X opens tweet
[ ] PFP screen: round and square versions visible
[ ] All screens on iPhone Safari (375px) — no overflow
[ ] All screens on Chrome Android (360px) — no overflow
[ ] Push to main → Vercel auto-deploys
```

---

## Summary: What Changes vs What Stays

| File | Status | What changes |
|---|---|---|
| `tokens.css` | ✏️ REPLACE | Full replacement with new palette |
| `index.css` | ✏️ REPLACE | New global styles + all shared classes |
| `index.html` | ✏️ UPDATE | New fonts, new title |
| `App.jsx` | ✏️ REWRITE | 8-step machine, new state shape |
| `Uploader.jsx` | ✏️ RESTYLE | Logic kept, all JSX/CSS replaced |
| `Cropper.jsx` | ✏️ RESTYLE | Logic kept, wrapper JSX/CSS replaced |
| `FormFields.jsx` | ✏️ RESTYLE | Logic kept, all JSX/CSS replaced |
| `ResultScreen.jsx` | ✏️ RESTYLE | Logic kept, all JSX/CSS replaced |
| `useCardRenderer.js` | ✏️ REWRITE | Full canvas draw rewrite for new card |
| `canvasHelpers.js` | ✏️ REWRITE | New helper functions for new card |
| `useImageProcessor.js` | ✅ KEEP | No changes |
| `imageUtils.js` | ✅ KEEP | No changes |
| `titlesList.js` | ✏️ UPDATE | New titles list |
| `ScanningScreen.jsx` | 🆕 NEW | Timed animation loading screen |
| `ArtifactFront.jsx` | 🆕 NEW | Displays rendered card PNG |
| `ArtifactBack.jsx` | 🆕 NEW | Product label back of card |
| `PfpScreen.jsx` | 🆕 NEW | Round + square PFP versions |

---

*Implementation Doc v2.0 — aligned to `hh_goa_v2_upgraded.html` reference design*
*Agent: treat every class name, color value, and copy string in the HTML file as the authoritative source. When the doc says "copy from HTML line X", open the reference file and copy verbatim.*
DOCEOF