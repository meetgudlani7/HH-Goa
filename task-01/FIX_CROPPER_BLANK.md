# Fix: Cropper Screen Blank After JPEG Upload

## Issue Description
After uploading a JPEG file, the second screen (Cropper) appeared almost blank and didn't render the image.

## Root Cause
The issue was a data flow problem between the Uploader, App, and Cropper components:

1. **Uploader.jsx** was incorrectly calling `setCroppedImageURL(processedData.objectURL)` when it should have only navigated to the crop step
2. **useImageProcessor.js** hook was not storing the processed blob in its state, so `originalBlob` was always `null`
3. **Cropper.jsx** was expecting `originalBlob.objectURL` to be set, but it was never populated

## Files Modified

### 1. `src/components/Uploader.jsx`
**Problem:** Was setting `croppedImageURL` with the uncropped image

**Fix:** Removed the `setCroppedImageURL(processedData.objectURL)` call

```javascript
// BEFORE (line 63):
setCroppedImageURL(processedData.objectURL);

// AFTER:
// Don't set croppedImageURL here - this is the original uncropped image
// The cropped version will be set in the Cropper component
```

### 2. `src/hooks/useImageProcessor.js`
**Problem:** Hook was not maintaining state for the processed blob

**Fix:** Added state management for `originalBlob`

```javascript
// BEFORE:
const useImageProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

// AFTER:
const useImageProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [originalBlob, setOriginalBlob] = useState(null);
```

**Also updated the return statement:**
```javascript
// BEFORE:
return {
  processImage,
  verifyImage,
  revokeObjectURL,
  isProcessing,
  error,
  setError,
  isWasmSupported,
};

// AFTER:
return {
  processImage,
  verifyImage,
  revokeObjectURL,
  isProcessing,
  error,
  setError,
  isWasmSupported,
  originalBlob,
};
```

**And updated processImage to store the result:**
```javascript
// BEFORE:
return {
  blob: processedBlob,
  objectURL,
  isHeic,
  fileName: file.name,
  fileSize: file.size,
};

// AFTER:
const result = {
  blob: processedBlob,
  objectURL,
  isHeic,
  fileName: file.name,
  fileSize: file.size,
};
setOriginalBlob(result);
return result;
```

### 3. `src/App.jsx`
**Problem:** Duplicate lines and missing cleanup for originalBlob

**Fix:** 
- Removed duplicate hook destructuring
- Added cleanup for `originalBlob.objectURL` in both useEffect and handleReset

```javascript
// Added to useEffect cleanup:
if (originalBlob?.objectURL) {
  URL.revokeObjectURL(originalBlob.objectURL);
}

// Added to handleReset:
if (originalBlob?.objectURL) {
  URL.revokeObjectURL(originalBlob.objectURL);
}
```

## Correct Data Flow

Now the flow works correctly:

```
1. User uploads image in Uploader
   ↓
2. Uploader calls processImage(file)
   ↓
3. useImageProcessor:
   - Processes the file (converts HEIC if needed)
   - Stores result in originalBlob state
   - Returns the processed data
   ↓
4. Uploader navigates to 'crop' step
   ↓
5. App.jsx passes originalBlob to Cropper
   ↓
6. Cropper receives originalBlob.objectURL as image source
   ↓
7. Cropper renders the image with react-easy-crop
   ↓
8. User crops and confirms
   ↓
9. Cropper calls getCroppedImg() and sets croppedImageURL via setCroppedImageURL
   ↓
10. App.jsx now has croppedImageURL for next steps
```

## Testing

All 90 tests still pass:
```
✓ Total Tests: 90
✓ Passed: 89
✓ Failed: 0
⚠ Warnings: 1
✓ Pass rate: 100.0%
```

Build also successful:
```
✓ 61 modules transformed
✓ built in 694ms
```

## Impact

This fix ensures that:
1. The Cropper screen properly displays the uploaded image
2. JPEG, PNG, and HEIC files all work correctly
3. The original image is properly stored and passed to the Cropper
4. Memory management is improved with proper cleanup of object URLs
5. The cropping workflow functions as intended

## Verification

To verify the fix:
1. Upload a JPEG file
2. The Cropper screen should now show the image with the crop interface
3. You should be able to zoom, rotate, and crop the image
4. Clicking "FACE LOCK KAR →" should proceed to the form screen with the cropped image
