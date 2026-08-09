# HH Goa 2026 — Final ID Card Integration Doc
## Adding `hh_goa_2026_builder_id_FINAL.html` as the Downloadable Card

---

## Context for the Agent

You have a working React + Vite app with 8 screens already implemented per the previous doc.  
The existing `useCardRenderer.js` tries to rebuild the card using raw Canvas API drawing commands.  
**That approach must be replaced.** The new final card (`hh_goa_2026_builder_id_FINAL.html`) uses:

- CSS `clip-path` (diagonal photo cutout)
- `radial-gradient` serrated perforations (top and bottom)
- `writing-mode: vertical-rl` (left spine text)
- `::before` / `::after` pseudo-elements (dot-grid texture, diagonal accent, tile stripe)
- Absolute positioning with `z-index` layering
- `Bebas Neue` font (not in current font stack — must be added)

None of these can be faithfully reproduced with raw `ctx.drawImage()` + `ctx.fillText()` Canvas calls.  
**The correct approach is `html2canvas`** — render the actual HTML card DOM node to a canvas, then export as PNG. This gives pixel-perfect output matching the design with zero reimplementation work.

---

## What Changes vs What Stays

| File | Status | What |
|---|---|---|
| `package.json` | ✏️ UPDATE | Add `html2canvas` |
| `index.html` | ✏️ UPDATE | Add `Bebas Neue` to Google Fonts link |
| `src/styles/tokens.css` | ✏️ UPDATE | Add `--navy` token |
| `src/components/ArtifactFront.jsx` | ✏️ REWRITE | Render the actual HTML card component instead of an `<img>` |
| `src/components/ArtifactBack.jsx` | ✏️ REWRITE | Render the actual HTML back card component |
| `src/hooks/useCardRenderer.js` | ✏️ REWRITE | Replace Canvas API with html2canvas |
| `src/utils/canvasHelpers.js` | 🗑️ DEPRECATE | No longer used — keep file, empty it, add a comment |
| `src/components/CardFront.jsx` | 🆕 NEW | The card front as a React component (from HTML) |
| `src/components/CardBack.jsx` | 🆕 NEW | The card back as a React component (from HTML) |
| `src/components/ResultScreen.jsx` | ✏️ UPDATE | Download now calls html2canvas on CardFront ref |
| `src/components/ScanningScreen.jsx` | ✅ KEEP | No changes needed |
| `src/components/Uploader.jsx` | ✅ KEEP | No changes needed |
| `src/components/Cropper.jsx` | ✅ KEEP | No changes needed |
| `src/components/FormFields.jsx` | ✅ KEEP | No changes needed |
| `src/components/PfpScreen.jsx` | ✏️ UPDATE | Use cropped photo + formData only (no canvas render) |
| `src/App.jsx` | ✏️ UPDATE | Pass cardFrontRef down to ResultScreen |

---

## Phase 1 — Install html2canvas + Add Bebas Neue Font

### 1.1 Install the package

```bash
npm install html2canvas
```

> **Why html2canvas and not dom-to-image or similar?**  
> html2canvas has the best support for `clip-path`, CSS gradients, and `writing-mode` among client-side HTML-to-image libraries. It handles the perforations, diagonal clip, and spine correctly.

### 1.2 Update `index.html` — add Bebas Neue

In `<head>`, find the existing Google Fonts `<link>` and add `Bebas+Neue` to the family list:

**Find this pattern (existing):**
```
family=Teko:wght@300;400;500;600;700&family=Space+Mono...&family=Unbounded...
```

**Add to it:**
```
&family=Bebas+Neue
```

Full updated link should include all 5 families:
```html
<link href="https://fonts.googleapis.com/css2?family=Teko:wght@300;400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Abril+Fatface&family=Unbounded:wght@400;700;900&family=Bebas+Neue&display=swap" rel="stylesheet">
```

### 1.3 Update `src/styles/tokens.css` — add missing token

Add this line to the existing `:root` block:
```css
--navy: #0D2340;
```

**Exit check:** `npm run dev` — no errors. `document.fonts` should now include Bebas Neue.

---

## Phase 2 — CardFront.jsx (New Component)

**File:** `src/components/CardFront.jsx` — CREATE NEW

This component is a **pure presentational React component** that renders the front card exactly as it appears in the HTML reference. It receives `formData` and `croppedImageURL` as props and renders them into the correct slots.

### 2.1 Component signature

```jsx
// CardFront.jsx
// Props:
//   formData: { name, stack, builderTitle, city, xHandle }
//   croppedImageURL: string (the cropped photo blob URL)
//   cardRef: React.RefObject  (forwarded from parent for html2canvas targeting)

export default function CardFront({ formData, croppedImageURL, cardRef }) {
  // Derive first/last name
  const nameParts = (formData.name || '').trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Serial number: generate once on mount, store in ref (not state — no re-render needed)
  const serial = useRef(String(Math.floor(Math.random() * 900) + 100));

  return (
    <div className="card-front" ref={cardRef}>
      {/* ... full JSX below ... */}
    </div>
  );
}
```

### 2.2 Full JSX structure

Convert the HTML front card structure to JSX. Key rules:
- All `class=` → `className=`
- All inline `style=""` → `style={{ }}`
- Self-closing tags: `<div />`, `<img />`, etc.
- The `[PHOTO]` slot: replace with a conditional:

```jsx
{/* PERSON ZONE — photo or placeholder */}
<div className="f-person-zone">
  {croppedImageURL ? (
    <img
      src={croppedImageURL}
      alt="Builder photo"
      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
    />
  ) : (
    <div className="f-person-ph">
      YOUR<br/>FACE<br/>GOES<br/>HERE
    </div>
  )}
</div>
```

- The `[NAME_FIRST]` slot:
```jsx
<div className="f-name-first">{firstName || 'YOUR'}</div>
```

- The `[NAME_LAST]` slot:
```jsx
<div className="f-name-last">{lastName || 'NAME'}</div>
```

- The `[ALIAS]` slot (builder title):
```jsx
<div className="f-title-box"><span>{formData.builderTitle || 'BUILDER ALIAS'}</span></div>
```

- The `[STACK]` slot:
```jsx
<div className="f-stack-val">
  {(formData.stack || 'YOUR STACK').split(/[/,]/).map(s => s.trim()).map((s, i) => (
    <span key={i}>{s}<br/></span>
  ))}
</div>
```

- The `[SERIAL]` slot (eyebrow + spine number):
```jsx
<div className="f-eyebrow">// REGISTERED BUILDER #{serial.current}</div>
{/* spine */}
<div className="f-lb-num">{serial.current.slice(-2)}</div>
```

- The barcode number at bottom of card back (used in CardBack, not here):
  `HH-GOA-2026-{serial}-{lastName}`

### 2.3 CSS

Copy the **entire `<style>` block** from `hh_goa_2026_builder_id_FINAL.html` lines 29–818 into a new file:

```
src/styles/cardStyles.css
```

Import it in `CardFront.jsx`:
```jsx
import '../styles/cardStyles.css';
```

> **Important:** Remove the `body { ... }` rule from `cardStyles.css` — it will conflict with the app's global body style. Only keep component-level rules (`.card-front`, `.f-*`, `.perf-*`, `.card-back`, `.back-*`).

Also remove the `.screen-label` rule from `cardStyles.css` — it already exists in `index.css`.

**Exit check:** Import `CardFront` into a temporary test screen. Pass dummy `formData` and a test image URL. Verify it renders and looks identical to the HTML reference at 340px width.

---

## Phase 3 — CardBack.jsx (New Component)

**File:** `src/components/CardBack.jsx` — CREATE NEW

```jsx
// CardBack.jsx
// Props:
//   formData: { name, stack, builderTitle, city }
//   serial: string (pass down from CardFront or generate independently)

export default function CardBack({ formData, serial }) {
  const nameParts = (formData.name || '').trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Parse stack into ingredient rows
  const stackItems = (formData.stack || '')
    .split(/[/,]/)
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 2); // max 2 from user input; rest are fixed

  const batchCode = `GOA-26-${serial}`;

  return (
    <div className="card-back">
      {/* ... full JSX below ... */}
    </div>
  );
}
```

### Dynamic slots in the back card

- `[BATCH]` → `{batchCode}`
- `[NAME_FIRST] [NAME_LAST]` in mfg block → `FOR: {formData.name.toUpperCase()}`
- `[ALIAS]` in mfg block → `ALIAS: {formData.builderTitle.toUpperCase()}`
- `[CITY]` → `{formData.city ? formData.city.toUpperCase() : 'GOA, INDIA'}`
- `[CERTIFIER]` → `CERTIFIED BY: @247PMSTUDIO` (static)
- Barcode number → `HH-GOA-2026-{serial}-{lastName.toUpperCase()}`

### Ingredients table — dynamic first row

The ingredients table has 5 rows. The first row comes from `formData.stack`, the rest are fixed:

```jsx
<table className="ing-table">
  {/* Row 1: from user's stack */}
  <tr>
    <td>{stackItems.join(' / ') || 'YOUR STACK'}</td>
    <td><div className="bar-track"><div className="bar-fill" style={{width:'62%'}}></div></div></td>
    <td>62%</td>
  </tr>
  {/* Rows 2-5: fixed */}
  <tr>
    <td>CONTROLLED CHAOS</td>
    <td><div className="bar-track"><div className="bar-fill p" style={{width:'18%'}}></div></div></td>
    <td>18%</td>
  </tr>
  <tr>
    <td>BLACK COFFEE (ARABICA)</td>
    <td><div className="bar-track"><div className="bar-fill y" style={{width:'10%'}}></div></div></td>
    <td>10%</td>
  </tr>
  <tr>
    <td>GOA SUNLIGHT (UV-GRADE)</td>
    <td><div className="bar-track"><div className="bar-fill g" style={{width:'7%'}}></div></div></td>
    <td>7%</td>
  </tr>
  <tr>
    <td>QUESTIONABLE IDEAS (TRACE)</td>
    <td><div className="bar-track"><div className="bar-fill b" style={{width:'3%'}}></div></div></td>
    <td>3%</td>
  </tr>
</table>
```

`cardStyles.css` imported in `CardFront.jsx` covers all `.card-back` and `.back-*` styles — no additional import needed in `CardBack.jsx`.

**Exit check:** CardBack renders with correct name, batch code, stack ingredient in first row, and dynamic barcode number.

---

## Phase 4 — useCardRenderer.js (Rewrite with html2canvas)

**File:** `src/hooks/useCardRenderer.js` — FULL REWRITE

Delete all existing content. Replace with:

```js
import html2canvas from 'html2canvas';

export function useCardRenderer() {
  // renderFront: takes a DOM ref pointing to the .card-front div
  // Returns a PNG data URL string
  const renderFront = async (cardDomRef) => {
    if (!cardDomRef || !cardDomRef.current) {
      throw new Error('Card DOM ref is not attached');
    }

    // Wait for all fonts to be ready before capture
    await document.fonts.ready;

    const canvas = await html2canvas(cardDomRef.current, {
      scale: 3,              // 3× = high DPI output (~1020px wide for a 340px card)
      useCORS: true,         // needed if croppedImageURL is a blob: URL (it is)
      allowTaint: false,
      backgroundColor: null, // preserve card's own background
      logging: false,
      // Scroll offsets — important on mobile where scroll position can affect capture
      scrollX: 0,
      scrollY: 0,
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight,
    });

    return canvas.toDataURL('image/png');
  };

  return { renderFront };
}
```

### Why `scale: 3`

The card is 340px wide in CSS. At scale 3, the output PNG is 1020px wide — sharp on all screens including Retina/HDPI. This is the downloadable image.

### Why `useCORS: true`

The user's cropped photo is stored as a `blob:` URL (created via `URL.createObjectURL()`). html2canvas needs this flag to draw it without a CORS taint error.

### Known html2canvas limitations to handle

| CSS Feature | html2canvas Support | Mitigation |
|---|---|---|
| `clip-path: polygon()` | ✅ Supported in v1.4+ | None needed |
| `radial-gradient` (perforations) | ✅ Supported | None needed |
| `writing-mode: vertical-rl` | ✅ Supported | None needed |
| `::before` / `::after` | ✅ Supported | None needed |
| `box-shadow` with offset | ✅ Supported | None needed |
| `-webkit-text-stroke` | ⚠️ Partial | Test. If broken, apply stroke via `text-shadow` fallback on `.f-name-last` |
| `transform: rotate()` on elements | ✅ Supported | None needed |

> **If `-webkit-text-stroke` on `.f-name-last` doesn't render:** Add this fallback to `cardStyles.css`:
> ```css
> .f-name-last {
>   text-shadow:
>     -1px -1px 0 var(--ink), 1px -1px 0 var(--ink),
>     -1px 1px 0 var(--ink), 1px 1px 0 var(--ink);
>   /* keep -webkit-text-stroke as well for real browsers */
> }
> ```

**Exit check:** Call `renderFront(cardRef)` in a test button. Inspect the downloaded PNG. It should look identical to the card rendered in the browser at 1020px wide.

---

## Phase 5 — ArtifactFront.jsx (Rewrite)

**File:** `src/components/ArtifactFront.jsx` — REWRITE

This screen now renders the actual `CardFront` React component (not an `<img>`), and triggers html2canvas to capture it on mount so the PNG is ready before the user even taps Download.

```jsx
import { useRef, useEffect, useState } from 'react';
import CardFront from './CardFront';
import { useCardRenderer } from '../hooks/useCardRenderer';

export default function ArtifactFront({ setStep, formData, croppedImageURL, onCardReady }) {
  const cardRef = useRef(null);
  const { renderFront } = useCardRenderer();
  const [rendering, setRendering] = useState(true);

  useEffect(() => {
    // Pre-render the card to PNG as soon as this screen mounts
    // (user sees the card, render happens in background)
    const preRender = async () => {
      try {
        // Small delay to let fonts/images paint first
        await new Promise(r => setTimeout(r, 600));
        const dataURL = await renderFront(cardRef);
        onCardReady(dataURL); // store in App state
      } catch (e) {
        console.error('Card render failed:', e);
      } finally {
        setRendering(false);
      }
    };
    preRender();
  }, []);

  return (
    <div style={{ background: '#0e0a06', padding: '28px 16px' }}>

      {/* Screen label */}
      <div className="screen-label">04 · YOUR BUILDER ARTIFACT · FRONT</div>

      {/* The actual card — displayed AND used as capture target */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <CardFront
          formData={formData}
          croppedImageURL={croppedImageURL}
          cardRef={cardRef}
        />
      </div>

      {/* Rendering indicator */}
      {rendering && (
        <div style={{
          textAlign: 'center', marginTop: '12px',
          fontFamily: 'Space Mono', fontSize: '8px',
          color: '#444', letterSpacing: '.15em'
        }}>
          // GENERATING HIGH-RES PNG…
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button className="act-btn primary" onClick={() => setStep('artifact-back')}>
          FLIP → SEE BACK
        </button>
        <button className="act-btn ghost" onClick={() => setStep('result')}>
          SKIP TO DOWNLOAD
        </button>
      </div>

    </div>
  );
}
```

### Update `App.jsx` to handle `onCardReady`

In `App.jsx`, add state:
```jsx
const [cardDataURL, setCardDataURL] = useState(null);
```

Pass to `ArtifactFront`:
```jsx
'artifact-front': <ArtifactFront
  setStep={setStep}
  formData={formData}
  croppedImageURL={croppedImageURL}
  onCardReady={setCardDataURL}
/>
```

Pass `cardDataURL` to `ResultScreen`:
```jsx
'result': <ResultScreen
  setStep={setStep}
  formData={formData}
  cardDataURL={cardDataURL}
  cardRef={/* see below */}
/>
```

**Exit check:** ArtifactFront screen shows the real card with user's photo, name, title, stack. "// GENERATING HIGH-RES PNG…" label disappears after ~1s.

---

## Phase 6 — ArtifactBack.jsx (Rewrite)

**File:** `src/components/ArtifactBack.jsx` — REWRITE

Now renders `CardBack` component. The serial must match what `CardFront` generated — pass it from `App.jsx` state, or generate it in `App.jsx` once and pass to both components.

### Update `App.jsx`

Add serial to app state:
```jsx
const [builderSerial] = useState(() => String(Math.floor(Math.random() * 900) + 100));
```
Generate once at app load (not on every render). Pass to both `CardFront` (via `formData` or separate prop) and `CardBack`.

### ArtifactBack.jsx

```jsx
import CardBack from './CardBack';

export default function ArtifactBack({ setStep, formData, serial }) {
  return (
    <div style={{ background: '#0e0a06', padding: '28px 16px' }}>

      <div className="screen-label">05 · YOUR BUILDER ARTIFACT · BACK</div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <CardBack formData={formData} serial={serial} />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button className="act-btn ghost" onClick={() => setStep('artifact-front')}>
          ← FLIP BACK
        </button>
        <button className="act-btn primary" onClick={() => setStep('result')}>
          DOWNLOAD / SHARE →
        </button>
      </div>

    </div>
  );
}
```

**Exit check:** ArtifactBack renders the product label back with dynamic name, batch code, stack ingredients, and barcode. Batch code matches what's on ArtifactFront.

---

## Phase 7 — ResultScreen.jsx (Update Download Logic)

**File:** `src/components/ResultScreen.jsx` — UPDATE download section only

The result screen already has a working download button. Update it to use `cardDataURL` from props (which was set by `ArtifactFront` via `onCardReady`).

### Replace the existing download trigger

**Old pattern (using getDataURL from canvas hook):**
```js
const dataURL = getDataURL();
```

**New pattern:**
```jsx
// Props now include: cardDataURL (string | null)

const triggerDownload = () => {
  if (!cardDataURL) {
    alert('Card is still generating — try again in a moment');
    return;
  }
  const a = document.createElement('a');
  a.href = cardDataURL;
  a.download = `hh-goa-2026-${(formData.name || 'builder').toLowerCase().replace(/\s+/g, '-')}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
```

### Fallback: Re-render on demand

Add a fallback in case the user lands on result without going through `ArtifactFront` (e.g., they used "Skip to Download" before pre-render completed):

```jsx
// ResultScreen.jsx — add ref + re-render capability
import { useRef } from 'react';
import { useCardRenderer } from '../hooks/useCardRenderer';
import CardFront from './CardFront';

export default function ResultScreen({ setStep, formData, croppedImageURL, cardDataURL, onCardReady }) {
  const cardRef = useRef(null);
  const { renderFront } = useCardRenderer();

  const triggerDownload = async () => {
    let url = cardDataURL;

    if (!url) {
      // Render on demand if pre-render didn't happen
      url = await renderFront(cardRef);
      onCardReady(url);
    }

    const a = document.createElement('a');
    a.href = url;
    a.download = `hh-goa-2026-${(formData.name || 'builder').toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Hidden card for on-demand render fallback
  // Position off-screen but in DOM so html2canvas can access it
  return (
    <>
      {/* Hidden render target (off-screen, not display:none — html2canvas needs it visible) */}
      <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', pointerEvents: 'none' }}>
        <CardFront formData={formData} croppedImageURL={croppedImageURL} cardRef={cardRef} />
      </div>

      {/* ... rest of result screen JSX ... */}
    </>
  );
}
```

> **Critical:** The hidden `CardFront` must NOT use `display: none` or `visibility: hidden`. html2canvas cannot capture invisible elements. Use `position: fixed; top: -9999px` instead to move it off-screen while keeping it in the render tree.

**Exit check:** Download button produces a PNG that matches the card design. File saves as `hh-goa-2026-[name].png`. Works even if user skipped `ArtifactFront`.

---

## Phase 8 — canvasHelpers.js (Deprecate)

**File:** `src/utils/canvasHelpers.js` — EMPTY AND COMMENT

Replace all content with:

```js
/**
 * canvasHelpers.js — DEPRECATED in V3
 *
 * Previously used for native Canvas API card rendering.
 * Replaced by html2canvas in useCardRenderer.js (Phase 4 of Card Integration Doc).
 * CardFront.jsx + CardBack.jsx now render the card as HTML/CSS.
 * This file is kept to avoid import errors in any files that still reference it.
 */

export {}; // no-op export to satisfy any existing imports
```

**Exit check:** No import errors after emptying this file. `npm run dev` clean.

---

## Phase 9 — PfpScreen.jsx (Simplify)

**File:** `src/components/PfpScreen.jsx` — UPDATE

The PFP screen previously needed canvas rendering. Now it can use the same `croppedImageURL` from the crop step directly — no canvas needed for display. For PFP download, use a small dedicated canvas just for the circular crop export.

### Round PFP Download

```js
// In PfpScreen.jsx

const downloadRoundPfp = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 500;
  canvas.height = 500;
  const ctx = canvas.getContext('2d');

  const img = new Image();
  img.src = croppedImageURL;
  img.onload = () => {
    // Yellow top half
    ctx.fillStyle = '#F0C229';
    ctx.fillRect(0, 0, 500, 250);
    // Red bottom half
    ctx.fillStyle = '#C8001E';
    ctx.fillRect(0, 250, 500, 250);

    // Circular clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(250, 250, 220, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, 30, 30, 440, 440);
    ctx.restore();

    // Circular border
    ctx.strokeStyle = '#1A1008';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(250, 250, 220, 0, Math.PI * 2);
    ctx.stroke();

    // Name text
    ctx.fillStyle = '#1A1008';
    ctx.font = '900 32px Unbounded, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(formData.name.toUpperCase(), 250, 490);

    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `hh-goa-pfp-${formData.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    a.click();
  };
};
```

This is a simple canvas operation (no complex CSS) so native Canvas API is fine here.

**Exit check:** Round PFP download button produces a 500×500 circular photo with the user's cropped image.

---

## Phase 10 — Responsiveness of Card Display

The card itself is **340px fixed width** — this is intentional and must NOT be made fluid. The card design depends on precise pixel measurements (spine width, clip-path coordinates, font sizes). Making it scale would break the design.

**What should be responsive instead** is the **wrapper around the card** on each screen.

### Apply this to ArtifactFront, ArtifactBack, and any screen that shows a card

```css
/* In index.css — add this */
.card-display-wrapper {
  display: flex;
  justify-content: center;
  overflow-x: auto;           /* horizontal scroll on very small screens */
  -webkit-overflow-scrolling: touch;
  padding: 0 0 12px;
}

/* On screens narrower than 380px, scale the card down slightly */
@media (max-width: 379px) {
  .card-front,
  .card-back {
    transform: scale(0.88);
    transform-origin: top center;
  }
}
```

Wrap all `<CardFront>` and `<CardBack>` usages in:
```jsx
<div className="card-display-wrapper">
  <CardFront ... />
</div>
```

**Exit check:** On iPhone SE (375px), the card fits without clipping. On wider phones the card is centered.

---

## Phase 11 — End-to-End Flow Check

Run through the complete flow and verify each step:

```
[ ] Upload JPG → proceeds to crop ✓
[ ] Upload PNG → proceeds to crop ✓
[ ] Upload HEIC from iPhone → converts, proceeds to crop ✓
[ ] Crop → 3:4 portrait → confirm → proceeds to form ✓
[ ] Fill name, stack, role, builder title → Generate button activates ✓
[ ] Scanning screen → all 6 lines animate → auto-advances ✓

[ ] ArtifactFront → shows real CardFront component ✓
[ ] ArtifactFront → user's cropped photo appears in photo zone ✓
[ ] ArtifactFront → name on card matches form input ✓
[ ] ArtifactFront → builder title in title box matches form input ✓
[ ] ArtifactFront → stack in f-stack-val matches form input ✓
[ ] ArtifactFront → "// GENERATING HIGH-RES PNG…" appears then disappears ✓

[ ] ArtifactBack → flip shows CardBack component ✓
[ ] ArtifactBack → batch code, name, alias in mfg block are correct ✓
[ ] ArtifactBack → stack appears in first ingredients row ✓

[ ] ResultScreen → Download button triggers PNG download ✓
[ ] Downloaded PNG → opens in image viewer, looks correct at full size ✓
[ ] Downloaded PNG → is ~1020px wide (340 × scale:3) ✓
[ ] Share to X → downloads PNG first, then opens pre-filled tweet ✓

[ ] PfpScreen → shows round PFP preview with user photo ✓
[ ] PfpScreen → Round PFP download works ✓

[ ] Full flow on iPhone Safari (375px) — no layout breaks ✓
[ ] Full flow on Chrome Android (360px) — no layout breaks ✓
[ ] Card display-wrapper scrollable on very narrow screens ✓
```

---

## Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `html2canvas` output is blank / white | Font not loaded before capture | Add `await document.fonts.ready` before the html2canvas call |
| Photo not appearing in PNG output | `useCORS: false` (default) blocking blob URL | Set `useCORS: true` in html2canvas options |
| Card appears cut off in PNG | `scrollY` offset included in capture | Set `scrollX: 0, scrollY: 0` in html2canvas options |
| `-webkit-text-stroke` not rendering in PNG | html2canvas partial support | Use `text-shadow` fallback on `.f-name-last` as documented in Phase 4 |
| Card too small on iPhone SE | Fixed 340px width wider than viewport | Apply `transform: scale(0.88)` below 380px via media query |
| `Bebas Neue` not loading | Missing from Google Fonts link | Verify Phase 1.2 was applied to `index.html` |
| Serial number different on front vs back | Each component generating its own random number | Generate serial once in `App.jsx` and pass as prop to both |
| Download produces empty file | `cardDataURL` is null at click time | Fallback re-render path in ResultScreen.jsx (Phase 7) |

---

## Summary

The only architectural change is the rendering strategy:
**Native Canvas API → html2canvas on real React components.**

The card design (`hh_goa_2026_builder_id_FINAL.html`) is split into two React components:
- `CardFront.jsx` — the front artifact card
- `CardBack.jsx` — the product label back

These components are rendered as normal React DOM and displayed directly in `ArtifactFront` and `ArtifactBack` screens. When the user downloads, `html2canvas` captures the `CardFront` DOM node at 3× scale and exports it as a PNG. The back card is display-only and not part of the download.

The rest of the app (upload, HEIC conversion, crop, form, scanning, share-to-X, PFP) is untouched.

---

*Card Integration Doc v1.0 — for `hh_goa_2026_builder_id_FINAL.html`*
*Agent: the reference HTML file is the single source of truth for all CSS and HTML structure. When in doubt, copy directly from it.*
