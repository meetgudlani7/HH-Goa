/**
 * Image utility functions for HEIC detection and validation
 */

/**
 * Magic bytes signatures for various image formats
 */
export const IMAGE_MAGIC_BYTES = {
  // JPEG: starts with 0xFFD8FF
  JPEG: [0xff, 0xd8, 0xff],

  // PNG: starts with 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
  PNG: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],

  // HEIC/HEIF: contains "ftyp" box followed by brand identifier
  // The "ftyp" box is at offset 4, followed by 4-byte brand
  HEIC: { ftyp: 'ftyp', brands: ['heic', 'heif', 'heix', 'hev1'] },
};

export const getCroppedImg = (image, croppedAreaPixels, rotation = 0) =>
  new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject(new Error('Could not create canvas context'));
    const { x, y, width, height } = croppedAreaPixels;
    const rotated = rotation === 90 || rotation === 270;
    canvas.width = rotated ? height : width;
    canvas.height = rotated ? width : height;
    ctx.save();
    if (rotation) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(image, x, y, width, height, -width / 2, -height / 2, width, height);
    } else {
      ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
    }
    ctx.restore();
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Failed to create cropped image blob'));
        resolve({
          blob,
          objectURL: URL.createObjectURL(blob),
          width: canvas.width,
          height: canvas.height,
        });
      },
      'image/jpeg',
      0.92
    );
  });

/**
 * Check if a file is a valid image based on its magic bytes
 * @param {File} file - The file to check
 * @returns {Promise<{type: string | null, isValid: boolean}>}
 */
export const getImageTypeFromBytes = async (file) => {
  try {
    const buffer = await file.slice(0, 32).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Check for JPEG
    if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return { type: 'image/jpeg', isValid: true };
    }

    // Check for PNG
    if (
      bytes.length >= 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    ) {
      return { type: 'image/png', isValid: true };
    }

    // Check for HEIC/HEIF
    if (bytes.length >= 12) {
      // Look for "ftyp" at offset 4
      const ftypStart = bytes.subarray(4, 8);
      const ftypStr = String.fromCharCode(...ftypStart);

      if (ftypStr === 'ftyp') {
        const brand = bytes.subarray(8, 12);
        // eslint-disable-next-line no-control-regex -- stripping null-byte padding from the raw 4-byte brand field
        const brandStr = String.fromCharCode(...brand).replace(/\x00/g, '');

        const validBrands = ['heic', 'heif', 'heix', 'hev1', 'mif1', 'msf1'];
        if (validBrands.some((b) => brandStr.includes(b))) {
          return { type: 'image/heic', isValid: true };
        }
      }
    }

    return { type: null, isValid: false };
  } catch (error) {
    console.warn('Could not read file magic bytes:', error);
    return { type: null, isValid: false };
  }
};

/**
 * Check if WebAssembly is supported in the browser
 * @returns {boolean}
 */
export const isWasmSupported = () => {
  try {
    return typeof WebAssembly === 'object' && WebAssembly.validate !== undefined;
  } catch {
    return false;
  }
};

/**
 * Verify that an image URL can be loaded properly
 * @param {string} imageUrl - The image URL to verify
 * @returns {Promise<boolean>}
 */
export const verifyImage = (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
};

/**
 * Format file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string}
 */
export const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Check if a file is likely a HEIC/HEIF based on type and magic bytes
 * @param {File} file - The file to check
 * @returns {Promise<boolean>}
 */
export const isHeicFile = async (file) => {
  // First check the file type
  if (file.type && (file.type.includes('heic') || file.type.includes('heif'))) {
    return true;
  }

  // If type is not reliable, check magic bytes
  try {
    const buffer = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    if (bytes.length >= 12) {
      const ftypStart = bytes.subarray(4, 8);
      const heicMarker = bytes.subarray(8, 12);

      const ftypStr = String.fromCharCode(...ftypStart);
      const heicStr = String.fromCharCode(...heicMarker);

      // Check for "ftyp" followed by HEIC brands
      if (
        ftypStr === 'ftyp' &&
        (heicStr === 'heic' || heicStr === 'heif' || heicStr === 'heix' || heicStr === 'hev1')
      ) {
        return true;
      }
    }
  } catch (error) {
    console.warn('Could not read file magic bytes:', error);
  }

  return false;
};

export default {
  getImageTypeFromBytes,
  isWasmSupported,
  verifyImage,
  formatFileSize,
  isHeicFile,
};
