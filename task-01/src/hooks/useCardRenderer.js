import { useState, useCallback, useRef } from 'react';

/**
 * Card dimensions and layout constants for V2 design
 * Canvas size: 1080 x 1620px (2:3 portrait)
 * Based on hh_goa_v2_upgraded.html Screen 4
 */
const CARD_CONFIG = {
  width: 1080,
  height: 1620,
  
  // Colors from tokens.css
  colors: {
    red: '#C8001E',
    yellow: '#F0C229',
    pink: '#E8407A',
    green: '#2A7A4B',
    cream: '#F5EDD8',
    ink: '#1A1008',
    orange: '#D4511A',
    blue: '#2B5FA0',
    paper: '#EDE4C8',
    fade: '#B8A882',
    rust: '#A83210',
  },
  
  // Photo zone dimensions
  photo: {
    x: 32,
    y: 140,
    width: 1016,
    height: 560,
    borderWidth: 3,
    borderColor: '#1A1008',
  },
  
  // Title plate dimensions
  titlePlate: {
    x: 0,
    y: 12,
    width: 1080,
    height: 110,
    borderWidth: 3,
  },
  
  // Art background circle
  artBgCircle: {
    cx: 860,
    cy: -80,
    radius: 320,
    fill: '#F0C229',
    opacity: 0.18,
  },
  
  // Name display positioning
  nameDisplay: {
    x: 32,
    y: 820,
    firstNameFont: '900 88px Unbounded',
    lastNameFont: '900 88px Unbounded',
    strokeColor: '#1A1008',
    strokeWidth: 4,
    firstNameColor: '#C8001E',
    lastNameColor: '#F5EDD8',
    lineHeight: 0.95,
  },
  
  // Title badge positioning
  titleBadge: {
    x: 32,
    y: 920,
    padding: { top: 12, right: 28, bottom: 12, left: 28 },
    bgColor: '#1A1008',
    textColor: '#F0C229',
    font: '36px Abril Fatface',
    rotation: -0.5,
  },
  
  // Seal positioning
  seal: {
    cx: 900,
    cy: 700,
    radius: 68,
    strokeColor: '#C8001E',
    strokeWidth: 3,
    fillColor: '#F5EDD8',
    innerStroke: 'rgba(200,0,30,.12)',
    innerStrokeWidth: 4,
    percentageFont: '36px Abril Fatface',
    percentageColor: '#C8001E',
    labelFont: '700 20px Teko',
    labelColor: '#C8001E',
  },
  
  // Ingredients box
  ingredients: {
    x: 32,
    y: 1000,
    width: 300,
    padding: 12,
    borderColor: '#1A1008',
    borderWidth: 2,
    bgColor: 'rgba(255,255,255,0.4)',
    label: 'INGREDIENTS',
    labelFont: '700 14px Space Mono',
    labelColor: '#1A1008',
    itemFont: '600 28px Teko',
    itemColor: '#1A1008',
    valueColor: '#1A1008',
    barHeight: 8,
    colors: ['#C8001E', '#D4511A', '#2A7A4B'],
  },
  
  // Easter egg chips
  easterEggs: {
    x: 32,
    y: 1120,
    gap: 8,
    font: '12px Space Mono',
    color: '#B8A882',
    borderColor: '#B8A882',
    borderWidth: 1,
    padding: { vertical: 2, horizontal: 6 },
  },
  
  // Bottom band
  bottomBand: {
    y: 1560,
    height: 50,
    bgColor: '#1A1008',
    borderColor: '#F0C229',
    borderWidth: 2,
    font: '14px Space Mono',
    color: '#B8A882',
    rightFont: '700 30px Teko',
    rightColor: '#F0C229',
  },
  
  // Wave dimensions
  wave: {
    y: 700,
    height: 80,
    fill: '#2B5FA0',
    opacity: 0.15,
  },
  
  // Stickers
  stickers: {
    qualityBuilder: {
      x: 820,
      y: 148,
      width: 200,
      height: 80,
      bgColor: '#D4511A',
      textColor: '#F5EDD8',
      text: '★ QUALITY\nBUILDER ★',
      font: '700 22px Teko',
      rotation: 4,
      borderColor: '#1A1008',
      borderWidth: 3,
    },
    builderDetected: {
      x: 40,
      y: 148,
      width: 180,
      height: 70,
      bgColor: '#F0C229',
      textColor: '#1A1008',
      text: '// BUILDER\nDETECTED',
      font: '700 20px Teko',
      rotation: -3,
      borderColor: '#1A1008',
      borderWidth: 3,
    },
  },
  
  // Background text
  bgText: {
    name: {
      font: '900 88px Unbounded',
      color: '#1A1008',
      opacity: 0.06,
      x: -8,
      y: 20,
    },
    ship: {
      text: 'SHIP',
      font: '900 140px Unbounded',
      color: '#C8001E',
      opacity: 0.07,
      y: 650,
    },
  },
  
  // Art top band (truck art stripe)
  artTopBand: {
    y: 0,
    height: 12,
    colors: [
      { color: '#C8001E', width: 14 },
      { color: '#F0C229', width: 14 },
      { color: '#2A7A4B', width: 14 },
      { color: '#E8407A', width: 14 },
      { color: '#F0C229', width: 14 },
    ],
  },
};

/**
 * Custom hook for rendering the HH Goa Builder Artifact card
 */
export const useCardRenderer = () => {
  const canvasRef = useRef(null);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Initialize canvas
   */
  const initCanvas = useCallback(() => {
    if (!canvasRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = CARD_CONFIG.width;
      canvas.height = CARD_CONFIG.height;
      canvasRef.current = canvas;
    }
    return canvasRef.current;
  }, []);

  /**
   * Ensure required fonts are loaded
   */
  const ensureFontsLoaded = useCallback(async () => {
    try {
      await document.fonts.ready;
      
      // Check and load required fonts
      const fontsToCheck = [
        '900 88px Unbounded',
        '900 44px Unbounded',
        '700 22px Teko',
        '700 20px Teko',
        '36px Abril Fatface',
        '700 28px Teko',
        '14px Space Mono',
        '700 14px Space Mono',
        '12px Space Mono',
        '9px Space Mono',
      ];
      
      const loadPromises = fontsToCheck.map(font => 
        document.fonts.load(font)
      );
      
      await Promise.all(loadPromises);
      return true;
    } catch (err) {
      console.warn('Font loading check failed, proceeding anyway:', err);
      return true;
    }
  }, []);

  /**
   * Draw rounded rectangle
   */
  const drawRoundRect = useCallback((ctx, x, y, w, h, r, fill, stroke, strokeWidth) => {
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
  }, []);

  /**
   * Draw text with stroke (outlined text)
   */
  const drawStrokedText = useCallback((ctx, text, x, y, fillStyle, strokeStyle, strokeWidth, font) => {
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
  }, []);

  /**
   * Draw the truck art top band
   */
  const drawArtTopBand = useCallback((ctx, y, width) => {
    const { artTopBand } = CARD_CONFIG;
    let x = 0;
    
    artTopBand.colors.forEach(({ color, width: segWidth }) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, segWidth, artTopBand.height);
      x += segWidth;
    });
  }, []);

  /**
   * Draw a sticker (rotated rectangle with text)
   */
  const drawSticker = useCallback((ctx, text, x, y, width, height, bgColor, textColor, rotation, borderColor, borderWidth, font) => {
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(-width / 2, -height / 2, width, height);
    
    // Draw border
    if (borderColor) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth || 1;
      ctx.strokeRect(-width / 2, -height / 2, width, height);
    }
    
    // Draw text
    ctx.font = font;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lines = text.split('\n');
    const lineHeight = parseInt(font) * 1.2;
    lines.forEach((line, i) => {
      ctx.fillText(line, 0, -((lines.length - 1) * lineHeight) / 2 + i * lineHeight);
    });
    
    ctx.restore();
  }, []);

  /**
   * Draw the hibiscus SVG as canvas paths
   */
  const drawHibiscus = useCallback((ctx, cx, cy, scale = 1, opacity = 0.12) => {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    
    // Draw 5 rotated ellipses for petals - pink and yellow alternating
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
    
    // Draw red center circle
    ctx.fillStyle = '#C8001E';
    ctx.beginPath();
    ctx.arc(0, 0, centerRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.restore();
  }, []);

  /**
   * Draw the scooter SVG
   */
  const drawScooter = useCallback((ctx, x, y, scale = 1, opacity = 1) => {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    // Scooter body
    ctx.fillStyle = '#1A7A6E';
    ctx.beginPath();
    ctx.ellipse(0, 0, 40, 20, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Scooter seat
    ctx.fillStyle = '#1A1008';
    ctx.beginPath();
    ctx.ellipse(10, -5, 15, 8, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.restore();
  }, []);

  /**
   * Draw the coconut tree SVG
   */
  const drawCoconutTree = useCallback((ctx, x, y, scale = 1, opacity = 1) => {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    // Tree trunk
    ctx.fillStyle = '#A83210';
    ctx.beginPath();
    ctx.ellipse(0, 0, 3, 40, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Coconut leaves
    ctx.fillStyle = '#2A7A4B';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(i * 10 - 10, -30, 15, 8, (i - 1) * 0.2, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Coconuts
    ctx.fillStyle = '#8BC34A';
    ctx.beginPath();
    ctx.arc(5, -20, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-5, -25, 4, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.restore();
  }, []);

  /**
   * Draw the wave SVG
   */
  const drawWave = useCallback((ctx, y, width, height, opacity = 0.15) => {
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
  }, []);

  /**
   * Draw the seal (circle with percentage and text)
   */
  const drawSeal = useCallback((ctx, cx, cy, radius, percentage, label) => {
    const { seal } = CARD_CONFIG;
    
    // Outer stroke
    ctx.strokeStyle = seal.strokeColor;
    ctx.lineWidth = seal.strokeWidth;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Fill
    ctx.fillStyle = seal.fillColor;
    ctx.beginPath();
    ctx.arc(cx, cy, radius - seal.strokeWidth, 0, 2 * Math.PI);
    ctx.fill();
    
    // Inner stroke
    ctx.strokeStyle = seal.innerStroke;
    ctx.lineWidth = seal.innerStrokeWidth;
    ctx.beginPath();
    ctx.arc(cx, cy, radius - seal.strokeWidth - 2, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Percentage text
    ctx.font = seal.percentageFont;
    ctx.fillStyle = seal.percentageColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(percentage, cx, cy - 10);
    
    // Label text
    ctx.font = seal.labelFont;
    ctx.fillStyle = seal.labelColor;
    ctx.fillText(label, cx, cy + 10);
    
    ctx.textAlign = 'left';
  }, []);

  /**
   * Draw the ingredients box
   */
  const drawIngredientsBox = useCallback((ctx, items, x, y) => {
    const { ingredients } = CARD_CONFIG;
    const boxWidth = 300;
    const padding = ingredients.padding;
    const innerX = x + padding;
    const innerY = y + padding;
    const innerWidth = boxWidth - 2 * padding;
    
    // Draw box background with border
    ctx.fillStyle = ingredients.bgColor;
    ctx.beginPath();
    ctx.rect(x, y, boxWidth, 100);
    ctx.fill();
    
    ctx.strokeStyle = ingredients.borderColor;
    ctx.lineWidth = ingredients.borderWidth;
    ctx.strokeRect(x, y, boxWidth, 100);
    
    // Draw label
    ctx.font = ingredients.labelFont;
    ctx.fillStyle = ingredients.labelColor;
    ctx.textBaseline = 'top';
    ctx.fillText(ingredients.label, innerX, innerY);
    
    // Draw items
    const itemYStart = innerY + 20;
    const itemHeight = 28;
    const itemGap = 8;
    
    items.forEach((item, index) => {
      const itemY = itemYStart + index * (itemHeight + itemGap);
      const color = ingredients.colors[index % ingredients.colors.length];
      
      // Draw colored bar
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.rect(innerX, itemY + itemHeight / 2 - 2, 60, 4);
      ctx.fill();
      
      // Draw item name
      ctx.font = ingredients.itemFont;
      ctx.fillStyle = ingredients.itemColor;
      ctx.textBaseline = 'middle';
      ctx.fillText(item.name, innerX + 70, itemY + itemHeight / 2);
      
      // Draw percentage
      ctx.fillStyle = ingredients.valueColor;
      ctx.textAlign = 'right';
      ctx.fillText(item.percentage, innerX + boxWidth - padding - 10, itemY + itemHeight / 2);
      ctx.textAlign = 'left';
    });
    
    ctx.textBaseline = 'top';
  }, []);

  /**
   * Draw the easter egg chips
   */
  const drawEasterEggs = useCallback((ctx, chips, x, y) => {
    const { easterEggs } = CARD_CONFIG;
    let currentX = x;
    
    chips.forEach(chip => {
      const textWidth = ctx.measureText(chip).width;
      const chipWidth = textWidth + 20;
      const chipHeight = 14;
      
      // Draw border
      ctx.strokeStyle = easterEggs.borderColor;
      ctx.lineWidth = easterEggs.borderWidth;
      ctx.beginPath();
      ctx.roundRect && ctx.roundRect(currentX, y, chipWidth, chipHeight, 2);
      ctx.strokeRect(currentX, y, chipWidth, chipHeight);
      
      // Draw text
      ctx.font = easterEggs.font;
      ctx.fillStyle = easterEggs.color;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText(chip, currentX + chipWidth / 2, y + chipHeight / 2);
      
      currentX += chipWidth + easterEggs.gap;
    });
    
    ctx.textAlign = 'left';
  }, []);

  /**
   * Parse name into first and last parts
   */
  const parseName = useCallback((name) => {
    if (!name) return { firstName: '', lastName: '' };
    const parts = name.trim().split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
    return { firstName, lastName };
  }, []);

  /**
   * Parse stack string into items with percentages
   */
  const parseStack = useCallback((stack) => {
    if (!stack) return [];
    
    const items = stack.split(/[,\/\s+and\s+]/i)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .slice(0, 3);
    
    // Assign percentages
    const percentages = ['60%', '25%', '15%'];
    
    return items.map((item, index) => ({
      name: item.toUpperCase(),
      percentage: percentages[index],
    }));
  }, []);

  /**
   * Draw the name giant background text
   */
  const drawNameGiant = useCallback((ctx, name) => {
    const { bgText } = CARD_CONFIG;
    const { firstName, lastName } = parseName(name);
    
    if (!firstName) return;
    
    ctx.save();
    ctx.globalAlpha = bgText.name.opacity;
    ctx.fillStyle = bgText.name.color;
    ctx.font = bgText.name.font;
    ctx.textBaseline = 'top';
    
    // Draw first name
    ctx.fillText(firstName.toUpperCase(), bgText.name.x, bgText.name.y);
    
    // Draw last name
    if (lastName) {
      ctx.fillText(lastName.toUpperCase(), bgText.name.x, bgText.name.y + 90);
    }
    
    ctx.restore();
  }, [parseName]);

  /**
   * Draw the SHIP background text
   */
  const drawShipText = useCallback((ctx) => {
    const { bgText, wave } = CARD_CONFIG;
    
    ctx.save();
    ctx.globalAlpha = bgText.ship.opacity;
    ctx.fillStyle = bgText.ship.color;
    ctx.font = bgText.ship.font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.fillText(bgText.ship.text, CARD_CONFIG.width / 2, bgText.ship.y);
    
    ctx.restore();
  }, []);

  /**
   * Draw the photo zone with background gradient
   */
  const drawPhotoZone = useCallback((ctx, photoUrl) => {
    const { photo } = CARD_CONFIG;
    
    // Draw background gradient (yellow to cream)
    const gradient = ctx.createLinearGradient(
      photo.x,
      photo.y,
      photo.x,
      photo.y + photo.height
    );
    gradient.addColorStop(0, '#F0C229');
    gradient.addColorStop(1, '#F5EDD8');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(photo.x, photo.y, photo.width, photo.height);
    
    // Draw border
    ctx.strokeStyle = photo.borderColor;
    ctx.lineWidth = photo.borderWidth;
    ctx.strokeRect(photo.x, photo.y, photo.width, photo.height);
    
    // Draw photo if available
    if (photoUrl) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          // Clip to photo zone
          ctx.save();
          ctx.beginPath();
          ctx.rect(photo.x, photo.y, photo.width, photo.height);
          ctx.clip();
          
          // Draw photo
          const imgAspect = img.width / img.height;
          const zoneAspect = photo.width / photo.height;
          
          let drawWidth, drawHeight, drawX, drawY;
          
          if (imgAspect > zoneAspect) {
            // Image is wider than zone - fit to width
            drawHeight = photo.height;
            drawWidth = photo.height * imgAspect;
            drawX = photo.x - (drawWidth - photo.width) / 2;
            drawY = photo.y;
          } else {
            // Image is taller than zone - fit to height
            drawWidth = photo.width;
            drawHeight = photo.width / imgAspect;
            drawX = photo.x;
            drawY = photo.y - (drawHeight - photo.height) / 2;
          }
          
          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          ctx.restore();
          
          resolve();
        };
        img.onerror = () => {
          console.error('Failed to load photo for card rendering');
          resolve();
        };
        img.src = photoUrl;
      });
    }
    
    return Promise.resolve();
  }, []);

  /**
   * Draw the title plate
   */
  const drawTitlePlate = useCallback((ctx) => {
    const { titlePlate } = CARD_CONFIG;
    
    // Draw red background
    ctx.fillStyle = '#C8001E';
    ctx.fillRect(titlePlate.x, titlePlate.y, titlePlate.width, titlePlate.height);
    
    // Draw border
    ctx.strokeStyle = '#1A1008';
    ctx.lineWidth = titlePlate.borderWidth;
    ctx.beginPath();
    ctx.moveTo(titlePlate.x, titlePlate.y + titlePlate.height);
    ctx.lineTo(titlePlate.x + titlePlate.width, titlePlate.y + titlePlate.height);
    ctx.stroke();
    
    // Draw "HACKER HOUSE" text on left
    ctx.font = '900 44px Unbounded';
    ctx.fillStyle = '#F0C229';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillText('HACKER', 20, titlePlate.y + 10);
    ctx.fillText('HOUSE', 20, titlePlate.y + 55);
    
    // Draw small text below
    ctx.font = '16px Space Mono';
    ctx.fillStyle = '#F0C229';
    ctx.fillText('// BUILDER IDENTITY ARTIFACT #247', 20, titlePlate.y + 85);
    
    // Draw Hindi text on right
    ctx.font = '40px serif';
    ctx.fillStyle = '#F0C229';
    ctx.textAlign = 'right';
    ctx.fillText('हैकर हाउस', titlePlate.width - 20, titlePlate.y + 20);
    ctx.fillText('गोवा', titlePlate.width - 20, titlePlate.y + 65);
    
    // Draw date on right
    ctx.font = '14px Space Mono';
    ctx.fillStyle = '#F0C229';
    ctx.fillText('OCT 28–31 · 2026', titlePlate.width - 20, titlePlate.y + 90);
    
    ctx.textAlign = 'left';
  }, []);

  /**
   * Draw the bottom band
   */
  const drawBottomBand = useCallback((ctx) => {
    const { bottomBand } = CARD_CONFIG;
    const y = bottomBand.y;
    
    // Draw black background
    ctx.fillStyle = bottomBand.bgColor;
    ctx.fillRect(0, y, CARD_CONFIG.width, bottomBand.height);
    
    // Draw border
    ctx.strokeStyle = bottomBand.borderColor;
    ctx.lineWidth = bottomBand.borderWidth;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CARD_CONFIG.width, y);
    ctx.stroke();
    
    // Draw left text
    ctx.font = bottomBand.font;
    ctx.fillStyle = bottomBand.color;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(
      'MADE IN GOA · BUILT TO SHIP · #FrameInGoa · OCT 28–31 2026',
      20,
      y + bottomBand.height / 2
    );
    
    // Draw right text
    ctx.font = bottomBand.rightFont;
    ctx.fillStyle = bottomBand.rightColor;
    ctx.textAlign = 'right';
    ctx.fillText('HHGOA.COM', CARD_CONFIG.width - 20, y + bottomBand.height / 2);
    
    ctx.textAlign = 'left';
  }, []);

  /**
   * Render the ID card onto canvas
   */
  const renderCard = useCallback(async (formData, croppedImageUrl) => {
    setIsRendering(true);
    setError(null);

    try {
      // Ensure fonts are loaded
      await ensureFontsLoaded();

      // Initialize canvas
      const canvas = initCanvas();
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not create canvas context');
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // ===== LAYER ORDER (bottom to top) =====
      
      // Layer 1: Background
      ctx.fillStyle = CARD_CONFIG.colors.cream;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Layer 2: Art background circle
      ctx.fillStyle = CARD_CONFIG.artBgCircle.fill;
      ctx.globalAlpha = CARD_CONFIG.artBgCircle.opacity;
      ctx.beginPath();
      ctx.arc(
        CARD_CONFIG.artBgCircle.cx,
        CARD_CONFIG.artBgCircle.cy,
        CARD_CONFIG.artBgCircle.radius,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.globalAlpha = 1;
      
      // Layer 3: Art background stripe (diagonal polygon)
      ctx.fillStyle = CARD_CONFIG.colors.red;
      ctx.globalAlpha = 0.08;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      ctx.lineTo(0, canvas.height - 400);
      ctx.lineTo(400, canvas.height);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      
      // Layer 4: Name giant background text
      if (formData?.name) {
        drawNameGiant(ctx, formData.name);
      }
      
      // Layer 5: Large hibiscus SVG
      drawHibiscus(ctx, 540, 400, 1, 0.12);
      
      // Layer 6: Art top band
      drawArtTopBand(ctx, CARD_CONFIG.artTopBand.y, canvas.width);
      
      // Layer 7: Title plate
      drawTitlePlate(ctx);
      
      // Layer 8: Photo zone
      await drawPhotoZone(ctx, croppedImageUrl);
      
      // Layer 9: Stickers over photo
      // Quality Builder sticker
      drawSticker(
        ctx,
        '★ QUALITY\nBUILDER ★',
        CARD_CONFIG.stickers.qualityBuilder.x,
        CARD_CONFIG.stickers.qualityBuilder.y,
        CARD_CONFIG.stickers.qualityBuilder.width,
        CARD_CONFIG.stickers.qualityBuilder.height,
        CARD_CONFIG.stickers.qualityBuilder.bgColor,
        CARD_CONFIG.stickers.qualityBuilder.textColor,
        CARD_CONFIG.stickers.qualityBuilder.rotation,
        CARD_CONFIG.stickers.qualityBuilder.borderColor,
        CARD_CONFIG.stickers.qualityBuilder.borderWidth,
        CARD_CONFIG.stickers.qualityBuilder.font
      );
      
      // Builder Detected sticker
      drawSticker(
        ctx,
        '// BUILDER\nDETECTED',
        CARD_CONFIG.stickers.builderDetected.x,
        CARD_CONFIG.stickers.builderDetected.y,
        CARD_CONFIG.stickers.builderDetected.width,
        CARD_CONFIG.stickers.builderDetected.height,
        CARD_CONFIG.stickers.builderDetected.bgColor,
        CARD_CONFIG.stickers.builderDetected.textColor,
        CARD_CONFIG.stickers.builderDetected.rotation,
        CARD_CONFIG.stickers.builderDetected.borderColor,
        CARD_CONFIG.stickers.builderDetected.borderWidth,
        CARD_CONFIG.stickers.builderDetected.font
      );
      
      // Layer 10: Small decorative SVGs inside photo zone
      // Scooter
      drawScooter(ctx, 100, 600, 0.5, 1);
      
      // Coconut tree
      drawCoconutTree(ctx, 950, 180, 0.5, 1);
      
      // Layer 11: SHIP background text
      drawShipText(ctx);
      
      // Layer 12: Wave SVG
      drawWave(ctx, CARD_CONFIG.wave.y, canvas.width, CARD_CONFIG.wave.height);
      
      // Layer 13: Seal (100% GOA COMPAT.)
      drawSeal(ctx, 
               CARD_CONFIG.seal.cx, 
               CARD_CONFIG.seal.cy, 
               CARD_CONFIG.seal.radius,
               '100%', 
               'GOA COMPAT.');
      
      // Layer 14: Name display
      if (formData?.name) {
        const { firstName, lastName } = parseName(formData.name);
        const { nameDisplay } = CARD_CONFIG;
        
        ctx.font = nameDisplay.firstNameFont;
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        
        // First name (red)
        ctx.fillStyle = nameDisplay.firstNameColor;
        ctx.fillText(firstName.toUpperCase(), nameDisplay.x, nameDisplay.y);
        
        // Last name (cream with ink stroke)
        if (lastName) {
          const yOffset = 88 * nameDisplay.lineHeight;
          drawStrokedText(
            ctx,
            lastName.toUpperCase(),
            nameDisplay.x,
            nameDisplay.y + yOffset,
            nameDisplay.lastNameColor,
            nameDisplay.strokeColor,
            nameDisplay.strokeWidth,
            nameDisplay.lastNameFont
          );
        }
        ctx.textAlign = 'left';
      }
      
      // Layer 15: Title label (black pill with yellow text)
      if (formData?.builderTitle) {
        const { titleBadge } = CARD_CONFIG;
        const text = formData.builderTitle.toUpperCase();
        
        // Calculate text width
        ctx.font = titleBadge.font;
        const textWidth = ctx.measureText(text).width;
        const pillWidth = textWidth + titleBadge.padding.left + titleBadge.padding.right;
        const pillHeight = 40;
        
        // Draw black pill
        ctx.save();
        ctx.translate(titleBadge.x + pillWidth / 2, titleBadge.y + pillHeight / 2);
        ctx.rotate(titleBadge.rotation * Math.PI / 180);
        
        ctx.fillStyle = titleBadge.bgColor;
        drawRoundRect(
          ctx,
          -pillWidth / 2,
          -pillHeight / 2,
          pillWidth,
          pillHeight,
          20,
          titleBadge.bgColor,
          null,
          null
        );
        
        // Draw text
        ctx.font = titleBadge.font;
        ctx.fillStyle = titleBadge.textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 0, 0);
        
        ctx.restore();
      }
      
      // Layer 16: Ingredients box
      if (formData?.stack) {
        const items = parseStack(formData.stack);
        if (items.length > 0) {
          drawIngredientsBox(ctx, items, CARD_CONFIG.ingredients.x, CARD_CONFIG.ingredients.y);
        }
      }
      
      // Layer 17: Easter egg chips
      const easterEggs = [
        '404: SLEEP NOT FOUND',
        'WORKS ON MY MACHINE',
        'COFFEE: CRITICAL',
        'JUGAAD IN PROGRESS'
      ];
      drawEasterEggs(ctx, easterEggs, CARD_CONFIG.easterEggs.x, CARD_CONFIG.easterEggs.y);
      
      // Layer 18: Art bottom band (footer stripe)
      drawArtTopBand(ctx, CARD_CONFIG.bottomBand.y, canvas.width);
      
      // Layer 19: Bottom band
      drawBottomBand(ctx);

      setIsRendering(false);
      return canvas;

    } catch (err) {
      console.error('Failed to render card:', err);
      setError(err.message);
      setIsRendering(false);
      throw err;
    }
  }, [
    ensureFontsLoaded,
    initCanvas,
    drawNameGiant,
    drawShipText,
    drawArtTopBand,
    drawTitlePlate,
    drawPhotoZone,
    drawStrokedText,
    drawRoundRect,
    drawSeal,
    drawIngredientsBox,
    drawEasterEggs,
    parseName,
    parseStack,
    drawSticker,
    drawHibiscus,
    drawScooter,
    drawCoconutTree,
    drawWave
  ]);

  /**
   * Get the canvas element
   */
  const getCanvas = useCallback(() => {
    return canvasRef.current;
  }, []);

  /**
   * Get the card as PNG data URL
   */
  const getCardDataURL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      throw new Error('Canvas not initialized. Call renderCard() first.');
    }
    return canvas.toDataURL('image/png');
  }, []);

  /**
   * Get the card as Blob for download
   */
  const getCardBlob = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      throw new Error('Canvas not initialized. Call renderCard() first.');
    }
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Unable to create PNG blob'));
          return;
        }
        resolve(blob);
      }, 'image/png');
    });
  }, []);

  return {
    renderCard,
    getCanvas,
    getCardDataURL,
    getCardBlob,
    isRendering,
    error,
  };
};

export default useCardRenderer;
