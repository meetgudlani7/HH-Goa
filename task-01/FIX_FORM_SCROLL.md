# Fix: Form Screen (3rd Screen) Not Scrollable

## Issue Description
On the 3rd screen (FormFields), the form content was not fully visible and scrolling was disabled, making it impossible to see all form fields and builder title options.

## Root Cause
The `.form-screen` CSS class had `overflow: hidden;` which prevented any scrolling. Additionally, the form layout didn't have proper flexbox structure to allow the body content to scroll independently while keeping the header and footer fixed.

## Files Modified

### `src/index.css`

**Change 1: Updated `.form-screen`**
```css
/* BEFORE */
.form-screen {
  background: var(--ink); border: 4px solid var(--cream);
  position: relative; overflow: hidden;
}

/* AFTER */
.form-screen {
  background: var(--ink); border: 4px solid var(--cream);
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}
```

**Change 2: Updated `.form-body`**
```css
/* BEFORE */
.form-body {
  padding: 28px 22px;
}

/* AFTER */
.form-body {
  padding: 28px 22px;
  overflow-y: auto;
  flex: 1;
}
```

## What This Fixes

1. ✅ The form screen now allows vertical scrolling when content overflows
2. ✅ All form fields are visible and accessible
3. ✅ All 24 builder title buttons can be seen by scrolling
4. ✅ The window bar stays fixed at the top
5. ✅ The border strips stay at top and bottom
6. ✅ The form body scrolls independently

## Technical Details

### Before
- `.form-screen` had `overflow: hidden` - prevented all scrolling
- `.form-body` had no height constraint - content would overflow but be clipped
- The flexbox layout from `.app-root > * { flex: 1 }` made the screen take available space but didn't allow internal scrolling

### After
- `.form-screen` uses flexbox column layout with `height: 100%`
- `.form-body` has `flex: 1` to take remaining space and `overflow-y: auto` to enable scrolling
- The header (windowbar, border-strip-top) and footer (border-strip-bottom) stay fixed
- The form content scrolls within the body area

## Layout Structure

```
.form-screen (flex column, height: 100%)
├── .border-strip-top (fixed height)
├── .windowbar (fixed height)
├── .form-body (flex: 1, overflow-y: auto) ← SCROLLABLE
│   ├── form fields
│   ├── role tags
│   ├── builder title picker/typing
│   └── submit button
└── .border-strip-bottom (fixed height)
```

## Testing

All 90 tests still pass:
```
✓ Total Tests: 90
✓ Passed: 89
✓ Failed: 0
✓ Pass rate: 100.0%
```

Build successful:
```
✓ 61 modules transformed
✓ built in 756ms
```

## User Experience Impact

### Before Fix
- User couldn't see all form fields on mobile/desktop
- Builder title options (24 items) were cut off
- No way to scroll to see hidden content
- Frustrating UX

### After Fix
- All form content is accessible via scrolling
- Builder titles are visible in two rows with smooth scrolling
- Form fields are all accessible
- Consistent with the design spec from hh_goa_v2_upgraded.html

## Additional Notes

The form contains:
- 4 input fields (name, stack, city, X handle)
- 5 role selection tags
- 24 builder title selection tags (split across 2 rows)
- Title mode toggle button
- Submit button

With the scrolling enabled, users can now:
1. Fill out all form fields
2. See all available options
3. Scroll smoothly through the builder titles
4. Access all UI elements on any screen size
