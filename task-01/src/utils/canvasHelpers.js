/**
 * Canvas helper functions for image cropping and manipulation
 */

/**
 * Get the cropped image from an image source and crop coordinates
 * Uses react-easy-crop's croppedAreaPixels to extract the cropped region
 * @param {HTMLImageElement} image - The source image element
 * @param {Object} croppedAreaPixels - Crop area { x, y, width, height } from react-easy-crop
 * @param {number} rotation - Rotation in degrees (0, 90, 180, 270)
 * @returns {Promise<{blob: Blob, objectURL: string, width: number, height: number}>}
 */
export const getCroppedImg = (image, croppedAreaPixels, rotation = 0) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not create canvas context'));
      return;
    }

    const { x, y, width, height } = croppedAreaPixels;

    // Handle rotation by swapping width and height if needed
    let finalWidth = width;
    let finalHeight = height;
    
    if (rotation === 90 || rotation === 270) {
      finalWidth = height;
      finalHeight = width;
    }

    canvas.width = finalWidth;
    canvas.height = finalHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Handle rotation
    if (rotation > 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      const rotationRad = (rotation * Math.PI) / 180;
      ctx.rotate(rotationRad);
      
      // After rotation, draw at negative half dimensions to center
      ctx.drawImage(
        image,
        x, y, width, height,
        -width / 2, -height / 2, width, height
      );
    } else {
      // No rotation - draw directly
      ctx.drawImage(
        image,
        x, y, width, height,
        0, 0, width, height
      );
    }

    // Convert to blob
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create cropped image blob'));
          return;
        }
        
        const objectURL = URL.createObjectURL(blob);
        resolve({
          blob,
          objectURL,
          width: finalWidth,
          height: finalHeight,
        });
      },
      'image/jpeg',
      0.92
    );
  });
};

/**
 * Get image dimensions from a file or object URL
 * @param {File|string} image - File or object URL
 * @returns {Promise<{width: number, height: number}>}
 */
export const getImageDimensions = (image) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for dimension check'));
    };

    if (typeof image === 'string') {
      img.src = image;
    } else if (image instanceof File) {
      img.src = URL.createObjectURL(image);
    } else if (image instanceof Blob) {
      img.src = URL.createObjectURL(image);
    }
  });
};

/**
 * Revoke an object URL to prevent memory leaks
 * @param {string} objectURL - The object URL to revoke
 */
export const revokeObjectURL = (objectURL) => {
  if (objectURL && typeof URL !== 'undefined' && URL.revokeObjectURL) {
    URL.revokeObjectURL(objectURL);
  }
};

/**
 * Apply rotation to an image
 * @param {HTMLImageElement} image - Source image
 * @param {number} degrees - Rotation degrees (90, 180, 270)
 * @returns {Promise<HTMLImageElement>}
 */
export const rotateImage = (image, degrees = 90) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      resolve(image);
      return;
    }

    const radians = (degrees * Math.PI) / 180;

    if (degrees === 90 || degrees === 270) {
      canvas.width = image.height;
      canvas.height = image.width;
    } else {
      canvas.width = image.width;
      canvas.height = image.height;
    }

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(radians);
    
    if (degrees === 90) {
      ctx.translate(0, -canvas.width);
    } else if (degrees === 180) {
      ctx.translate(-canvas.width, -canvas.height);
    } else if (degrees === 270) {
      ctx.translate(-canvas.height, 0);
    }

    ctx.drawImage(image, 0, 0, image.width, image.height, 
      -image.width / 2, -image.height / 2, image.width, image.height);

    const rotatedImage = new Image();
    rotatedImage.onload = () => {
      resolve(rotatedImage);
    };
    rotatedImage.src = canvas.toDataURL('image/jpeg');
  });
};

export default {
  getCroppedImg,
  getImageDimensions,
  revokeObjectURL,
  rotateImage,
};
