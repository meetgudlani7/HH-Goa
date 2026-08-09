import React, { useState, useRef, useCallback } from 'react';
import { useImageProcessor } from '../hooks/useImageProcessor';

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
export const Uploader = ({ onNext }) => {
  const fileInputRef = useRef(null);
  const dragDropRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const [fileSizeWarning, setFileSizeWarning] = useState(false);
  
  const {
    processImage,
    isProcessing,
    error,
    setError,
    isWasmSupported,
  } = useImageProcessor();

  /**
   * Handle file selection from input
   */
  const handleFileSelect = useCallback(async (event) => {
    console.log('Uploader: handleFileSelect called');
    const file = event.target.files?.[0];
    console.log('Uploader: file selected:', file?.name, file?.type, file?.size);
    if (!file) {
      console.log('Uploader: no file, returning');
      return;
    }

    // Clear drag state
    setIsDragging(false);

    // Show file info
    setFileInfo({ name: file.name, size: formatFileSize(file.size) });

    // Check for large file warning (> 20MB)
    const MAX_SIZE_WARN = 20 * 1024 * 1024;
    const MAX_SIZE_ERROR = 40 * 1024 * 1024; // 40MB - ProRAW territory
    
    if (file.size > MAX_SIZE_ERROR) {
      setError('File is too large (over 40MB). Please use a compressed photo.');
      return;
    }
    
    if (file.size > MAX_SIZE_WARN) {
      setFileSizeWarning(true);
    } else {
      setFileSizeWarning(false);
    }

    try {
      const processedData = await processImage(file);
      
      // If successful, pass data to parent and move to next step
      onNext({
        blob: processedData.blob,
        objectURL: processedData.objectURL,
        fileName: processedData.fileName,
        fileSize: processedData.fileSize,
        isHeic: processedData.isHeic,
      });
      
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFileInfo(null);
    } catch (err) {
      // Error is already set in the hook
      setFileInfo(null);
    }
  }, [processImage, onNext, setError]);

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
    // Required for drop to work
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      setError('Please drop an image file (JPG, PNG, or HEIC)');
      return;
    }

    // Create a synthetic event for the file input handler
    const syntheticEvent = {
      target: {
        files: [file],
      },
    };
    
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
  }, [setError]);

  /**
   * Check WASM support on component mount
   */
  React.useEffect(() => {
    if (!isWasmSupported()) {
      console.warn('WebAssembly not supported - HEIC conversion will not work');
    }
  }, [isWasmSupported]);

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
    <div 
      className="uploader-container"
      ref={dragDropRef}
    >
      {/* Error state */}
      {error && (
        <div className="uploader-error" role="alert">
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

      {/* File size warning */}
      {fileSizeWarning && !error && (
        <div className="uploader-warning" role="alert">
          <span>📦 Large file detected — conversion may take a few seconds</span>
        </div>
      )}

      {/* Main upload area */}
      <div 
        className={`uploader-dropzone ${isDragging ? 'dragging' : ''} ${isProcessing ? 'processing' : ''}`}
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

        {/* Content */}
        <div className="uploader-content">
          {!isProcessing ? (
            <>
              <div className="uploader-icon" role="img" aria-label="Upload photo">
                📷
              </div>
              
              {fileInfo ? (
                <div className="uploader-file-info">
                  <strong>Selected: {fileInfo.name}</strong>
                  <span>({fileInfo.size})</span>
                  <p style={{ marginTop: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    {isProcessing ? 'Converting your iPhone photo...' : 'Ready to upload'}
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="uploader-title">Upload your Photo</h2>
                  <p className="uploader-subtitle">
                    PNG, JPG, or HEIC format
                  </p>
                  <p className="uploader-hint">
                    Drag & drop or tap to select
                  </p>
                </>
              )}

              <button 
                className="btn-primary uploader-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
                disabled={isProcessing}
              >
                {fileInfo ? 'Continue' : 'Select File'}
              </button>
            </>
          ) : (
            <div className="uploader-loading">
              <div className="spinner"></div>
              <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
                {fileInfo?.name ? `Converting ${fileInfo.name}...` : 'Processing...'}
              </p>
            </div>
          )}
        </div>

        {/* Browser compatibility notice for HEIC */}
        {!isWasmSupported() && (
          <div className="uploader-compat-notice">
            <small style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
              Note: Your browser doesn't support HEIC conversion. Please upload JPG or PNG.
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default Uploader;
