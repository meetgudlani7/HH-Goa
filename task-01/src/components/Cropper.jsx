import React, { useState, useRef, useCallback, useEffect, lazy, Suspense } from 'react';
import { getCroppedImg } from '../utils/imageUtils';

const EasyCrop = lazy(() => import('react-easy-crop'));

/**
 * Aspect ratio for the crop - 3:4 portrait
 */
const aspectRatio = 3 / 4;

/**
 * react-easy-crop's own `objectFit="contain"` mode already guarantees the
 * whole photo is visible at zoom=1 (it fits the image inside the crop area
 * itself, independent of the image's own aspect ratio) — no custom minZoom
 * math is needed, and a hand-rolled one here previously fought that default
 * and produced badly over-zoomed starting crops for some real-world photos
 * (e.g. ones with EXIF orientation, which synthetic test images don't have).
 */
const MIN_ZOOM = 1;

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
export const Cropper = ({ setStep, originalBlob, setCroppedImageURL }) => {
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
   * Load the image from originalBlob
   */
  useEffect(() => {
    if (originalBlob?.objectURL) {
      setImageSrc(originalBlob.objectURL);
    }
  }, [originalBlob]);

  /**
   * Handle media loaded - just capture natural dimensions for the preview
   * thumbnail's object-position math. Zoom starts at MIN_ZOOM (1) and
   * `objectFit="contain"` on EasyCrop takes care of showing the whole photo.
   */
  const onMediaLoaded = useCallback((mediaSize) => {
    setMediaDimensions({
      naturalWidth: mediaSize.naturalWidth,
      naturalHeight: mediaSize.naturalHeight,
    });
  }, []);

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
   */
  const handleCropConfirm = useCallback(async () => {
    if (!croppedAreaPixels || !imageSrc) {
      setError('Please adjust your crop first');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      let image = easyCropRef.current?.imageRef?.current;
      if (!image) {
        image = new Image();
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
          image.src = imageSrc;
        });
      }

      const { objectURL } = await getCroppedImg(image, croppedAreaPixels, rotation);

      setCroppedImageURL(objectURL);
      setStep('form');
    } catch (err) {
      console.error('Failed to crop image:', err);
      setError('Failed to process your crop. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [croppedAreaPixels, imageSrc, rotation, setStep, setCroppedImageURL]);

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
   * Calculate preview object position
   */
  const getPreviewObjectPosition = useCallback(() => {
    if (!croppedAreaPixels || !mediaDimensions) {
      return '50% 50%';
    }

    const centerX = croppedAreaPixels.x + croppedAreaPixels.width / 2;
    const centerY = croppedAreaPixels.y + croppedAreaPixels.height / 2;
    const percentX = (centerX / mediaDimensions.naturalWidth) * 100;
    const percentY = (centerY / mediaDimensions.naturalHeight) * 100;

    return `${percentX}% ${percentY}%`;
  }, [croppedAreaPixels, mediaDimensions]);

  return (
    <div
      style={{
        background: 'var(--cream)',
        border: '4px solid var(--ink)',
      }}
    >
      <div className="border-strip-top"></div>

      <div className="windowbar">
        <div className="windowbar-title">⬛ APNI PHOTO FRAME KAR — STEP 1 OF 3</div>
        <div className="wbtns">
          <div className="wbtn" style={{ background: '#C8001E' }}></div>
          <div className="wbtn" style={{ background: '#F0C229' }}></div>
          <div className="wbtn" style={{ background: '#2A7A4B' }}></div>
        </div>
      </div>

      <div style={{ padding: '18px' }}>
        {/* Eyebrow */}
        <div
          style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '8px',
            letterSpacing: '.2em',
            color: 'var(--fade)',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}
        >
          // FRAME YOUR FACE · PORTRAIT CROP LOCKED
        </div>

        {/* Heading */}
        <h2
          style={{
            fontFamily: 'Unbounded, sans-serif',
            fontWeight: '900',
            fontSize: '22px',
            color: 'var(--ink)',
            textTransform: 'uppercase',
            lineHeight: '1',
            marginBottom: '16px',
            borderBottom: '4px solid var(--ink)',
            paddingBottom: '10px',
          }}
        >
          CHOOSE
          <br />
          YOUR
          <br />
          STYLE
        </h2>

        {/* Main cropper area */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '16px',
            alignItems: 'start',
          }}
        >
          {/* The actual cropper */}
          <div
            className="cropper-wrapper"
            ref={cropperContainerRef}
            style={{
              width: '100%',
              maxWidth: '360px',
              aspectRatio: `${aspectRatio}`,
              margin: '0 auto',
              background: 'var(--cream)',
              border: '4px solid var(--ink)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Suspense
              fallback={
                <div style={{ padding: '20px', textAlign: 'center' }}>Loading cropper...</div>
              }
            >
              <EasyCrop
                ref={easyCropRef}
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio}
                minZoom={MIN_ZOOM}
                maxZoom={3}
                zoomSpeed={0.5}
                onCropChange={setCrop}
                onZoomChange={onZoomChange}
                onCropComplete={onCropComplete}
                onMediaLoaded={onMediaLoaded}
                rotation={rotation}
                objectFit="contain"
                showGrid={false}
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
                    border: '2px solid var(--ink)',
                    borderRadius: '0',
                    background: 'rgba(26, 16, 8, 0.05)',
                  },
                  mediaStyle: {
                    borderRadius: '0',
                  },
                }}
              />
            </Suspense>
          </div>

          {/* Preview */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              padding: '16px',
              background: 'var(--cream)',
              border: '1px solid var(--ink)',
              order: -1,
            }}
          >
            <h3
              style={{
                fontFamily: 'Teko, sans-serif',
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--ink)',
                margin: '0',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              PREVIEW
            </h3>
            <div
              style={{
                width: '80px',
                height: '106.67px',
                position: 'relative',
                overflow: 'hidden',
                background: 'var(--paper)',
                border: '1px solid var(--ink)',
              }}
            >
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
                    borderRadius: '0',
                    transform: `rotate(${rotation}deg)`,
                    transformOrigin: 'center',
                  }}
                />
              )}
            </div>
            <p
              style={{
                marginTop: '8px',
                fontSize: '11px',
                color: 'var(--fade)',
                fontFamily: 'Space Mono, monospace',
              }}
            >
              Photo area (260×320)
            </p>
          </div>

          {/* Controls */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '16px',
              background: 'var(--cream)',
              border: '1px solid var(--ink)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label
                style={{
                  fontFamily: 'Teko, sans-serif',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--ink)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Zoom: {formatZoom(zoom)}
              </label>
              <input
                type="range"
                min={MIN_ZOOM}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => onZoomChange(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  height: '6px',
                  borderRadius: '3px',
                  background: 'var(--paper)',
                  outline: 'none',
                  cursor: 'pointer',
                  borderBottom: '3px solid var(--ink)',
                }}
                disabled={isProcessing}
              />
            </div>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                className="tag"
                onClick={handleRotate}
                disabled={isProcessing}
                title="Rotate 90°"
              >
                ROTATE
              </button>

              <button className="tag" onClick={() => setStep('upload')} disabled={isProcessing}>
                BACK
              </button>

              <button
                className="generate-btn"
                onClick={handleCropConfirm}
                disabled={isProcessing || !croppedAreaPixels}
              >
                FACE LOCK KAR →
              </button>
            </div>
          </div>
        </div>

        {/* Mobile tip */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '12px',
            color: 'var(--fade)',
            fontSize: '11px',
            fontFamily: 'Space Mono, monospace',
          }}
        >
          Tip: Pinch to zoom, drag to reposition
        </div>
      </div>

      <div className="border-strip-bottom"></div>

      {/* Error state */}
      {error && (
        <div
          style={{
            background: 'rgba(200,0,30,.15)',
            border: '1px solid var(--red)',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: 'var(--red)',
            fontSize: '14px',
            textAlign: 'center',
            marginTop: '12px',
          }}
        >
          <span>{error}</span>
          <button
            onClick={handleDismissError}
            style={{
              background: 'transparent',
              border: '1px solid var(--red)',
              color: 'var(--red)',
              padding: '4px 12px',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'Space Mono, monospace',
            }}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default Cropper;
