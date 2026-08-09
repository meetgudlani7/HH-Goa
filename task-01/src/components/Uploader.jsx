import React, { useState, useRef, useCallback } from 'react';

/**
 * Uploader Component - Phase 1 Implementation
 * 
 * Features:
 * - Drag and drop support
 * - File input for JPG, PNG, HEIC
 * - HEIC detection and conversion
 * - Loading states
 * - Error handling
 * - File size warnings
 */
export const Uploader = ({ setStep, processImage, setCroppedImageURL }) => {
  const fileInputRef = useRef(null);
  const dragDropRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const [fileSizeWarning, setFileSizeWarning] = useState(false);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const isWasmSupported = () => {
    try {
      return typeof WebAssembly === 'object' && WebAssembly.validate !== undefined;
    } catch (error) {
      return false;
    }
  };

  /**
   * Handle file selection from input
   */
  const handleFileSelect = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsDragging(false);
    setFileInfo({ name: file.name, size: formatFileSize(file.size) });

    const MAX_SIZE_WARN = 20 * 1024 * 1024;
    const MAX_SIZE_ERROR = 40 * 1024 * 1024;

    if (file.size > MAX_SIZE_ERROR) {
      setError('File is too large (over 40MB). Please use a compressed photo.');
      return;
    }

    if (file.size > MAX_SIZE_WARN) {
      setFileSizeWarning(true);
    } else {
      setFileSizeWarning(false);
    }

    setIsProcessing(true);
    setError(null);

    try {
      const processedData = await processImage(file);

      // Don't set croppedImageURL here - this is the original uncropped image
      // The cropped version will be set in the Cropper component
      setFileInfo(null);
      setStep('crop');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err.message || 'Failed to process image');
      setFileInfo(null);
    } finally {
      setIsProcessing(false);
    }
  }, [processImage, setStep, setCroppedImageURL]);

  /**
   * Handle drag and drop events
   */
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setError(null);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please drop an image file (JPG, PNG, or HEIC)');
      return;
    }

    const syntheticEvent = { target: { files: [file] } };
    handleFileSelect(syntheticEvent);
  }, [handleFileSelect, setError]);

  /**
   * Trigger file input click
   */
  const handleClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  /**
   * Format file size in human-readable format
   */
  const formatFileSize = useCallback((bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  /**
   * Dismiss error
   */
  const handleDismissError = useCallback(() => {
    setError(null);
    setFileInfo(null);
    setFileSizeWarning(false);
  }, []);

  // Add drag event listeners
  React.useEffect(() => {
    const dragDropElement = dragDropRef.current;
    if (!dragDropElement) return;

    const handleDragEnter = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        setError('Please drop an image file (JPG, PNG, or HEIC)');
        return;
      }

      const syntheticEvent = { target: { files: [file] } };
      handleFileSelect(syntheticEvent);
    };

    dragDropElement.addEventListener('dragenter', handleDragEnter);
    dragDropElement.addEventListener('dragleave', handleDragLeave);
    dragDropElement.addEventListener('dragover', handleDragOver);
    dragDropElement.addEventListener('drop', handleDrop);

    return () => {
      dragDropElement.removeEventListener('dragenter', handleDragEnter);
      dragDropElement.removeEventListener('dragleave', handleDragLeave);
      dragDropElement.removeEventListener('dragover', handleDragOver);
      dragDropElement.removeEventListener('drop', handleDrop);
    };
  }, [handleFileSelect, setError]);

  return (
    <div className="hero" ref={dragDropRef}>
      {/* Background text elements */}
      <div className="pbt-hacker poster-bg-text">HACK<br />HACK</div>
      <div className="pbt-goa poster-bg-text">GOA</div>
      <div className="pbt-2026 poster-bg-text">2026</div>

      {/* Decorative SVG: hibiscus top right */}
      <svg className="hero-flower-tr" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="50" rx="30" ry="15" fill="#E8407A" opacity=".8" transform="rotate(0 50 50)"/>
        <ellipse cx="50" cy="50" rx="30" ry="15" fill="#E8407A" opacity=".8" transform="rotate(45 50 50)"/>
        <ellipse cx="50" cy="50" rx="30" ry="15" fill="#E8407A" opacity=".8" transform="rotate(90 50 50)"/>
        <ellipse cx="50" cy="50" rx="30" ry="15" fill="#E8407A" opacity=".8" transform="rotate(135 50 50)"/>
        <circle cx="50" cy="50" r="12" fill="#F0C229"/>
        <circle cx="50" cy="50" r="6" fill="#C8001E"/>
      </svg>

      {/* Decorative SVG: lotus bottom left */}
      <svg className="hero-flower-bl" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="65" cy="75" rx="20" ry="35" fill="#F5EDD8" opacity=".9" transform="rotate(-20 65 75)"/>
        <ellipse cx="65" cy="75" rx="20" ry="35" fill="#F5EDD8" opacity=".9" transform="rotate(0 65 75)"/>
        <ellipse cx="65" cy="75" rx="20" ry="35" fill="#F5EDD8" opacity=".9" transform="rotate(20 65 75)"/>
        <ellipse cx="65" cy="75" rx="18" ry="30" fill="#F0C229" opacity=".7" transform="rotate(-10 65 75)"/>
        <ellipse cx="65" cy="75" rx="18" ry="30" fill="#F0C229" opacity=".7" transform="rotate(10 65 75)"/>
        <circle cx="65" cy="65" r="12" fill="#F0C229"/>
        <ellipse cx="30" cy="90" rx="22" ry="10" fill="#2A7A4B" opacity=".6" transform="rotate(-15 30 90)"/>
        <ellipse cx="100" cy="95" rx="22" ry="10" fill="#2A7A4B" opacity=".6" transform="rotate(10 100 95)"/>
      </svg>

      <div className="border-strip-top"></div>

      <div className="windowbar">
        <div className="windowbar-title"></div>
        <div className="wbtns">
          <div className="wbtn" style={{ background: '#E8407A' }}></div>
          <div className="wbtn" style={{ background: '#F0C229' }}></div>
          <div className="wbtn" style={{ background: '#2A7A4B' }}></div>
        </div>
      </div>
      <div className="menubar">
        <span className="menuitem"></span>
        <span className="menuitem"></span>
        <span className="menuitem" style={{ textDecoration: 'underline', textDecorationStyle: 'dotted' }}></span>
        <span className="menuitem"></span>
        <span className="menuitem"></span>
        <span className="menuitem"></span>
      </div>

      <div className="hero-body">
        {/* Annotation cluster top right */}
        <div className="hero-annotation">
          <div className="anno-stamp">
            <div className="anno-stamp-text">OPEN<br />TRIALS<br />AUG '26</div>
          </div>
          <div className="anno-pill">247 BUILDERS SELECTED</div>
          <div className="anno-pill" style={{ background: 'var(--pink)', transform: 'rotate(1.5deg)' }}>★ BUILT IN GOA ★</div>
        </div>

        {/* Diagonal eyebrow */}
        <div className="diagonal-band">
          <div className="diagonal-band-text">// हैकर हाउस में आपका स्वागत है · welcome, builder</div>
        </div>

        {/* Giant poster headline */}
        <div className="poster-sub-hindi">हैकर हाउस</div>
        <div className="poster-headline">
          HACKER<br />
          HOUSE<br />
          <span className="accent-pink">GOA</span><span className="accent-red" style={{ fontSize: '.55em', verticalAlign: 'top', marginTop: '.15em', display: 'inline-block' }}>★</span>
        </div>

        <div className="year-pill">2026 · OCT 28–31</div>

        {/* Inner computer window */}
        <div className="inner-window">
          <div className="inner-window-top">
            <span>NEW FILE — BUILDER_IDENTITY.ART</span>
            <span>hhgoa.com</span>
          </div>
          <div 
            className="upload-area"
            onClick={!isProcessing ? handleClick : undefined}
          >
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/heic,image/heif"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              disabled={isProcessing}
            />

            {isProcessing ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <div className="spinner"></div>
                <p style={{ marginTop: '16px', color: 'var(--fade)', fontFamily: 'Space Mono, monospace', fontSize: '10px' }}>
                  {fileInfo?.name ? `Converting ${fileInfo.name}...` : 'Converting your iPhone photo...'}
                </p>
              </div>
            ) : (
              <>
                <span className="upload-big">APNA FACE<br />DAALO →</span>
                <span className="upload-arrow-big">⇪</span>
                <div className="upload-sub">JPG · PNG · HEIC — ANY CROP WORKS — MOBILE OK</div>
                <div style={{ marginTop: '14px', fontFamily: 'Space Mono, monospace', fontSize: '7px', color: 'var(--fade)', letterSpacing: '.1em' }}>
                  // YOUR PHOTO BECOMES THE ARTWORK. NOT THE CARD.
                </div>
              </>
            )}
          </div>
        </div>

        {/* Illustrated coconut annotation */}
        <div className="hero-note-row">
          <div className="hero-note-text">
            🥥 BEST ENJOYED NEAR THE ARABIAN SEA
          </div>
          <div className="hero-note-divider"></div>
          <div className="hero-note-text">
            BUILT IN GOA · MADE TO SHIP
          </div>
        </div>
      </div>

      <div className="ticker-shell">
        <div className="ticker-outer">
          <span className="ticker-inner">
            🌊 JUGAAD KARO · SHIP KARO · REPEAT 🌴 GOA COMPATIBILITY: 100% 🥥 247 BUILDERS FROM 20,500+ APPLICANTS ★ $50K+ BOUNTIES 🌺 PRIVATE BEACH RESORT 🐚 AI × CRYPTO 🛵 WORKS ON MY MACHINE ⚡ COFFEE: CRITICAL ✦ JUGAAD KARO · SHIP KARO · REPEAT 🌊 GOA COMPATIBILITY: 100% 🌴 247 BUILDERS ★ $50K+ BOUNTIES 🥥 PRIVATE BEACH RESORT 🛵 AI × CRYPTO 🌺 WORKS ON MY MACHINE ⚡
          </span>
        </div>

        <div className="hero-info-row">
          <span className="info-chip">// BUILDER DETECTED</span>
          <span className="info-chip"><strong>28–31 OCTOBER · GOA, INDIA</strong></span>
          <span className="info-chip">hhgoa.com</span>
        </div>

        {/* Corner ornaments */}
        <div className="corner-orn tl"></div>
        <div className="corner-orn tr"></div>
        <div className="corner-orn bl"></div>
        <div className="corner-orn br"></div>

        <div className="border-strip-bottom"></div>
      </div>

      {/* Error state */}
      {error && (
        <div style={{ background: 'rgba(200,0,30,.15)', border: '1px solid var(--red)', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--red)', fontSize: '14px', textAlign: 'center', marginTop: '12px' }}>
          <span>{error}</span>
          <button 
            onClick={handleDismissError}
            style={{ background: 'transparent', border: '1px solid var(--red)', color: 'var(--red)', padding: '4px 12px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Space Mono, monospace' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* File size warning */}
      {fileSizeWarning && !error && (
        <div style={{ background: 'rgba(240,194,41,.15)', border: '1px solid rgba(240,194,41,.3)', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--yellow)', fontSize: '13px', textAlign: 'center', marginTop: '12px' }}>
          <span>📦 Large file detected — conversion may take a few seconds</span>
        </div>
      )}

      {/* Browser compatibility notice for HEIC */}
      {!isWasmSupported() && (
        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <small style={{ color: 'var(--fade)', fontSize: '11px' }}>
            Note: Your browser doesn't support HEIC conversion. Please upload JPG or PNG.
          </small>
        </div>
      )}
    </div>
  );
};

/* Spinner animation */
const spinnerStyle = document.createElement('style');
spinnerStyle.textContent = `
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--fade);
    border-top-color: var(--yellow);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(spinnerStyle);

export default Uploader;
