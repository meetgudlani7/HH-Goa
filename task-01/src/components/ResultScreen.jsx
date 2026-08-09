import React, { useState, useCallback, useRef, useEffect } from 'react';
import canvasConfetti from 'canvas-confetti';

/**
 * ResultScreen Component - Screen 6 Implementation
 * Matches hh_goa_v2_upgraded.html Screen 6 exactly
 * 
 * Features:
 * - Displays the generated card
 * - Reveal animation
 * - Confetti burst
 * - Download PNG button
 * - Share to X button
 * - Make Another button
 */
export const ResultScreen = ({ setStep, formData, getDataURL, croppedImageURL, onReset }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [cardImageUrl, setCardImageUrl] = useState(null);
  const [error, setError] = useState(null);
  
  const cardContainerRef = useRef(null);

  /**
   * Load card image from getDataURL on mount
   */
  useEffect(() => {
    const loadCard = async () => {
      try {
        const url = await getDataURL();
        setCardImageUrl(url);
        
        // Trigger reveal animation
        setTimeout(() => {
          setIsRevealed(true);
          fireConfetti();
        }, 100);
        
      } catch (err) {
        console.error('Failed to load card:', err);
        setError('Failed to load your card. Please try again.');
      }
    };
    
    if (getDataURL) {
      loadCard();
    }
  }, [getDataURL]);

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
   * Download the card image
   */
  const handleDownload = useCallback(async () => {
    if (!cardImageUrl) {
      setError('Card not ready yet');
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      const link = document.createElement('a');
      link.href = cardImageUrl;
      link.download = `hh-goa-2026-${formData?.name?.toLowerCase().replace(/\s+/g, '-') || 'builder'}-artifact.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        setTimeout(() => {
          alert('If the download did not start, long-press the card image and select "Save Image"');
        }, 500);
      }
    } catch (err) {
      console.error('Download failed:', err);
      setError('Could not save your card. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, [cardImageUrl, formData]);

  /**
   * Handle share to X
   */
  const handleShare = useCallback(async () => {
    if (!cardImageUrl) return;

    setIsSharing(true);
    setError(null);

    try {
      const shareText = `Just got my Builder Artifact from Hacker House Goa 2026.\nShipping at a private beach resort in October.\nFind me there. 🌴🛵\n\n#FrameInGoa #HackerHouseGoa @247pmstudio`;
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

      // First trigger download
      const link = document.createElement('a');
      link.href = cardImageUrl;
      link.download = `hh-goa-2026-${formData?.name?.toLowerCase().replace(/\s+/g, '-') || 'builder'}-artifact.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Then open X intent after a small delay
      setTimeout(() => {
        window.open(tweetUrl, '_blank', 'noopener,noreferrer');
      }, 300);
    } catch (err) {
      console.error('Share failed:', err);
      setError('Unable to share right now. Try saving and sharing manually.');
    } finally {
      setIsSharing(false);
    }
  }, [cardImageUrl, formData]);

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
    <div className="result-screen">
      <div className="result-poster-bg">SHIP<br />SHIP</div>
      <div className="border-strip-top"></div>
      <div className="windowbar">
        <div className="windowbar-title">⬛ ARTIFACT GENERATED · {formData?.name?.toUpperCase().replace(/\s+/g, '_') || 'BUILDER'}.ART</div>
        <div className="wbtns">
          <div className="wbtn" style={{ background: '#2A7A4B' }}></div>
          <div className="wbtn" style={{ background: '#F0C229' }}></div>
          <div className="wbtn" style={{ background: '#2A7A4B' }}></div>
        </div>
      </div>

      <div className="result-top">
        <div>
          <div className="result-big">IDENTITY<br />GENERATED.</div>
          <div className="result-sub">// WELCOME TO THE HOUSE, BUILDER.<br />SHIP KARO. NOW.</div>
        </div>
        <div className="result-check">✓</div>
      </div>

      <div className="result-body">
        {/* Mini card preview */}
        <div className="result-mini-card">
          <div className="rmc-left"></div>
          <div className="rmc-body">
            <div className="rmc-name">{formData?.name?.toUpperCase().split(' ')[0] || 'BUILDER'}<br />{formData?.name?.toUpperCase().split(' ')[1] || ''}</div>
            <div className="rmc-title">{formData?.builderTitle || 'THE BUILDER'}</div>
            <div className="rmc-stack">{formData?.stack || 'REACT / TS / AI'}</div>
            <div className="rmc-badge">★ GOA COMPATIBILITY: 100% ★</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '12px 10px', alignItems: 'flex-end' }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '7px', color: 'var(--fade)', letterSpacing: '.1em', textAlign: 'right' }}>HH GOA<br />2026</div>
            <div style={{ fontFamily: 'serif', fontSize: '24px', color: 'var(--fade)' }}>गोवा</div>
          </div>
        </div>

        {/* Actions */}
        <div className="actions-grid">
          <button className="act-btn primary" onClick={handleDownload} disabled={!cardImageUrl || isDownloading}>
            {isDownloading ? 'SAVING...' : '⬇ DOWNLOAD ARTIFACT'}
          </button>
          <button className="act-btn x" onClick={handleShare} disabled={!cardImageUrl || isSharing}>
            {isSharing ? 'SHARING...' : 'POST TO X → #FrameInGoa'}
          </button>
          <button className="act-btn ghost" onClick={handleMakeAnother} disabled={isDownloading || isSharing}>
            ↻ MAKE ANOTHER / REGEN TITLE
          </button>
          <button 
            className="act-btn " 
            style={{ background: 'var(--blue)', color: 'var(--cream)' }}
            onClick={() => setStep('pfp')}
          >
            → SEE YOUR PFP VERSION
          </button>
        </div>

        {/* Pre-filled caption */}
        <div className="caption-box">
          <div className="caption-label">// PRE-FILLED CAPTION:</div>
          <div className="caption-text">
            Just got my Builder Artifact from Hacker House Goa 2026.<br />
            Shipping at a private beach resort in October.<br />
            Find me there. 🌴🛵<br />
            <br />
            #FrameInGoa #HackerHouseGoa @247pmstudio
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '4px', alignItems: 'center' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--fade)', opacity: '.3' }}></div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '7px', color: 'var(--fade)', letterSpacing: '.1em', padding: '0 8px' }}>
            BUILT IN GOA · MADE TO SHIP · hhgoa.com
          </div>
          <div style={{ flex: 1, height: '1px', background: 'var(--fade)', opacity: '.3' }}></div>
        </div>
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

      <div className="border-strip-bottom"></div>
    </div>
  );
};

export default ResultScreen;
