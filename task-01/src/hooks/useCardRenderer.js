import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Card dimensions and layout constants
 * From DesignDoc Section 8: Card Design Spec
 */
const CARD_CONFIG = {
  // Final output size (2x for retina)
  outputWidth: 1080,
  outputHeight: 1350,
  
  // Canvas render size (will be scaled 2x)
  canvasWidth: 540,
  canvasHeight: 675,
  
  // Photo area (3:4 aspect ratio, matches cropper output)
  photoWidth: 260,
  photoHeight: 320,
  photoX: 20,
  photoY: 120,
  photoBorderRadius: 8,
  
  // Card dimensions
  cardBorderRadius: 16,
  cardPadding: 20,
  
  // Header zone
  headerHeight: 60,
  logoWidth: 100,
  logoHeight: 40,
  logoX: 420,  // top-right
  logoY: 10,
  
  // Text positioning
  nameX: 280,
  nameY: 140,
  nameFontSize: 32,
  nameFontWeight: 700,
  nameFontFamily: 'Space Grotesk',
  
  roleX: 280,
  roleY: 180,
  roleFontSize: 15,
  roleFontWeight: 400,
  roleFontFamily: 'Inter',
  
  cityX: 280,
  cityY: 200,
  cityFontSize: 13,
  
  xHandleX: 280,
  xHandleY: 220,
  xHandleFontSize: 13,
  
  // Builder title badge
  badgeWidth: 200,
  badgeHeight: 32,
  badgeX: 280,
  badgeY: 250,
  badgeBorderRadius: 16,
  badgeFontSize: 14,
  badgeFontWeight: 800,
  badgeFontFamily: 'Space Grotesk',
  
  // Footer
  footerY: 610,
  footerFontSize: 11,
  
  // Colors from tokens.css
  colors: {
    bgCard: '#111118',
    accentPrimary: '#7B5CF0',
    accentGlow: '#A78BFA',
    accentHot: '#F97316',
    textPrimary: '#FAFAFA',
    textSecondary: '#A1A1AA',
    textMuted: '#52525B',
    borderSubtle: '#27272A',
  },
};

/**
 * Card layout layers in order (bottom to top)
 * From DesignDoc Section 4: Card Canvas Rendering
 */
const LAYER_ORDER = [
  'background',
  'borderGlow',
  'logo',
  'headerText',
  'photo',
  'photoBorder',
  'name',
  'role',
  'city',
  'xHandle',
  'builderTitleBadge',
  'divider',
  'footer',
];

/**
 * Custom hook for rendering the ID card onto canvas
 */
export const useCardRenderer = () => {
  const canvasRef = useRef(null);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  /**
   * Initialize canvas and ensure fonts are loaded
   */
  const initCanvas = useCallback(() => {
    if (!canvasRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = CARD_CONFIG.canvasWidth;
      canvas.height = CARD_CONFIG.canvasHeight;
      canvasRef.current = canvas;
    }
    return canvasRef.current;
  }, []);

  /**
   * Ensure required fonts are loaded before rendering
   * Uses document.fonts.ready promise
   */
  const ensureFontsLoaded = useCallback(async () => {
    if (fontsLoaded) return true;
    
    try {
      // Check if fonts are already loaded
      await document.fonts.ready;
      
      // Verify Space Grotesk is loaded
      const spaceGroteskLoaded = document.fonts.check('32px Space Grotesk');
      const interLoaded = document.fonts.check('14px Inter');
      
      if (spaceGroteskLoaded && interLoaded) {
        setFontsLoaded(true);
        return true;
      }
      
      // If not loaded, try to load them
      await document.fonts.load('32px Space Grotesk');
      await document.fonts.load('14px Inter');
      await document.fonts.load('14px Space Grotesk');
      
      setFontsLoaded(true);
      return true;
    } catch (err) {
      console.warn('Font loading check failed, proceeding anyway:', err);
      return true; // Proceed anyway - fonts may still load
    }
  }, [fontsLoaded]);

  /**
   * Render the ID card onto canvas
   * @param {Object} data - Form data
   * @param {string} data.name - Builder name
   * @param {string} data.role - Role/Stack
   * @param {string} [data.city] - City/Country (optional)
   * @param {string} [data.xHandle] - X handle without @ (optional)
   * @param {string} data.builderTitle - Builder title
   * @param {string} croppedImageUrl - Object URL of cropped photo
   * @returns {Promise<HTMLCanvasElement>} - Canvas with rendered card
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

      // Draw each layer in order
      await drawBackground(ctx);
      await drawBorderGlow(ctx);
      await drawLogo(ctx);
      await drawHeaderText(ctx);
      await drawPhoto(ctx, croppedImageUrl);
      await drawPhotoBorder(ctx);
      await drawName(ctx, formData.name);
      await drawRole(ctx, formData.role);
      
      if (formData.city) {
        await drawCity(ctx, formData.city);
      }
      
      if (formData.xHandle) {
        await drawXHandle(ctx, formData.xHandle);
      }
      
      await drawBuilderTitleBadge(ctx, formData.builderTitle);
      await drawDivider(ctx);
      await drawFooter(ctx);

      setIsRendering(false);
      return canvas;

    } catch (err) {
      console.error('Failed to render card:', err);
      setError(err.message);
      setIsRendering(false);
      throw err;
    }
  }, [ensureFontsLoaded, initCanvas]);

  /**
   * Get the canvas element
   */
  const getCanvas = useCallback(() => {
    return canvasRef.current;
  }, []);

  /**
   * Create an export canvas at the final output size
   */
  const createExportCanvas = useCallback(() => {
    const sourceCanvas = canvasRef.current;
    if (!sourceCanvas) {
      throw new Error('Canvas not initialized. Call renderCard() first.');
    }

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = CARD_CONFIG.outputWidth;
    exportCanvas.height = CARD_CONFIG.outputHeight;

    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) {
      throw new Error('Could not create export canvas context');
    }

    exportCtx.drawImage(sourceCanvas, 0, 0, CARD_CONFIG.outputWidth, CARD_CONFIG.outputHeight);
    return exportCanvas;
  }, []);

  /**
   * Get the card as PNG data URL
   */
  const getCardDataURL = useCallback(() => {
    const exportCanvas = createExportCanvas();
    return exportCanvas.toDataURL('image/png');
  }, [createExportCanvas]);

  /**
   * Get the card as Blob for download
   */
  const getCardBlob = useCallback(() => {
    const exportCanvas = createExportCanvas();
    return new Promise((resolve, reject) => {
      exportCanvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Unable to create PNG blob')); 
          return;
        }
        resolve(blob);
      }, 'image/png');
    });
  }, [createExportCanvas]);

  // ===== Layer Drawing Functions =====

  /**
   * Draw background fill
   */
  const drawBackground = useCallback((ctx) => {
    ctx.fillStyle = CARD_CONFIG.colors.bgCard;
    ctx.fillRect(0, 0, CARD_CONFIG.canvasWidth, CARD_CONFIG.canvasHeight);
  }, []);

  /**
   * Draw subtle border glow
   */
  const drawBorderGlow = useCallback((ctx) => {
    // Draw rounded rectangle for card background
    const radius = CARD_CONFIG.cardBorderRadius;
    const width = CARD_CONFIG.canvasWidth;
    const height = CARD_CONFIG.canvasHeight;
    
    ctx.fillStyle = CARD_CONFIG.colors.bgCard;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(width - radius, 0);
    ctx.quadraticCurveTo(width, 0, width, radius);
    ctx.lineTo(width, height - radius);
    ctx.quadraticCurveTo(width, height, width - radius, height);
    ctx.lineTo(radius, height);
    ctx.quadraticCurveTo(0, height, 0, height - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fill();
    
    // Add subtle border
    ctx.strokeStyle = CARD_CONFIG.colors.borderSubtle;
    ctx.lineWidth = 1;
    ctx.stroke();
  }, []);

  /**
   * Draw HH Goa 2026 logo placeholder
   * Replace with actual logo when available
   */
  const drawLogo = useCallback((ctx) => {
    // For now, draw text placeholder
    ctx.fillStyle = CARD_CONFIG.colors.accentPrimary;
    ctx.font = `bold 14px Space Grotesk`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('HH GOA', CARD_CONFIG.canvasWidth - 10, 10);
    
    // Draw "2026" in accent glow
    ctx.fillStyle = CARD_CONFIG.colors.accentGlow;
    ctx.font = `bold 14px Space Grotesk`;
    ctx.fillText('2026', CARD_CONFIG.canvasWidth - 10, 28);
  }, []);

  /**
   * Draw header text
   */
  const drawHeaderText = useCallback((ctx) => {
    ctx.fillStyle = CARD_CONFIG.colors.textSecondary;
    ctx.font = `bold 10px Space Grotesk`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('BUILDER PASS', CARD_CONFIG.cardPadding, 10);
  }, []);

  /**
   * Draw cropped photo
   */
  const drawPhoto = useCallback((ctx, imageUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        // Draw photo with rounded corners using clip path
        const { photoX, photoY, photoWidth, photoHeight, photoBorderRadius } = CARD_CONFIG;
        
        // Save context
        ctx.save();
        
        // Create rounded rectangle clip path
        ctx.beginPath();
        ctx.moveTo(photoX + photoBorderRadius, photoY);
        ctx.lineTo(photoX + photoWidth - photoBorderRadius, photoY);
        ctx.quadraticCurveTo(photoX + photoWidth, photoY, photoX + photoWidth, photoY + photoBorderRadius);
        ctx.lineTo(photoX + photoWidth, photoY + photoHeight - photoBorderRadius);
        ctx.quadraticCurveTo(photoX + photoWidth, photoY + photoHeight, photoX + photoWidth - photoBorderRadius, photoY + photoHeight);
        ctx.lineTo(photoX + photoBorderRadius, photoY + photoHeight);
        ctx.quadraticCurveTo(photoX, photoY + photoHeight, photoX, photoY + photoHeight - photoBorderRadius);
        ctx.lineTo(photoX, photoY + photoBorderRadius);
        ctx.quadraticCurveTo(photoX, photoY, photoX + photoBorderRadius, photoY);
        ctx.closePath();
        ctx.clip();
        
        // Draw the image
        ctx.drawImage(img, photoX, photoY, photoWidth, photoHeight);
        
        // Restore context
        ctx.restore();
        
        resolve();
      };
      
      img.onerror = () => {
        console.error('Failed to load photo for card rendering');
        // Draw placeholder
        ctx.fillStyle = CARD_CONFIG.colors.surfaceRaised || '#1C1C25';
        ctx.fillRect(CARD_CONFIG.photoX, CARD_CONFIG.photoY, CARD_CONFIG.photoWidth, CARD_CONFIG.photoHeight);
        resolve();
      };
      
      img.src = imageUrl;
    });
  }, []);

  /**
   * Draw photo border
   */
  const drawPhotoBorder = useCallback((ctx) => {
    const { photoX, photoY, photoWidth, photoHeight, photoBorderRadius } = CARD_CONFIG;
    
    ctx.strokeStyle = CARD_CONFIG.colors.accentPrimary;
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(photoX + photoBorderRadius, photoY);
    ctx.lineTo(photoX + photoWidth - photoBorderRadius, photoY);
    ctx.quadraticCurveTo(photoX + photoWidth, photoY, photoX + photoWidth, photoY + photoBorderRadius);
    ctx.lineTo(photoX + photoWidth, photoY + photoHeight - photoBorderRadius);
    ctx.quadraticCurveTo(photoX + photoWidth, photoY + photoHeight, photoX + photoWidth - photoBorderRadius, photoY + photoHeight);
    ctx.lineTo(photoX + photoBorderRadius, photoY + photoHeight);
    ctx.quadraticCurveTo(photoX, photoY + photoHeight, photoX, photoY + photoHeight - photoBorderRadius);
    ctx.lineTo(photoX, photoY + photoBorderRadius);
    ctx.quadraticCurveTo(photoX, photoY, photoX + photoBorderRadius, photoY);
    ctx.closePath();
    ctx.stroke();
  }, []);

  /**
   * Draw name text
   */
  const drawName = useCallback((ctx, name) => {
    ctx.fillStyle = CARD_CONFIG.colors.textPrimary;
    ctx.font = `bold ${CARD_CONFIG.nameFontSize}px ${CARD_CONFIG.nameFontFamily}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // Truncate if too long
    const maxNameLength = 40;
    const displayName = name.length > maxNameLength ? name.substring(0, maxNameLength - 3) + '...' : name;
    
    ctx.fillText(displayName.toUpperCase(), CARD_CONFIG.nameX, CARD_CONFIG.nameY);
  }, []);

  /**
   * Draw role text
   */
  const drawRole = useCallback((ctx, role) => {
    ctx.fillStyle = CARD_CONFIG.colors.textSecondary;
    ctx.font = `400 ${CARD_CONFIG.roleFontSize}px ${CARD_CONFIG.roleFontFamily}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const maxRoleLength = 50;
    const displayRole = role.length > maxRoleLength ? role.substring(0, maxRoleLength - 3) + '...' : role;
    
    ctx.fillText(displayRole, CARD_CONFIG.roleX, CARD_CONFIG.roleY);
  }, []);

  /**
   * Draw city text
   */
  const drawCity = useCallback((ctx, city) => {
    ctx.fillStyle = CARD_CONFIG.colors.textSecondary;
    ctx.font = `400 ${CARD_CONFIG.cityFontSize}px Inter`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(city, CARD_CONFIG.cityX, CARD_CONFIG.cityY);
  }, []);

  /**
   * Draw X handle text
   */
  const drawXHandle = useCallback((ctx, handle) => {
    ctx.fillStyle = CARD_CONFIG.colors.textMuted;
    ctx.font = `400 ${CARD_CONFIG.xHandleFontSize}px Inter`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`@${handle}`, CARD_CONFIG.xHandleX, CARD_CONFIG.xHandleY);
  }, []);

  /**
   * Draw builder title badge
   */
  const drawBuilderTitleBadge = useCallback((ctx, title) => {
    const { badgeX, badgeY, badgeWidth, badgeHeight, badgeBorderRadius } = CARD_CONFIG;
    
    // Draw badge background (hot orange)
    ctx.fillStyle = CARD_CONFIG.colors.accentHot;
    
    ctx.beginPath();
    ctx.moveTo(badgeX + badgeBorderRadius, badgeY);
    ctx.lineTo(badgeX + badgeWidth - badgeBorderRadius, badgeY);
    ctx.quadraticCurveTo(badgeX + badgeWidth, badgeY, badgeX + badgeWidth, badgeY + badgeBorderRadius);
    ctx.lineTo(badgeX + badgeWidth, badgeY + badgeHeight - badgeBorderRadius);
    ctx.quadraticCurveTo(badgeX + badgeWidth, badgeY + badgeHeight, badgeX + badgeWidth - badgeBorderRadius, badgeY + badgeHeight);
    ctx.lineTo(badgeX + badgeBorderRadius, badgeY + badgeHeight);
    ctx.quadraticCurveTo(badgeX, badgeY + badgeHeight, badgeX, badgeY + badgeHeight - badgeBorderRadius);
    ctx.lineTo(badgeX, badgeY + badgeBorderRadius);
    ctx.quadraticCurveTo(badgeX, badgeY, badgeX + badgeBorderRadius, badgeY);
    ctx.closePath();
    ctx.fill();
    
    // Draw title text
    ctx.fillStyle = CARD_CONFIG.colors.textPrimary;
    ctx.font = `bold ${CARD_CONFIG.badgeFontSize}px ${CARD_CONFIG.badgeFontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title.toUpperCase(), badgeX + badgeWidth / 2, badgeY + badgeHeight / 2);
  }, []);

  /**
   * Draw divider line
   */
  const drawDivider = useCallback((ctx) => {
    const startX = CARD_CONFIG.cardPadding;
    const endX = CARD_CONFIG.canvasWidth - CARD_CONFIG.cardPadding;
    const y = CARD_CONFIG.footerY - 20;
    
    ctx.strokeStyle = CARD_CONFIG.colors.borderSubtle;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
    ctx.stroke();
    
    // Reset line dash
    ctx.setLineDash([]);
  }, []);

  /**
   * Draw footer text
   */
  const drawFooter = useCallback((ctx) => {
    ctx.fillStyle = CARD_CONFIG.colors.textMuted;
    ctx.font = `400 ${CARD_CONFIG.footerFontSize}px Inter`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('GOA • JAN 2026 • goa.hackathon.com', CARD_CONFIG.canvasWidth / 2, CARD_CONFIG.footerY);
  }, []);

  return {
    renderCard,
    getCanvas,
    getCardDataURL,
    getCardBlob,
    isRendering,
    error,
    fontsLoaded,
  };
};

export default useCardRenderer;
