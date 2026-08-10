# HH Goa 2026 — Builder ID Card Generator
## Product Design Document v1.0

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Goals & Non-Goals](#2-goals--non-goals)
3. [Architecture Decision](#3-architecture-decision)
4. [Tech Stack](#4-tech-stack)
5. [Design System](#5-design-system)
6. [User Flow — End to End](#6-user-flow--end-to-end)
7. [Phase Breakdown](#7-phase-breakdown)
   - Phase 0: Project Scaffold
   - Phase 1: Upload + HEIC Conversion
   - Phase 2: Crop & Framing
   - Phase 3: Form Fields
   - Phase 4: Card Canvas Rendering
   - Phase 5: Generation Animation + Download
   - Phase 6: Share to X Flow
   - Phase 7: Mobile Polish + Edge Cases
   - Phase 8: Deployment
8. [Card Design Spec](#8-card-design-spec)
9. [Field Definitions](#9-field-definitions)
10. [Edge Cases & Handling](#10-edge-cases--handling)
11. [Asset Placeholder Map](#11-asset-placeholder-map)
12. [Open Questions / Decisions Log](#12-open-questions--decisions-log)

---

## 1. Product Overview

**What it is:** A zero-login, single-page web tool where a builder uploads their photo, fills in a few fields, and instantly receives a shareable HH Goa 2026 Builder ID Card — ready to download and post to X.

**Who it's for:** Hackers, builders, founders, and developers attending or interested in HH Goa 2026. Primary usage channel: mobile (Instagram/X/WhatsApp referrals). Secondary: desktop.

**Core promise:**
- Upload → Crop → Fill → Card generated → Download or Share — in under 10 seconds.
- No login. No friction. One pass, start to finish.

---

## 2. Goals & Non-Goals

### Goals
- Accept photo uploads in JPG, PNG, and HEIC (iPhone default format).
- Let users crop and frame their photo before it hits the card.
- Render a portrait-orientation ID card with a rectangular photo cutout.
- Support both: picking a "Builder Title" from a fun curated list, OR typing a custom one.
- Download the card as a real PNG file.
- Share to X with a pre-filled tweet and the image attached (via `data:` URL download + Twitter Web Intent).
- Subtle reveal animation when the card generates.
- Work beautifully on mobile.
- Deploy as a static site (Vercel / Netlify / GitHub Pages — zero backend).

### Non-Goals (for v1)
- No login, auth, or user accounts.
- No server-side image processing (everything in browser).
- No database — nothing is stored anywhere.
- No Format A (PFP Frame) in this version.
- No OG image / link preview sharing (direct image attach only).
- No printed card format — digital-first layout only.
- No multi-language support.

---

## 3. Architecture Decision

**Fully frontend-only, client-side rendering.**

All image processing — HEIC conversion, cropping, canvas rendering, PNG export — happens in the user's browser. No server touches the photo. This means:

- Zero infrastructure cost.
- Instant deploys via GitHub push.
- GDPR/privacy trivially satisfied (photos never leave the device).
- No cold start latency, no API timeouts.

### Why this works for this use case
HTML5 Canvas can composite images, draw text, apply clipping masks, and export to PNG entirely in-browser. Libraries like `heic2any` handle HEIC conversion client-side using WebAssembly. The only external dependency at runtime is the fonts (loaded from Google Fonts CDN).

### Trade-off acknowledged
Very large HEIC files (iPhone ProRAW, 40–80MB) may take 3–5 seconds to convert in-browser on a mid-range Android. This is called out in the Edge Cases section with a mitigation strategy.

---

## 4. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | **Vanilla HTML/CSS/JS** or **React (Vite)** | React recommended — component state maps cleanly to multi-step flow; Vite gives fast HMR |
| Image crop | **react-easy-crop** | Lightweight, touch-friendly, outputs pixel crop coords |
| HEIC conversion | **heic2any** (npm) | Client-side HEIC→JPEG/PNG via WebAssembly; no server needed |
| Canvas rendering | **HTML5 Canvas API** (native) | Sufficient for this use case; no Three.js or Fabric.js needed |
| Confetti/animation | **canvas-confetti** (npm) | Tiny, no-dependency burst animation |
| Fonts | **Google Fonts** (CDN) | Space Grotesk + Inter — see Design System |
| Export | Native Canvas `toDataURL('image/png')` | Direct PNG blob download |
| Share to X | **Twitter Web Intent URL** | Opens pre-filled tweet; image downloaded first via anchor tag |
| Deploy | **Vercel** (recommended) | Free tier, zero config for Vite/React, instant CDN |

**Dependencies total (npm):** ~4 packages. Keep it lean.

---

## 5. Design System

### 5.1 Aesthetic Direction

**Vibe:** Dark festival tech. Imagine a hacker badge crossed with a South Asian rave wristband — premium but irreverent. Not corporate. Not Behance-portfolio clean. Something that looks native to X/Twitter's visual culture while unmistakably screaming "Goa, builders, 2026."

The signature design element: **a glowing horizontal accent stripe** behind the builder's title text — like a highlight reel ticker — that makes the card feel alive even as a static image.

### 5.2 Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--bg-deep` | `#0A0A0F` | Card background, page background |
| `--bg-card` | `#111118` | Card surface |
| `--accent-primary` | `#7B5CF0` | Primary brand purple — borders, glows, CTAs |
| `--accent-glow` | `#A78BFA` | Lighter purple for glow effects, highlights |
| `--accent-hot` | `#F97316` | Hot orange — used sparingly, for the "title" badge only |
| `--text-primary` | `#FAFAFA` | Names, main readable text |
| `--text-secondary` | `#A1A1AA` | Labels, secondary info |
| `--text-muted` | `#52525B` | Fine print, separators |
| `--border-subtle` | `#27272A` | Card inner borders, dividers |
| `--surface-raised` | `#1C1C25` | Field backgrounds in form |

> **PLACEHOLDER NOTE:** Replace `--accent-primary` and `--accent-hot` with official HH Goa 2026 brand colors when assets are provided.

### 5.3 Typography

| Role | Family | Weight | Size (card) |
|---|---|---|---|
| Display / Name | **Space Grotesk** | 700 | 28–32px |
| Body / Labels | **Inter** | 400, 500 | 13–15px |
| Builder Title Badge | **Space Grotesk** | 800 | 14px, ALL CAPS |
| Event Tag / Fine print | **Inter** | 400 | 11px |

> **PLACEHOLDER NOTE:** If HH Goa has an official typeface, swap `Space Grotesk` for it in the display role.

### 5.4 Card Dimensions

- **Output size:** `1080 × 1350px` (4:5 ratio — optimal for X/Instagram portrait posts)
- **Canvas render size internally:** `540 × 675px` (scaled @2x before export → 1080 × 1350px)
- **Photo area:** Rectangular portrait cutout, approximately `260 × 320px` in the rendered canvas (top-left region of card)
- **Border radius on card:** `16px`
- **Photo cutout border radius:** `8px`

---

## 6. User Flow — End to End

```
[Landing / Upload Screen]
        │
        ▼
User taps "Upload Photo"
        │
        ├── JPG / PNG → skip conversion
        └── HEIC → convert to JPEG via heic2any (show spinner)
        │
        ▼
[Crop Screen]
Photo loads in react-easy-crop
User drags / pinches to frame portrait crop
Taps "Looks Good →"
        │
        ▼
[Info Form Screen]
Fields (see Section 9):
  • Name *
  • Role / Stack *
  • Where you're from (optional)
  • Builder Title: [Pick one ▾] or [Type your own]
  • X handle (optional, shown on card)
Taps "Generate My Card"
        │
        ▼
[Card Generation]
Canvas renders off-screen at 2x resolution
Reveal animation plays (card slides up + fades in)
Confetti burst fires (canvas-confetti)
        │
        ▼
[Result Screen]
Card displayed in full
  [Download PNG]  [Share to X]  [Make Another]
        │                │
        ▼                ▼
  PNG saved to     Triggers download first,
  device           then opens Twitter Web Intent
                   with pre-filled caption +
                   #FrameInGoa hashtag
```

---

## 7. Phase Breakdown

---

### Phase 0: Project Scaffold

**Goal:** Working skeleton, routing, global styles in place before any feature work begins.

**Tasks:**
1. Init Vite + React project: `npm create vite@latest hh-goa-card -- --template react`
2. Install dependencies: `react-easy-crop`, `heic2any`, `canvas-confetti`
3. Set up folder structure:
   ```
   /src
     /components
       Uploader.jsx
       Cropper.jsx
       FormFields.jsx
       CardCanvas.jsx
       ResultScreen.jsx
     /hooks
       useImageProcessor.js
       useCardRenderer.js
     /utils
       canvasHelpers.js
       shareHelpers.js
       titlesList.js
     /assets
       logo-placeholder.svg     ← replace with real HH Goa logo
       bg-texture.png           ← optional grain/noise overlay
     /styles
       global.css
       tokens.css               ← all CSS custom properties here
     App.jsx
     main.jsx
   ```
4. Define CSS custom properties (`tokens.css`) — full palette + typography scale.
5. Set up a simple `step` state in `App.jsx`: `upload → crop → form → result`. This drives which component renders.
6. Deploy scaffold to Vercel (connect GitHub repo). Every push auto-deploys from here on.

**Exit criteria:** Blank app deploys live on Vercel. Step state transitions log to console.

---

### Phase 1: Upload + HEIC Conversion

**Goal:** Accept any common photo format and normalize it to a usable JPEG/PNG blob in memory.

**Tasks:**

1. **Upload UI** (`Uploader.jsx`):
   - Full-bleed drag-and-drop zone on desktop.
   - Large tap target on mobile (min 80% viewport width button).
   - Hidden `<input type="file" accept="image/jpeg,image/png,image/heic,image/heif">`.
   - Also support drag-and-drop via `dragover` / `drop` events.
   - Show file size warning if file > 20MB (suggest compression).

2. **Format detection** (`useImageProcessor.js`):
   - Check `file.type` AND file magic bytes (first 12 bytes) — iOS sometimes sends HEIC with wrong MIME type.
   - HEIC magic bytes: `0x00 0x00 0x00 [size] 0x66 0x74 0x79 0x70 0x68 0x65 0x69 0x63` (ftyp box with "heic").

3. **HEIC conversion**:
   - If HEIC detected: call `heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 })`.
   - Show a loading spinner with copy: *"Converting your iPhone photo..."*
   - On success: store the resulting Blob in state, proceed to crop screen.
   - On error: show friendly message + option to re-upload as JPG.

4. **Non-HEIC path**:
   - Create an object URL from the file blob.
   - Load it into an `<img>` element to verify it renders.
   - Proceed to crop screen immediately.

5. **State stored after this phase:**
   ```js
   {
     originalBlob: Blob,       // the normalized JPEG/PNG
     originalObjectURL: string // for display in cropper
   }
   ```

**Edge cases handled here:**
- HEIC with wrong MIME type (iOS bug) — magic byte fallback.
- File that claims to be an image but isn't — catch canvas load error.
- User uploads a portrait vs landscape vs square — no assumptions; all go to cropper.

**Exit criteria:** Any JPG, PNG, or iPhone HEIC photo loads into the crop screen without error.

---

### Phase 2: Crop & Framing

**Goal:** Let users choose exactly what portion of their photo appears on the ID card, with a portrait-shaped crop guide.

**Tasks:**

1. **Crop component** (`Cropper.jsx`):
   - Use `react-easy-crop`.
   - Crop aspect ratio locked to `3:4` (portrait rectangle — matches card photo cutout).
   - Crop area UI: rounded rectangle outline, dimmed surround.
   - On mobile: support pinch-to-zoom and drag to reposition.
   - On desktop: scroll-to-zoom + drag.

2. **Controls:**
   - Zoom slider (range input, styled to match design system).
   - "Rotate 90°" button — for photos shot sideways.
   - "Looks Good →" CTA to confirm crop and move to form.
   - "← Back" to re-upload.

3. **Preview of crop:**
   - Show a small live preview card silhouette (simplified) in the corner of the crop screen, showing how the cropped area will look placed on the actual card. This helps users understand the portrait orientation requirement before committing.

4. **Crop output** (`canvasHelpers.js — getCroppedImg()`):
   - Use `react-easy-crop`'s `onCropComplete` callback which returns `croppedAreaPixels: { x, y, width, height }`.
   - Draw the source image on an offscreen canvas using those pixel coordinates.
   - Export via `canvas.toBlob('image/jpeg', 0.92)`.
   - Store the cropped blob + object URL in state.

5. **State stored after this phase:**
   ```js
   {
     croppedBlob: Blob,
     croppedObjectURL: string,
     croppedAreaPixels: { x, y, width, height }
   }
   ```

**Edge cases handled here:**
- Landscape photo uploaded → cropper gives full room to reframe into portrait without forced clipping.
- Very small image (< 400px wide) → show warning: "Your photo may look pixelated. For best results upload a higher-res photo."
- User zooms out entirely → enforce minimum crop size (prevent blank/near-blank crop).

**Exit criteria:** A correctly proportioned rectangular crop of the user's photo is stored in state and ready to be composited onto the card canvas.

---

### Phase 3: Form Fields

**Goal:** Collect the minimal information needed to populate the ID card — fast, fun, and Gen Z-friendly.

**Tasks:**

1. **Form component** (`FormFields.jsx`):
   - Show a mini preview of the cropped photo (circular thumb or small rect) at the top as continuity anchor.
   - Fields laid out in a single-column vertical stack.
   - Auto-focus first field on mount.
   - "Generate My Card" CTA button at bottom — disabled until required fields are filled.

2. **Fields (see full spec in Section 9):**
   - Name (required, text input)
   - Role / Stack (required, text input with placeholder examples)
   - City / Country (optional, text input)
   - X handle (optional, text input — strip @ if user includes it, re-display with @)
   - Builder Title (required — toggle between "Pick one" mode and "Type my own" mode)

3. **Builder Title — Pick Mode:**
   - Renders as a horizontally scrollable chip rail (like Instagram story reactions).
   - Pre-filled with ~20 curated titles from `titlesList.js` (see Section 9).
   - Tapping a chip selects it (highlights in accent color).
   - One chip selected at a time.

4. **Builder Title — Type Mode:**
   - Toggle via a small "or type your own ✏️" link below the chip rail.
   - Reveals a text input, hides chips.
   - Max 32 characters enforced with live character counter.
   - Toggle back resets to pick mode.

5. **Validation:**
   - Name and Role are required; everything else optional.
   - Builder Title required (must have either a picked chip or typed text).
   - No complex regex — just `value.trim().length > 0`.
   - Inline error messages appear on blur (not on every keystroke).

6. **State stored after this phase:**
   ```js
   {
     name: string,
     role: string,
     city: string,        // optional
     xHandle: string,     // optional, stored without @
     builderTitle: string // from pick or type
   }
   ```

**Exit criteria:** All fields validate and "Generate My Card" becomes active.

---

### Phase 4: Card Canvas Rendering

**Goal:** Composite all elements onto an HTML5 Canvas to produce the final ID card image at 2× resolution.

**The canvas draws everything in this layer order (bottom to top):**

```
Layer 1: Card background fill (#111118)
Layer 2: Subtle noise/grain texture (optional, SVG filter or PNG overlay at low opacity)
Layer 3: Accent border — 2px purple glow along card edge
Layer 4: HH Goa 2026 logo (top-right, placeholder SVG)
Layer 5: "HH GOA 2026 // BUILDER PASS" label (top-left, small caps)
Layer 6: Cropped photo (rectangular, rounded corners, left-center zone)
Layer 7: Thin purple border around photo rectangle
Layer 8: Name text (bold, white, below photo or beside it depending on layout)
Layer 9: Role/Stack label text (secondary color, below name)
Layer 10: City + X handle (muted, small)
Layer 11: Builder Title badge — hot orange pill/stripe with ALL CAPS text
Layer 12: Horizontal rule (separator line, subtle)
Layer 13: Footer row: HH Goa event date + website placeholder
Layer 14: QR code placeholder area (optional, see Section 11)
```

**Tasks (`useCardRenderer.js`):**

1. Create an offscreen `canvas` element at `1080 × 1350px`.
2. Set `canvas.style.display = 'none'` — never in DOM.
3. Draw each layer in sequence using the Canvas 2D API.
4. For text: load fonts via `document.fonts.load(...)` BEFORE drawing. Canvas ignores fonts not yet loaded.
5. For the cropped photo: create an `HTMLImageElement`, set `.src` to `croppedObjectURL`, wait for `onload`, then `ctx.drawImage(...)` with `ctx.roundRect()` clipping mask.
6. Return the canvas element (kept in a ref for later export).

**Performance notes:**
- This render should complete in < 500ms on modern devices.
- Run the render in a `useEffect` triggered after form submission — not on every keystroke.
- If needed, use `requestAnimationFrame` to avoid blocking the main thread during heavy draw calls.

**Exit criteria:** Off-screen canvas contains the complete card image. Visual check: call `canvas.toDataURL()` and display in an `<img>` tag temporarily during development.

---

### Phase 5: Generation Animation + Download

**Goal:** The moment the card generates should feel like an event — a small dopamine hit.

**Tasks:**

1. **Transition from form to result screen:**
   - Form fades out (CSS opacity 0, 200ms).
   - Short 300ms "hold" beat.
   - Card slides up from 30px below its final position + fades in (CSS transform + opacity, 400ms ease-out).

2. **Confetti burst** (`canvas-confetti`):
   - Fire immediately when card becomes visible.
   - Config: `{ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#7B5CF0', '#A78BFA', '#F97316', '#FAFAFA'] }`.
   - One-shot, does not repeat.
   - Respects `prefers-reduced-motion`: if user has reduced motion enabled, skip confetti entirely.

3. **Display the card:**
   - Convert canvas to a data URL: `canvas.toDataURL('image/png')`.
   - Set as `src` of an `<img>` element in `ResultScreen.jsx`.
   - Show the card at max `min(90vw, 380px)` width, centered.

4. **Download button:**
   - Create an `<a>` element with `href = dataURL`, `download = 'hh-goa-2026-builder-pass.png'`.
   - Programmatically click it.
   - Label: "Save Card 💾"
   - On iOS Safari: `toDataURL` download via anchor works. Test specifically.

5. **Make Another button:**
   - Resets all state back to step 0 (upload screen).
   - Does NOT clear the canvas or memory until next upload begins (GC handles it).

**Exit criteria:** Card appears with animation, confetti fires, PNG downloads correctly on both iOS Safari and Android Chrome.

---

### Phase 6: Share to X Flow

**Goal:** Let users share their card to X in one tap, with the image attached and caption pre-filled.

**How Twitter Web Intent works with images:**
Twitter's Web Intent URL (`https://twitter.com/intent/tweet?text=...`) does NOT accept image URLs directly. The only reliable approach for a static frontend is:

> **Strategy:** Trigger the PNG download first (so they have the file), then immediately open the Twitter intent in a new tab. Show a tooltip: *"Image downloaded — attach it to your tweet!"*

**Tasks (`shareHelpers.js`):**

1. **`shareToX(dataURL, cardFields)` function:**
   ```
   Step 1: Trigger download (same as download button above)
   Step 2: Wait 300ms (give browser time to initiate download dialog)
   Step 3: Build tweet text:
           "Just got my Builder Pass for HH Goa 2026 🌊🛠️
            Building: [role]
            See you in Goa!
            #FrameInGoa #HHGoa2026"
   Step 4: Encode text: encodeURIComponent(tweetText)
   Step 5: Open: window.open(`https://twitter.com/intent/tweet?text=${encoded}`, '_blank')
   ```

2. **Share button UI:**
   - Label: "Share to X 𝕏"
   - On mobile: before triggering, show a bottom sheet / toast: *"We'll download your card first, then open X so you can attach it to your tweet."*
   - Tap "Got it → Share" to proceed.
   - This removes user confusion about why a download happens before X opens.

3. **iOS-specific handling:**
   - `window.open()` is blocked by iOS Safari if not called inside a direct user gesture handler. Ensure the open call is synchronous within the click handler (not inside a setTimeout chain).
   - Workaround: trigger download via anchor, then call `window.open` directly — both in the same click handler.

**Exit criteria:** Tapping Share to X downloads the PNG and opens a pre-filled tweet on X with correct hashtags. Verified on iOS Safari and Android Chrome.

---

### Phase 7: Mobile Polish + Edge Cases

**Goal:** The tool must feel native on a phone — this is where most users will be.

**Tasks:**

1. **Viewport / layout:**
   - `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">` — prevent double-tap zoom.
   - All tap targets minimum `44 × 44px` (Apple HIG standard).
   - No horizontal scroll at any step.
   - Test at 375px (iPhone SE), 390px (iPhone 14), 414px (iPhone Plus), 360px (Android mid-range).

2. **Safe area insets:**
   - Apply `padding-bottom: env(safe-area-inset-bottom)` on the bottom CTA bar for notched phones and Dynamic Island devices.

3. **Font loading:**
   - Use `<link rel="preconnect">` for Google Fonts.
   - Add `font-display: swap` to prevent FOUT (flash of unstyled text).
   - Canvas text draw must wait for `document.fonts.ready` promise.

4. **HEIC on older Android:**
   - `heic2any` uses WebAssembly. Not all Android browsers support WASM.
   - Fallback: detect WASM support (`typeof WebAssembly === 'object'`). If unavailable, show: *"Please convert your photo to JPG before uploading — your browser doesn't support automatic conversion."*

5. **Large file handling:**
   - Files > 15MB: show a "This might take a moment…" inline message during HEIC conversion.
   - Files > 40MB (ProRAW): show a warning before conversion starts and suggest compressing first.

6. **Memory management:**
   - Call `URL.revokeObjectURL()` on old object URLs when a new photo is uploaded (prevent memory leak across multiple uploads in one session).

7. **Keyboard on mobile:**
   - Form fields: set `inputMode`, `autocomplete`, `autocapitalize` appropriately.
     - Name: `autocapitalize="words"`, `autocomplete="name"`
     - X handle: `autocapitalize="none"`, `autocomplete="off"`
     - Role: `autocapitalize="none"`, `spellcheck="false"`

8. **PWA readiness (optional, nice to have):**
   - Add `manifest.json` with name, short name, theme color, icons.
   - Add `<meta name="theme-color" content="#0A0A0F">` to match dark background.
   - This makes "Add to Home Screen" look polished on iOS/Android.

**Exit criteria:** Full flow works without visual glitches on iPhone Safari, Chrome Android, and Samsung Internet. Download and Share work on all three.

---

### Phase 8: Deployment

**Goal:** Live URL that anyone can share, on a reliable CDN.

**Tasks:**

1. **Vercel (recommended):**
   - Connect GitHub repo to Vercel dashboard.
   - Build command: `npm run build`
   - Output directory: `dist`
   - Set environment: Node 20.x
   - Every push to `main` → auto-deploy.
   - Every PR → preview deployment with its own URL.

2. **Netlify (alternative):**
   - Same config, `netlify.toml`:
     ```toml
     [build]
       command = "npm run build"
       publish = "dist"
     ```

3. **GitHub Pages (simplest, no account needed):**
   - Add `base: '/repo-name/'` to `vite.config.js`.
   - Use GitHub Actions workflow to build and deploy to `gh-pages` branch.

4. **Pre-deploy checklist:**
   - [ ] All placeholder assets replaced (logo, brand colors, fonts if custom).
   - [ ] `<title>` and `<meta description>` set to HH Goa 2026 copy.
   - [ ] OG tags set (even without link-preview sharing, good hygiene):
     - `og:title`, `og:description`, `og:image` (static banner of the tool itself).
   - [ ] Favicon set.
   - [ ] 404 redirect configured (Vercel: automatic; Netlify: `_redirects` file).
   - [ ] Test on real device (not just Chrome DevTools mobile emulation).
   - [ ] Test HEIC upload from a real iPhone.

---

## 8. Card Design Spec

### Layout Grid (at 540 × 675px canvas / exported 1080 × 1350px)

```
┌─────────────────────────────────────────┐
│  [LOGO]               HH GOA 2026       │  ← Header zone (60px tall)
│                       BUILDER PASS      │
├─────────────┬───────────────────────────┤
│             │  [NAME]                   │
│  [PHOTO     │  [Role / Stack]           │  ← Main content zone
│   RECT      │  [City]  @[handle]        │  (500px tall)
│   260×320]  │                           │
│             │  ╔═══════════════════╗    │
│             │  ║  BUILDER TITLE    ║    │  ← Orange badge
│             │  ╚═══════════════════╝    │
│             │                           │
├─────────────┴───────────────────────────┤
│  ── ── ── ── ── ── ── ── ── ── ── ── ─  │  ← Dashed divider
│  goa.hackathon.com    ∙  Jan 2026       │  ← Footer zone (60px)
└─────────────────────────────────────────┘
```

### Visual Details
- **Card edges:** 2px border with a subtle purple glow (CSS `box-shadow` on preview; on canvas use `shadowBlur`).
- **Photo border:** 2px solid `#7B5CF0` (brand purple).
- **Photo corner radius:** 8px.
- **Builder Title badge:** Rounded pill, `#F97316` (hot orange) background, white text, uppercase, `Space Grotesk 800`.
- **Background:** Flat `#111118` with optional very low opacity noise texture (adds tactile quality without visual noise).
- **Footer:** Dashed separator (`ctx.setLineDash([4, 6])`), then event info in `--text-muted`.

---

## 9. Field Definitions

| Field | Required | Max Length | Placeholder | Notes |
|---|---|---|---|---|
| Name | ✅ Yes | 40 chars | "Arjun Mehta" | Displayed largest on card |
| Role / Stack | ✅ Yes | 50 chars | "Full-stack / React, Go" | Can be tech stack or role title |
| City / Country | No | 30 chars | "Mumbai, India" | Small, muted on card |
| X Handle | No | 30 chars | "@yourhandle" | Strip @ on input, re-add on card |
| Builder Title | ✅ Yes | 32 chars | — | From pick or type |

### Curated Builder Title List (`titlesList.js`)
Twenty options — range from technical to chaotic to fun:

```js
export const BUILDER_TITLES = [
  "VIBE ENGINEER",
  "FULL STACK GREMLIN",
  "SHIP IT OR SKIP IT",
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
  "BUILDING IN PUBLIC"
];
```

---

## 10. Edge Cases & Handling

| Scenario | Expected Behaviour |
|---|---|
| HEIC file from iPhone (standard) | Auto-converted to JPEG via heic2any, user sees spinner |
| HEIC file from iPhone ProRAW (40–80MB) | Warning shown before conversion; may take 5–8s |
| HEIC on browser without WebAssembly | Friendly error + prompt to upload JPG instead |
| Landscape photo uploaded | Cropper accommodates; user reframes to 3:4 portrait |
| Square photo (e.g. old Instagram photo) | Cropper accommodates; user zooms/frames |
| Very small image (< 400px wide) | Warning about potential quality; proceeds anyway |
| Non-image file uploaded (PDF, video) | Input `accept` attribute filters; add JS check as backup |
| User leaves Name or Role blank | "Generate" button stays disabled; no form submit |
| Builder Title left unselected | "Generate" button stays disabled |
| X handle pasted with @ | Strip @ automatically on input |
| Extremely long name (> 40 chars) | Input enforces maxLength; canvas wraps to two lines gracefully |
| Canvas export fails | Catch error, show: "Something went wrong generating your card — try again?" |
| Download blocked on iOS | Show: "Long-press the card image to save it to your photos" as fallback |
| User hits Back mid-flow | State preserved — they can go back to crop or form without re-uploading |
| Multiple uploads in same session | Revoke previous object URLs to prevent memory leak |
| Slow mobile on HEIC conversion | Loading state with animated spinner; no timeout cutoff |
| prefers-reduced-motion enabled | Skip confetti animation entirely; card still reveals |
| Ad blocker blocking Google Fonts | System font fallback: `system-ui, -apple-system, sans-serif` |
| User opens on very old browser (IE11) | Not supported; show a message: "Please open in Chrome, Safari, or Firefox" |

---

## 11. Asset Placeholder Map

These are the assets you need to supply. Everything else is handled in code.

| Asset | Format | Where Used | Placeholder in Code |
|---|---|---|---|
| HH Goa 2026 Logo | SVG preferred, PNG fallback | Card header (top-right) | `logo-placeholder.svg` (text "HH GOA" in accent color) |
| Brand primary color | Hex value | Borders, CTAs, glow, badges | `#7B5CF0` (replace in `tokens.css`) |
| Brand secondary/accent color | Hex value | Builder title badge | `#F97316` (replace in `tokens.css`) |
| Official typeface | Font file or Google Fonts name | Card display text | `Space Grotesk` (replace if custom font) |
| Event date string | Text | Card footer | `"GOA • JAN 2026"` (update with real date) |
| Event website | URL text | Card footer | `"goa.hackathon.com"` (update with real URL) |
| Background texture (optional) | PNG, low opacity | Card background layer | No placeholder — add if desired |
| Favicon | 32×32 ICO or PNG | Browser tab | HH Goa logo or initials |
| OG image for tool page | 1200×630 PNG | `<meta og:image>` | Static banner of a sample card |

---

## 12. Open Questions / Decisions Log

| # | Question | Status | Decision |
|---|---|---|---|
| 1 | Should the card show a QR code? (Could link to event site) | **Open** | Not in v1; leave placeholder space in footer |
| 2 | What is the exact event date for the footer? | **Open** | Placeholder: "GOA • JAN 2026" |
| 3 | What is the real website URL for HH Goa 2026? | **Open** | Placeholder: "goa.hackathon.com" |
| 4 | Official HH Goa 2026 brand colors? | **Open** | Using purple/orange until provided |
| 5 | Official font / typeface? | **Open** | Using Space Grotesk + Inter until confirmed |
| 6 | Should Format A (PFP Frame) be built in parallel or in v2? | **Open** | v2 candidate; scaffold is compatible |
| 7 | Is there a specific tweet copy / tone requirement? | **Open** | Default caption defined in Phase 6; can override |
| 8 | Should we track usage analytics (privacy-safe)? | **Open** | Plausible.io or simple Vercel analytics — decide before launch |
| 9 | Is there a launch deadline / target date? | **Open** | Will affect scope of Phase 7 polish |
| 10 | Are there any prohibited content checks needed? | **Open** | Not in v1 (no uploads leave the device) |

---

*Document version: 1.0 — drafted for HH Goa 2026 Shortlisting Task*
*Update this doc as asset decisions are made. All placeholder values are clearly marked.*