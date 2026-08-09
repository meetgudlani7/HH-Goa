/**
 * Canvas helper functions for image cropping and manipulation
 * Updated for V2 design with new helper functions for card rendering
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

/**
 * Draw a rounded rectangle on canvas
 */
export const drawRoundRect = (ctx, x, y, w, h, r, fill, stroke, strokeWidth) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth || 1;
    ctx.stroke();
  }
};

/**
 * Draw text with stroke (outlined text)
 */
export const drawStrokedText = (ctx, text, x, y, fillStyle, strokeStyle, strokeWidth, font) => {
  ctx.font = font;
  ctx.textBaseline = 'top';
  
  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = strokeWidth;
    ctx.strokeText(text, x, y);
  }
  
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fillText(text, x, y);
  }
};

/**
 * Draw the truck art repeating color stripe
 */
export const drawArtBand = (ctx, y, width, height = 12) => {
  const colors = [
    { color: '#C8001E', width: 14 },
    { color: '#F0C229', width: 14 },
    { color: '#2A7A4B', width: 14 },
    { color: '#E8407A', width: 14 },
    { color: '#F0C229', width: 14 },
  ];
  
  let x = 0;
  colors.forEach(({ color, width: segWidth }) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, segWidth, height);
    x += segWidth;
  });
  
  // Repeat pattern to fill width
  while (x < width) {
    colors.forEach(({ color, width: segWidth }) => {
      if (x >= width) return;
      const actualWidth = Math.min(segWidth, width - x);
      ctx.fillStyle = color;
      ctx.fillRect(x, y, actualWidth, height);
      x += actualWidth;
    });
  }
};

/**
 * Draw the hibiscus SVG as canvas paths
 */
export const drawHibiscus = (ctx, cx, cy, scale = 1, opacity = 0.12) => {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  
  const colors = ['#E8407A', '#F0C229', '#E8407A', '#F0C229', '#E8407A'];
  const angleStep = (2 * Math.PI) / 5;
  const petalWidth = 120;
  const petalHeight = 40;
  const centerRadius = 18;
  
  for (let i = 0; i < 5; i++) {
    const angle = i * angleStep;
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.ellipse(
      Math.cos(angle) * 40,
      Math.sin(angle) * 40,
      petalWidth / 2,
      petalHeight / 2,
      angle,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }
  
  ctx.fillStyle = '#C8001E';
  ctx.beginPath();
  ctx.arc(0, 0, centerRadius, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.restore();
};

/**
 * Draw the scooter SVG
 */
export const drawScooter = (ctx, x, y, scale = 1, opacity = 1) => {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  ctx.fillStyle = '#1A7A6E';
  ctx.beginPath();
  ctx.ellipse(0, 0, 40, 20, 0, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.fillStyle = '#1A1008';
  ctx.beginPath();
  ctx.ellipse(10, -5, 15, 8, 0, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.restore();
};

/**
 * Draw the coconut tree SVG
 */
export const drawCoconutTree = (ctx, x, y, scale = 1, opacity = 1) => {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  ctx.fillStyle = '#A83210';
  ctx.beginPath();
  ctx.ellipse(0, 0, 3, 40, 0, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.fillStyle = '#2A7A4B';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(i * 10 - 10, -30, 15, 8, (i - 1) * 0.2, 0, 2 * Math.PI);
    ctx.fill();
  }
  
  ctx.fillStyle = '#8BC34A';
  ctx.beginPath();
  ctx.arc(5, -20, 4, 0, 2 * Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-5, -25, 4, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.restore();
};

/**
 * Draw the wave SVG
 */
export const drawWave = (ctx, y, width, height, opacity = 0.15) => {
  ctx.save();
  ctx.globalAlpha = opacity;
  
  const amplitude = height / 4;
  const frequency = 0.01;
  
  ctx.fillStyle = '#2B5FA0';
  ctx.beginPath();
  ctx.moveTo(0, y + height / 2);
  
  for (let x = 0; x <= width; x += 5) {
    const waveY = y + height / 2 + Math.sin(x * frequency) * amplitude;
    ctx.lineTo(x, waveY);
  }
  
  ctx.lineTo(width, y + height);
  ctx.lineTo(0, y + height);
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
};

/**
 * Draw the seal (circle with percentage and text)
 */
export const drawSeal = (ctx, cx, cy, radius, percentage, label) => {
  const strokeColor = '#C8001E';
  const strokeWidth = 3;
  const fillColor = '#F5EDD8';
  const innerStroke = 'rgba(200,0,30,.12)';
  const innerStrokeWidth = 4;
  const percentageFont = '36px Abril Fatface';
  const percentageColor = '#C8001E';
  const labelFont = '700 20px Teko';
  const labelColor = '#C8001E';
  
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.stroke();
  
  ctx.fillStyle = fillColor;
  ctx.beginPath();
  ctx.arc(cx, cy, radius - strokeWidth, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.strokeStyle = innerStroke;
  ctx.lineWidth = innerStrokeWidth;
  ctx.beginPath();
  ctx.arc(cx, cy, radius - strokeWidth - 2, 0, 2 * Math.PI);
  ctx.stroke();
  
  ctx.font = percentageFont;
  ctx.fillStyle = percentageColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(percentage, cx, cy - 10);
  
  ctx.font = labelFont;
  ctx.fillStyle = labelColor;
  ctx.fillText(label, cx, cy + 10);
  
  ctx.textAlign = 'left';
};

/**
 * Draw a sticker (rotated rectangle with text)
 */
export const drawSticker = (ctx, text, x, y, width, height, bgColor, textColor, rotation, borderColor, borderWidth, font) => {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  
  ctx.fillStyle = bgColor;
  ctx.fillRect(-width / 2, -height / 2, width, height);
  
  if (borderColor) {
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth || 1;
    ctx.strokeRect(-width / 2, -height / 2, width, height);
  }
  
  if (font) ctx.font = font;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lines = text.split('\n');
  const lineHeight = parseInt(font || '16') * 1.2;
  lines.forEach((line, i) => {
    ctx.fillText(line, 0, -((lines.length - 1) * lineHeight) / 2 + i * lineHeight);
  });
  
  ctx.restore();
};

/**
 * Parse name into first and last parts
 */
export const parseName = (name) => {
  if (!name) return { firstName: '', lastName: '' };
  const parts = name.trim().split(/\s+/);
  const firstName = parts[0] || '';
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
  return { firstName, lastName };
};

/**
 * Parse stack string into items with percentages
 */
export const parseStack = (stack) => {
  if (!stack) return [];
  
  const items = stack.split(/[,\/\s+and\s+]/i)
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .slice(0, 3);
  
  const percentages = ['60%', '25%', '15%'];
  
  return items.map((item, index) => ({
    name: item.toUpperCase(),
    percentage: percentages[index],
  }));
};

/**
 * Draw the name giant background text
 */
export const drawNameGiant = (ctx, name) => {
  const { firstName, lastName } = parseName(name);
  
  if (!firstName) return;
  
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = '#1A1008';
  ctx.font = '900 88px Unbounded';
  ctx.textBaseline = 'top';
  
  ctx.fillText(firstName.toUpperCase(), -8, 20);
  
  if (lastName) {
    ctx.fillText(lastName.toUpperCase(), -8, 110);
  }
  
  ctx.restore();
};

/**
 * Draw the SHIP background text
 */
export const drawShipText = (ctx) => {
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = '#C8001E';
  ctx.font = '900 140px Unbounded';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  ctx.fillText('SHIP', 540, 650);
  
  ctx.restore();
};

export default {
  getCroppedImg,
  getImageDimensions,
  revokeObjectURL,
  rotateImage,
  drawRoundRect,
  drawStrokedText,
  drawArtBand,
  drawHibiscus,
  drawScooter,
  drawCoconutTree,
  drawWave,
  drawSeal,
  drawSticker,
  parseName,
  parseStack,
  drawNameGiant,
  drawShipText,
};
