import React, { useState, useRef, useCallback, useEffect, lazy, Suspense } from 'react';
import { getCroppedImg } from '../utils/canvasHelpers';

const EasyCrop = lazy(() => import('react-easy-crop'));

/**
 * Cropper Component - Phase 2 Implementation (Fixed)
 * 
 * Features:
 * - react-easy-crop integration with 3:4 aspect ratio (portrait)
 * - Zoom slider control
 * - Rotate 90° button
 * - Live preview of card silhouette
 * - Touch support for mobile (pinch-to-zoom, drag)
 * - Proper minZoom calculation using onMediaLoaded
 */
export const Cropper = ({ photoData, onNext, onBack }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [error, setError] = useState(null);
  const [mediaDimensions, setMediaDimensions] = useState(null);
  
  const cropperContainerRef = useRef(null);
  const easyCropRef = useRef(null);

  /**
   * Aspect ratio for the crop - 3:4 portrait
   */
  const aspectRatio = 3 / 4;

  /**
   * Load the image from photoData
   */
  useEffect(() => {
    if (photoData?.objectURL) {
      setImageSrc(photoData.objectURL);
    }
  }, [photoData]);

  /**
   * Handle media loaded - get natural dimensions
   * This is called by react-easy-crop when the image loads
   */
  const onMediaLoaded = useCallback((mediaSize) => {
    setMediaDimensions({
      naturalWidth: mediaSize.naturalWidth,
      naturalHeight: mediaSize.naturalHeight,
    });
  }, []);

  /**
   * Calculate minimum zoom for the cropper
   * This ensures the crop area can always fit within the image
   */
  const calculateMinZoom = useCallback((naturalWidth, naturalHeight) => {
    const mediaAspect = naturalWidth / naturalHeight;
    
    if (mediaAspect > aspectRatio) {
      // Image is wider than target aspect ratio
      // We need to zoom in enough so the height fits the crop area
      return naturalHeight / (naturalWidth / aspectRatio);
    } else {
      // Image is taller than target aspect ratio
      // We need to zoom in enough so the width fits the crop area
      return naturalWidth / (naturalHeight * aspectRatio);
    }
  }, []);

  /**
   * Get the minimum zoom value
   * Returns 1 if we don't have media dimensions yet
   */
  const getMinZoom = useCallback(() => {
    if (!mediaDimensions) return 1;
    return calculateMinZoom(mediaDimensions.naturalWidth, mediaDimensions.naturalHeight);
  }, [mediaDimensions, calculateMinZoom]);

  /**
   * Handle crop completion - store the pixel coordinates
   */
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  /**
   * Handle zoom change
   */
  const onZoomChange = useCallback((zoom) => {
    setZoom(zoom);
  }, []);

  /**
   * Handle rotation
   */
  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  /**
   * Handle the crop confirmation
   * Extract the cropped image using canvas and pass to next step
   */
  const handleCropConfirm = useCallback(async () => {
    if (!croppedAreaPixels || !imageSrc) {
      setError('Please adjust your crop first');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Prefer the internal image element from react-easy-crop if available.
      // If the component instance doesn't expose it, fall back to a new Image.
      let image = easyCropRef.current?.imageRef?.current;
      if (!image) {
        image = new Image();
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
          image.src = imageSrc;
        });
      }

      // Get the cropped image
      const { blob, objectURL } = await getCroppedImg(
        image,
        croppedAreaPixels,
        rotation
      );

      // Pass the cropped data to the next step
      onNext({
        blob,
        objectURL,
        croppedAreaPixels,
        rotation,
        // Also carry forward original metadata
        fileName: photoData?.fileName || 'cropped-photo.jpg',
        fileSize: blob.size,
      });

    } catch (err) {
      console.error('Failed to crop image:', err);
      setError('Failed to process your crop. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [croppedAreaPixels, imageSrc, rotation, photoData, onNext]);

  /**
   * Format zoom percentage for display
   */
  const formatZoom = useCallback((zoomValue) => {
    return `${Math.round(zoomValue * 100)}%`;
  }, []);

  /**
   * Dismiss error
   */
  const handleDismissError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Calculate preview object position correctly
   * Uses the crop x/y relative to the image dimensions, not the crop dimensions
   */
  const getPreviewObjectPosition = useCallback(() => {
    if (!croppedAreaPixels || !mediaDimensions) {
      return '50% 50%';
    }
    
    // Calculate the center of the crop relative to the image
    const centerX = croppedAreaPixels.x + croppedAreaPixels.width / 2;
    const centerY = croppedAreaPixels.y + croppedAreaPixels.height / 2;
    
    // Convert to percentage of image dimensions
    const percentX = (centerX / mediaDimensions.naturalWidth) * 100;
    const percentY = (centerY / mediaDimensions.naturalHeight) * 100;
    
    return `${percentX}% ${percentY}%`;
  }, [croppedAreaPixels, mediaDimensions]);

  return (
    <div className="cropper-container">
      {/* Error state */}
      {error && (
        <div className="cropper-error" role="alert">
          <span>{error}</span>
          <button 
            className="btn-secondary" 
            onClick={handleDismissError}
            style={{ marginLeft: '12px', padding: '6px 12px', fontSize: '13px' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="cropper-header">
        <h2 className="cropper-title">Crop & Frame</h2>
        <p className="cropper-subtitle">Adjust your portrait photo</p>
        <p className="cropper-hint">
          Maintain a 3:4 portrait ratio for best results
        </p>
      </div>

      {/* Main cropper area */}
      <div className="cropper-main">
        {/* The actual cropper */}
        <div 
          className="cropper-wrapper" 
          ref={cropperContainerRef}
        >
          <Suspense fallback={<div className="cropper-loading">Loading cropper...</div>}>
            <EasyCrop
              ref={easyCropRef}
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              minZoom={getMinZoom()}
              maxZoom={3}
              zoomSpeed={0.5}
              onCropChange={setCrop}
              onZoomChange={onZoomChange}
              onCropComplete={onCropComplete}
              onMediaLoaded={onMediaLoaded}
              rotation={rotation}
              objectFit="contain"
              showGrid={false}
              disableAutomaticStylesInjection={true}
              classes={{
                containerClassName: 'react-easy-crop-container',
                cropAreaClassName: 'react-easy-crop-crop-area',
                mediaClassName: 'react-easy-crop-media',
              }}
              style={{
                containerStyle: {
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                },
                cropAreaStyle: {
                  border: '2px solid var(--accent-primary)',
                  borderRadius: '8px',
                  background: 'rgba(123, 92, 240, 0.1)',
                },
                mediaStyle: {
                  borderRadius: '4px',
                },
              }}
            />
          </Suspense>
        </div>

        {/* Live preview of card silhouette */}
        <div className="cropper-preview">
          <h3>Preview</h3>
          <div className="preview-card">
            <div className="preview-photo">
              {croppedAreaPixels && imageSrc && (
                <img
                  src={imageSrc}
                  alt="Preview"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: getPreviewObjectPosition(),
                    borderRadius: '4px',
                    transform: `rotate(${rotation}deg)`,
                    transformOrigin: 'center',
                  }}
                />
              )}
            </div>
            <p style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
              Photo area (260×320)
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="cropper-controls">
        <div className="cropper-control-group">
          <label className="cropper-control-label">
            Zoom: {formatZoom(zoom)}
          </label>
          <input
            type="range"
            min={getMinZoom()}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => onZoomChange(parseFloat(e.target.value))}
            className="cropper-zoom-slider"
            disabled={isProcessing}
          />
        </div>

        <div className="cropper-actions">
          <button 
            className="btn-secondary"
            onClick={handleRotate}
            disabled={isProcessing}
            title="Rotate 90°"
          >
            Rotate
          </button>
          
          <button 
            className="btn-secondary"
            onClick={onBack}
            disabled={isProcessing}
          >
            Back
          </button>
          
          <button 
            className="btn-primary"
            onClick={handleCropConfirm}
            disabled={isProcessing || !croppedAreaPixels}
          >
            {isProcessing ? 'Processing...' : 'Looks Good'}
          </button>
        </div>
      </div>

      {/* Mobile tip */}
      <div className="cropper-mobile-tip">
        <small style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
          Tip: Pinch to zoom, drag to reposition
        </small>
      </div>
    </div>
  );
};

export default Cropper;
