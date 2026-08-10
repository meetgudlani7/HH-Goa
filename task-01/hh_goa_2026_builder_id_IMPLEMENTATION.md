# HH GOA 2026 — Builder ID Card
## Implementation & Customisation Guide

---

## Files

| File | Purpose |
|---|---|
| `hh_goa_2026_builder_id_FINAL.html` | Single-file card (front + back). Open in any browser. |

No build step. No dependencies except two Google Fonts loaded from CDN. Works offline if fonts are cached.

---

## Quick Personalisation

Search the HTML for these tags — every customisable field is annotated:

| Tag | What to change | Example |
|---|---|---|
| `[NAME_FIRST]` | Builder's first name | `SRISHTI` → `ARJUN` |
| `[NAME_LAST]` | Builder's last name | `DUGGAL` → `SHARMA` |
| `[ALIAS]` | Creative / hacker alias | `THE PIXEL ALCHEMIST` |
| `[STACK]` | Tech stack, 1 item per line | `REACT` / `TYPESCRIPT` / `AI` |
| `[SERIAL]` | Builder serial # (3 digits) | `247` |
| `[BATCH]` | Batch code on back | `GOA-26-247` |
| `[CITY]` | Home city (back label only) | `DELHI, INDIA` |
| `[PHOTO]` | See photo instructions below | — |
| `[CERTIFIER]` | Studio / credit handle | `@247PMSTUDIO` |

---

## Adding the Builder Photo

Find this comment in the HTML:

```html
<!-- [PHOTO] — REPLACE THIS DIV WITH: -->
<div class="f-person-ph"> … </div>
```

Replace the entire `<div class="f-person-ph">…</div>` block with:

```html
<img src="YOUR_PHOTO.jpg"
     style="width:100%;height:100%;object-fit:cover;object-position:top center;">
```

### Photo guidelines

- **Format:** JPG or PNG, minimum 400 × 560 px (the zone is ~145 × 224 px on screen)
- **Framing:** Portrait orientation, face centred, chest-up or waist-up
- **Background:** Plain colour or blurred — the diagonal clip-path masks the bottom-right corner automatically
- **Tone:** The blue zone naturally creates a duotone feel; a slightly overexposed or desaturated photo works well
- **DO NOT** pre-crop to the clip shape — the CSS `clip-path` handles masking

### For a print-ready duotone effect (optional)

Pre-process the photo in any image editor:
1. Convert to greyscale
2. Apply a blue (`#2B5FA0`) colour overlay at ~60% opacity
3. Increase contrast by +20
4. Export as JPG at 300 dpi equivalent

---

## Generating Multiple Cards (Batch)

For an event with many builders, use a simple templating approach:

```javascript
// Node.js example
const fs = require('fs');
const template = fs.readFileSync('hh_goa_2026_builder_id_FINAL.html', 'utf8');

const builders = [
  { first: 'SRISHTI', last: 'DUGGAL', alias: 'THE PIXEL ALCHEMIST',
    stack: ['REACT','TYPESCRIPT','AI'], serial: '247', city: 'DELHI' },
  { first: 'ARJUN',   last: 'MEHTA',  alias: 'KERNEL PANIC',
    stack: ['RUST','LINUX','EMBEDDED'], serial: '248', city: 'BANGALORE' },
];

builders.forEach((b, i) => {
  let html = template
    .replace(/SRISHTI/g,              b.first)
    .replace(/DUGGAL/g,               b.last)
    .replace(/THE PIXEL ALCHEMIST/g,  b.alias)
    .replace(/REACT<br>TYPESCRIPT<br>AI/, b.stack.join('<br>'))
    .replace(/#247/g,                 `#${b.serial}`)
    .replace(/GOA-26-247/g,           `GOA-26-${b.serial}`)
    .replace(/247-DUGGAL/g,           `${b.serial}-${b.last}`);

  fs.writeFileSync(`card_${b.serial}_${b.last}.html`, html);
});
```

---

## Print Production

### Recommended specs

| Parameter | Value |
|---|---|
| Card size | 85 mm × 54 mm (standard CR80) |
| Bleed | 3 mm on all sides |
| Resolution | 300 dpi minimum |
| Colour profile | CMYK (convert from sRGB before sending to print) |
| Finish | Matte lamination recommended (matches the tactile vintage feel) |
| Stock | 350–400 gsm coated |

### HTML → print workflow

**Option A — Browser print**
1. Open in Chrome
2. `Ctrl/Cmd + P` → Save as PDF
3. Set paper size to 90 × 60 mm (card + 3 mm bleed each side)
4. Disable headers/footers, set margins to None
5. Send PDF to print house

**Option B — Puppeteer (automated)**
```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('file://' + __dirname + '/card_247_DUGGAL.html');
  await page.pdf({
    path: 'card_247_DUGGAL.pdf',
    width:  '90mm',   // 85mm + 3mm bleed each side would be 91mm — adjust to taste
    height: '60mm',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  await browser.close();
})();
```

**Option C — Wkhtmltopdf**
```bash
wkhtmltopdf \
  --page-width 90mm \
  --page-height 60mm \
  --margin-top 0 --margin-right 0 \
  --margin-bottom 0 --margin-left 0 \
  --enable-local-file-access \
  card_247_DUGGAL.html \
  card_247_DUGGAL.pdf
```

---

## Colour Reference

All colours are defined as CSS custom properties on `:root`. To retheme, change the values there only — every element inherits from them.

| Variable | Hex | Role |
|---|---|---|
| `--red` | `#C8001E` | Primary accent, name, header |
| `--yellow` | `#F0C229` | Highlights, seals, bottom bar |
| `--pink` | `#E8407A` | SHIP IT label, stripe accent |
| `--green` | `#2A7A4B` | GOA band, BUILT IN GOA stamp |
| `--blue` | `#2B5FA0` | Person zone, back header |
| `--cream` | `#F5EDD8` | Card background |
| `--ink` | `#1A1008` | All borders, text |
| `--rust` | `#A83210` | Secondary text labels |
| `--fade` | `#C8A882` | Dashed dividers |

---

## Typography Stack

| Font | Usage | Google Fonts |
|---|---|---|
| Bebas Neue | Big display type: HACKER HOUSE, GOA, 2026 | `family=Bebas+Neue` |
| Unbounded 900 | Builder name | `family=Unbounded:wght@900` |
| Abril Fatface | Alias / title pill | `family=Abril+Fatface` |
| Teko 600–700 | Labels, fields, stamps | `family=Teko:wght@600;700` |
| Space Mono | Monospace metadata, Easter eggs | `family=Space+Mono:wght@400;700` |

All fonts load from `fonts.googleapis.com`. For offline/print use, download and self-host via `@font-face`.

---

## Structure Map (front card)

```
card-front
├── perf-top                    ← serrated stamp edge
├── f-left-border               ← textile spine (colour stripes + serial number)
└── f-main
    ├── f-top-block             ← red header: HACKER HOUSE / GOA
    ├── f-color-bar             ← 6-colour repeating stripe
    ├── f-body                  ← floating composition zone
    │   ├── f-person-zone       ← diagonal clip-path photo area
    │   ├── f-person-sticker    ← "100% SHIPPED" overlapping sticker
    │   ├── f-person-annotation ← "QUALITY BUILDER" bleed label
    │   ├── f-info-left         ← name / alias / stack
    │   ├── f-float-label       ← "SHIP IT →" (crosses zone boundary)
    │   └── f-float-seal        ← circular GOA COMPAT. seal (bleeds into goa band)
    ├── f-goa-band              ← green Goa illustration band (palm, shell, wave, tile)
    ├── f-easter-strip          ← black hacker Easter egg chips
    ├── f-bottom                ← yellow footer bar
    └── perf-bot                ← serrated stamp edge
```

---

## Easter Eggs (front strip)

Current set — edit the `.f-e-chip` divs to customise per builder:

```html
<div class="f-e-chip">GIT PUSH</div>
<div class="f-e-chip">404: SLEEP NOT FOUND</div>
<div class="f-e-chip">LOCALHOST</div>
<div class="f-e-chip">BUILD: PASSED</div>
<div class="f-e-chip">JUGAAD v2.6</div>
<div class="f-e-chip">SHIP IT</div>
```

Other options to rotate in: `BUILD FAILED`, `WORKS ON MY MACHINE`, `npm install --chaos`, `undefined is not a function`, `YOLO DEPLOY`, `PORT 8080`, `git stash pop`.

---

## Ingredients Bar (back card)

The five ingredient rows on the back are purely copy — edit the `<td>` text and the `style="width:XX%"` on `.bar-fill` to match each builder's actual stack / personality:

```html
<tr>
  <td>YOUR STACK HERE</td>
  <td><div class="bar-track"><div class="bar-fill" style="width:70%"></div></div></td>
  <td>70%</td>
</tr>
```

Bar fill colour classes: default = red · `.y` = yellow · `.g` = green · `.b` = blue · `.p` = pink

---

## Known Limitations

- **Clip-path on person zone**: supported in all modern browsers. Not supported in IE11. For IE11 print use, replace `clip-path` with a simple `border-radius` or rectangular crop.
- **Bebas Neue + Unbounded**: web fonts — require internet on first load. Cache or self-host for offline events.
- **Dark backgrounds in browser print**: ensure "Print backgrounds" / "Background graphics" is checked in the browser print dialog.
- **Serrated perforations**: rendered with CSS `radial-gradient`. On some PDF renderers (wkhtmltopdf < 0.12.6) gradients may not render — verify output before mass print run.

---

*Built with intent. Shipped in Goa. OCT 2026.*
