import { useState, useCallback } from 'react';
import heic2any from 'heic2any';

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
      // Validate file is an image
      if (!file || !file.type || !file.type.startsWith('image/')) {
        throw new Error('Please upload a valid image file (JPG, PNG, or HEIC)');
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
        // Check for WebAssembly support
        if (!isWasmSupported()) {
          throw new Error('Your browser does not support HEIC conversion. Please upload a JPG or PNG file.');
        }

        // Convert HEIC to JPEG using heic2any
        try {
          const result = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.92,
          });
          
          processedBlob = result;
          objectURL = URL.createObjectURL(processedBlob);
        } catch (heicError) {
          console.error('HEIC conversion failed:', heicError);
          throw new Error('Failed to convert HEIC file. Please try uploading a JPG or PNG instead.');
        }
      } else {
        // For JPG/PNG, use the file directly
        // But still verify it can be loaded as an image
        processedBlob = file;
        objectURL = URL.createObjectURL(file);
        
        // Verify the image can be loaded
        await verifyImage(objectURL);
      }

      return {
        blob: processedBlob,
        objectURL,
        isHeic,
        fileName: file.name,
        fileSize: file.size,
      };
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
  };
};

export default useImageProcessor;
