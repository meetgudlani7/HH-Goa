import { useState, useCallback } from 'react';

/**
 * Magic bytes for HEIC/HEIF format detection
 * HEIC files start with: 0x00 0x00 0x00 [size] 0x66 0x74 0x79 0x70 0x68 0x65 0x69 0x63
 * The "ftyp" box followed by "heic" identifier
 */
const HEIC_MAGIC_BYTES = [0x00, 0x00, 0x00, 0x00, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63];

/**
 * Check if file is HEIC/HEIF based on magic bytes
 * iOS sometimes sends HEIC with wrong MIME type, so we check the bytes
 */
const isHeicFile = async (file) => {
  // First check the file type
  if (file.type && (file.type.includes('heic') || file.type.includes('heif'))) {
    return true;
  }

  // If type is not reliable, check magic bytes
  try {
    const buffer = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // Check if the first 12 bytes match HEIC signature
    // We need to check positions 4-11 for "ftypheic"
    if (bytes.length >= 12) {
      const ftypStart = bytes.subarray(4, 8);
      const heicMarker = bytes.subarray(8, 12);
      
      const ftypStr = String.fromCharCode(...ftypStart);
      const heicStr = String.fromCharCode(...heicMarker);
      
      // Check for "ftyp" followed by "heic" or "heif" or "heix"
      if (ftypStr === 'ftyp' && (heicStr === 'heic' || heicStr === 'heif' || heicStr === 'heix')) {
        return true;
      }
    }
  } catch (error) {
    console.warn('Could not read file magic bytes:', error);
  }

  return false;
};

/**
 * Check if WebAssembly is supported in the browser
 * Required for heic2any to work
 */
const isWasmSupported = () => {
  try {
    return typeof WebAssembly === 'object' && WebAssembly.validate !== undefined;
  } catch (error) {
    return false;
  }
};

/**
 * Custom hook for image processing: HEIC detection, conversion, and validation
 */
export const useImageProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [originalBlob, setOriginalBlob] = useState(null);

  /**
   * Process an uploaded file:
   * - Detect if it's HEIC/HEIF
   * - Convert HEIC to JPEG using heic2any
   * - Validate the resulting image
   * - Return normalized image data
   */
   const processImage = useCallback(async (file) => {
     // Reset state
     setError(null);
     setIsProcessing(true);

     try {
       // Validate file exists
       if (!file) {
         throw new Error('Please upload a valid image file (JPG, PNG, or HEIC)');
       }

       // Check if file is likely an image based on type OR name
       // iOS sometimes sends HEIC with application/octet-stream or empty MIME type
       const isLikelyImage = file.type && file.type.startsWith('image/');
       const hasImageExtension = /\.(jpe?g|png|heic|heif|webp)$/i.test(file.name);
       
       // If file doesn't have image MIME type and doesn't have image extension,
       // still try to process it (magic bytes will catch HEIC)
       if (!isLikelyImage && !hasImageExtension) {
         // We'll still try to process it, but check magic bytes first
         console.warn('File does not have image MIME type or extension, checking magic bytes:', file.name);
       }

      // Check file size - warn if > 20MB
      const MAX_SIZE = 20 * 1024 * 1024; // 20MB
      if (file.size > MAX_SIZE) {
        console.warn('Large file detected:', file.size, 'bytes');
      }

      // Check if file is HEIC/HEIF
      const isHeic = await isHeicFile(file);

      let processedBlob;
      let objectURL;

      if (isHeic) {
        const originalObjectURL = URL.createObjectURL(file);

        // If the browser can convert HEIC with heic2any, do so.
        if (isWasmSupported()) {
          try {
            const heic2anyModule = await import('heic2any');
            const heic2any = heic2anyModule.default ?? heic2anyModule;

            const result = await heic2any({
              blob: file,
              toType: 'image/jpeg',
              quality: 0.92,
            });

            processedBlob = result;
            objectURL = URL.createObjectURL(processedBlob);

            await verifyImage(objectURL);
            URL.revokeObjectURL(originalObjectURL);
          } catch (heicError) {
            console.warn('HEIC conversion failed, trying native browser support if available:', heicError);

            try {
              await verifyImage(originalObjectURL);
              processedBlob = file;
              objectURL = originalObjectURL;
            } catch (nativeError) {
              URL.revokeObjectURL(originalObjectURL);
              console.error('HEIC conversion and native load both failed:', nativeError);
              throw new Error('Failed to process the HEIC image. Please upload a JPG or PNG file if this keeps happening.');
            }
          }
        } else {
          // Browser cannot use the HEIC converter library; try native HEIC rendering.
          try {
            await verifyImage(originalObjectURL);
            processedBlob = file;
            objectURL = originalObjectURL;
          } catch (nativeError) {
            URL.revokeObjectURL(originalObjectURL);
            throw new Error('HEIC conversion is not supported in this browser. Please upload a JPG or PNG file.');
          }
        }
      } else {
        // For JPG/PNG, use the file directly
        // But still verify it can be loaded as an image
        processedBlob = file;
        objectURL = URL.createObjectURL(file);
        
        // Verify the image can be loaded
        await verifyImage(objectURL);
      }

      // Store the processed blob in state for the Cropper component
      const result = {
        blob: processedBlob,
        objectURL,
        isHeic,
        fileName: file.name,
        fileSize: file.size,
      };
      setOriginalBlob(result);
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Verify that an image URL can be loaded properly
   */
  const verifyImage = useCallback(async (imageUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image. The file may be corrupted.'));
      img.src = imageUrl;
    });
  }, []);

  /**
   * Clean up object URLs to prevent memory leaks
   */
  const revokeObjectURL = useCallback((objectURL) => {
    if (objectURL) {
      URL.revokeObjectURL(objectURL);
    }
  }, []);

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
};

export default useImageProcessor;
