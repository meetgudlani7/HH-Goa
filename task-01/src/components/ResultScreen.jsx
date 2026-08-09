import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useCardRenderer } from '../hooks/useCardRenderer';
import canvasConfetti from 'canvas-confetti';

/**
 * ResultScreen Component - Phase 4 & 5 Implementation
 * 
 * Features:
 * - Displays the generated ID card
 * - Renders card using HTML5 Canvas (useCardRenderer)
 * - Reveal animation (slide up + fade in)
 * - Confetti burst on card reveal
 * - Download PNG button
 * - Make Another button
 */
export const ResultScreen = ({ croppedPhotoData, badgeData, onReset }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [cardImageUrl, setCardImageUrl] = useState(null);
  const [error, setError] = useState(null);
  
  const cardContainerRef = useRef(null);
  
  const { renderCard, isRendering } = useCardRenderer();

  /**
   * Render the card on component mount
   */
  useEffect(() => {
    const render = async () => {
      if (!croppedPhotoData || !badgeData) return;
      
      try {
        const canvas = await renderCard(
          {
            name: badgeData.name,
            role: badgeData.role,
            city: badgeData.city,
            xHandle: badgeData.xHandle,
            builderTitle: badgeData.builderTitle,
          },
          croppedPhotoData.objectURL
        );
        
        const dataUrl = canvas.toDataURL('image/png');
        setCardImageUrl(dataUrl);
        
        // Trigger reveal animation
        setTimeout(() => {
          setIsRevealed(true);
          fireConfetti();
        }, 100);
        
      } catch (err) {
        console.error('Failed to render card:', err);
        setError('Failed to generate your card. Please try again.');
      }
    };
    
    render();
  }, [croppedPhotoData, badgeData, renderCard]);

  /**
   * Fire confetti animation
   */
  const fireConfetti = useCallback(() => {
    // Check if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return; // Skip confetti for accessibility
    }
    
    try {
      canvasConfetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7B5CF0', '#A78BFA', '#F97316', '#FAFAFA'],
        scalar: 1.2,
      });
    } catch (err) {
      console.warn('Confetti failed to fire:', err);
    }
  }, []);

  /**
   * Handle download
   */
  const handleDownload = useCallback(() => {
    if (!cardImageUrl) return;
    
    setIsDownloading(true);
    
    try {
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = cardImageUrl;
      link.download = `hh-goa-2026-${badgeData?.name?.toLowerCase().replace(/\s+/g, '-') || 'builder'}-card.png`;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // For iOS, also show a message about long-press
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        setTimeout(() => {
          alert('If the download did not start, long-press the card image and select "Save Image"');
        }, 500);
      }
    } catch (err) {
      console.error('Download failed:', err);
      setError('Failed to download. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, [cardImageUrl, badgeData]);

  /**
   * Handle make another
   */
  const handleMakeAnother = useCallback(() => {
    setCardImageUrl(null);
    setIsRevealed(false);
    onReset();
  }, [onReset]);

  /**
   * Dismiss error
   */
  const handleDismissError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <div className="result-container">
      {/* Error state */}
      {error && (
        <div className="result-error" role="alert">
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
      <div className="result-header">
        <h2 className="result-title">Your Builder Card! 🎉</h2>
        <p className="result-subtitle">Ready to share with the world</p>
      </div>

      {/* Card container with reveal animation */}
      <div 
        className={`result-card-container ${isRevealed ? 'revealed' : ''}`}
        ref={cardContainerRef}
      >
        {cardImageUrl && (
          <div className="result-card-wrapper">
            <img 
              src={cardImageUrl} 
              alt="Your HH Goa 2026 Builder Card"
              className="result-card-image"
              // For iOS long-press save
              onContextMenu={(e) => {
                if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
                  e.preventDefault();
                  alert('Long-press and select "Save Image" to save to your camera roll');
                }
              }}
            />
          </div>
        )}
        
        {/* Loading state */}
        {isRendering && !cardImageUrl && (
          <div className="result-loading">
            <div className="spinner"></div>
            <p>Generating your card...</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="result-actions">
        <button 
          className="btn-secondary"
          onClick={handleMakeAnother}
          disabled={isDownloading}
        >
          Make Another
        </button>
        
        <button 
          className="btn-primary"
          onClick={handleDownload}
          disabled={!cardImageUrl || isDownloading}
        >
          {isDownloading ? 'Downloading...' : 'Save Card 💾'}
        </button>
      </div>

      {/* Card info */}
      <div className="result-info">
        <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
          Card size: 1080 × 1350px (4:5 ratio)
        </p>
      </div>
    </div>
  );
};

export default ResultScreen;
