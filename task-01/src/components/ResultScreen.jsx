import React, { useCallback, useEffect, useRef, useState } from 'react';
import canvasConfetti from 'canvas-confetti';
import CardFront from './CardFront';
import CardBack from './CardBack';
import { useCardRenderer } from '../hooks/useCardRenderer';

export const ResultScreen = ({ setStep, formData, croppedImageURL, serial, onReset }) => {
  const cardRef = useRef(null);
  const backCardRef = useRef(null);
  const { renderCombined } = useCardRenderer();
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState(null);
  // Twitter/X's web intent can't attach an image or show a link-preview
  // graphic — that only works via the native OS share sheet. When we fall
  // back to the web intent (no Web Share API support), tell the user their
  // PNG downloaded separately and needs to be attached by hand.
  const [showManualAttachHint, setShowManualAttachHint] = useState(false);
  const builderName = (formData?.name || 'builder').toLowerCase().replace(/\s+/g, '-');
  const nameParts = (formData?.name || '').trim().split(/\s+/).filter(Boolean);
  const displayFirstName = nameParts[0] || 'BUILDER';
  const displayLastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

  useEffect(() => {
    setIsRevealed(true);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      canvasConfetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C8001E', '#F0C229', '#2A7A4B', '#E8407A'],
      });
  }, []);

  const getCombinedCardBlob = useCallback(
    () => renderCombined(cardRef, backCardRef),
    [renderCombined]
  );

  const download = useCallback(async () => {
    setIsDownloading(true);
    setError(null);
    let blobUrl;
    try {
      const blob = await getCombinedCardBlob();
      blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `hh-goa-2026-${builderName}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (downloadError) {
      console.error(downloadError);
      setError('Could not save your card. Please try again.');
    } finally {
      setIsDownloading(false);
      // Give the browser a moment to actually start the save before we free the URL.
      if (blobUrl) setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    }
  }, [builderName, getCombinedCardBlob]);

  const share = useCallback(async () => {
    setIsSharing(true);
    setError(null);
    setShowManualAttachHint(false);

    const text =
      'Just got my Builder Artifact from Hacker House Goa 2026.\nShipping at a private beach resort in October.\nFind me there. 🌴🛵\n\n#FrameInGoa #HackerHouseGoa @247pmstudio';
    const supportsNativeShare = typeof navigator.share === 'function';
    // Open the fallback tab synchronously, in direct response to the click —
    // by the time the card finishes rendering below we're several `await`s
    // removed from the user gesture, and Safari/most browsers will silently
    // block a window.open() that happens that late.
    const shareWindow = supportsNativeShare ? null : window.open('', '_blank');

    let blobUrl;
    try {
      const blob = await getCombinedCardBlob();
      const fileName = `hh-goa-2026-${builderName}.png`;

      if (supportsNativeShare) {
        const file = new File([blob], fileName, { type: 'image/png' });
        if (!navigator.canShare || navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text });
          return;
        }
      }

      // Fallback: download the PNG, then hand the pre-opened tab off to the X intent.
      blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      if (shareWindow) shareWindow.location.href = tweetUrl;
      else window.open(tweetUrl, '_blank', 'noopener,noreferrer');
      setShowManualAttachHint(true);
    } catch (shareError) {
      shareWindow?.close();
      // AbortError just means the user closed the native share sheet — not a failure.
      if (shareError?.name !== 'AbortError') {
        console.error(shareError);
        setError('Unable to share right now. Try saving and sharing manually.');
      }
    } finally {
      setIsSharing(false);
      if (blobUrl) setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    }
  }, [builderName, getCombinedCardBlob]);

  return (
    <div className="result-screen">
      <div className="result-poster-bg">
        SHIP
        <br />
        SHIP
      </div>

      {/* Decorative SVG: hibiscus top right (same motif as the hero screen) */}
      <svg
        className="result-flower-tr"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <ellipse
          cx="50"
          cy="50"
          rx="30"
          ry="15"
          fill="#F5EDD8"
          opacity=".8"
          transform="rotate(0 50 50)"
        />
        <ellipse
          cx="50"
          cy="50"
          rx="30"
          ry="15"
          fill="#F5EDD8"
          opacity=".8"
          transform="rotate(45 50 50)"
        />
        <ellipse
          cx="50"
          cy="50"
          rx="30"
          ry="15"
          fill="#F5EDD8"
          opacity=".8"
          transform="rotate(90 50 50)"
        />
        <ellipse
          cx="50"
          cy="50"
          rx="30"
          ry="15"
          fill="#F5EDD8"
          opacity=".8"
          transform="rotate(135 50 50)"
        />
        <circle cx="50" cy="50" r="12" fill="#F0C229" />
        <circle cx="50" cy="50" r="6" fill="#1A1008" />
      </svg>

      {/* Decorative SVG: palm tree bottom left (same motif as the hero screen) */}
      <svg
        className="result-palm-deco"
        viewBox="0 0 140 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M70 160 C68 120 66 90 72 60"
          stroke="#F5EDD8"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <ellipse
          cx="72"
          cy="55"
          rx="34"
          ry="12"
          fill="#1A1008"
          opacity=".55"
          transform="rotate(-25 72 55)"
        />
        <ellipse
          cx="72"
          cy="55"
          rx="34"
          ry="12"
          fill="#1A1008"
          opacity=".55"
          transform="rotate(10 72 55)"
        />
        <ellipse
          cx="72"
          cy="55"
          rx="34"
          ry="12"
          fill="#1A1008"
          opacity=".55"
          transform="rotate(45 72 55)"
        />
        <ellipse
          cx="72"
          cy="55"
          rx="30"
          ry="10"
          fill="#F0C229"
          opacity=".7"
          transform="rotate(-55 72 55)"
        />
        <ellipse
          cx="72"
          cy="55"
          rx="30"
          ry="10"
          fill="#F0C229"
          opacity=".7"
          transform="rotate(75 72 55)"
        />
        <circle cx="64" cy="66" r="6" fill="#F5EDD8" opacity=".8" />
        <circle cx="76" cy="70" r="6" fill="#F5EDD8" opacity=".8" />
      </svg>

      <div className="border-strip-top" />
      <div className="windowbar">
        <div className="windowbar-title">
          ⬛ ARTIFACT GENERATED · {builderName.toUpperCase().replace(/-/g, '_')}.ART
        </div>
        <div className="wbtns">
          <div className="wbtn" style={{ background: '#2A7A4B' }} />
          <div className="wbtn" style={{ background: '#F0C229' }} />
          <div className="wbtn" style={{ background: '#2A7A4B' }} />
        </div>
      </div>
      <div className="result-top">
        <div>
          <div className="result-big">
            IDENTITY
            <br />
            GENERATED.
          </div>
          <div className="result-sub">
            // WELCOME TO THE HOUSE, BUILDER.
            <br />
            SHIP KARO. NOW.
          </div>
        </div>
        <div className="result-check">✓</div>
      </div>
      <div className="result-body">
        <div className={`result-mini-card ${isRevealed ? 'revealed' : ''}`}>
          <div className="rmc-left" />
          <div className="rmc-body">
            <div className="rmc-name">
              {displayFirstName.toUpperCase()}
              {displayLastName && (
                <>
                  <br />
                  {displayLastName.toUpperCase()}
                </>
              )}
            </div>
            <div className="rmc-title">{formData?.builderTitle || 'THE BUILDER'}</div>
            <div className="rmc-badge">★ GOA COMPATIBILITY: 100% ★</div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '12px 10px',
              alignItems: 'flex-end',
            }}
          >
            <div
              style={{
                fontFamily: 'Space Mono',
                fontSize: '7px',
                color: 'var(--fade)',
                letterSpacing: '.1em',
                textAlign: 'right',
              }}
            >
              HH GOA
              <br />
              2026
            </div>
            <div style={{ fontFamily: 'serif', fontSize: '24px', color: 'var(--fade)' }}>गोवा</div>
          </div>
        </div>
        <div className="actions-grid">
          <button className="act-btn primary" onClick={download} disabled={isDownloading}>
            {isDownloading ? 'SAVING...' : '⬇ DOWNLOAD ARTIFACT (FRONT + BACK)'}
          </button>
          <button className="act-btn x" onClick={share} disabled={isSharing}>
            {isSharing ? 'SHARING...' : 'POST TO X → #FrameInGoa'}
          </button>
          <button
            className="act-btn"
            style={{ background: 'var(--blue)', color: 'var(--cream)' }}
            onClick={() => setStep('pfp')}
          >
            → SEE YOUR PFP VERSION
          </button>
          <button
            className="act-btn ghost"
            onClick={() => setStep('artifact-back')}
            disabled={isDownloading || isSharing}
          >
            ← BACK TO ARTIFACT
          </button>
          <button className="act-btn ghost" onClick={onReset} disabled={isDownloading || isSharing}>
            ↻ MAKE ANOTHER / REGEN TITLE
          </button>
        </div>
        {showManualAttachHint && (
          <div className="share-hint">
            📎 Your artifact PNG downloaded separately — attach it to the X tab that just opened
            before you post (X doesn&apos;t support pre-attaching images via link).
          </div>
        )}
        <div className="caption-box">
          <div className="caption-label">// PRE-FILLED CAPTION:</div>
          <div className="caption-text">
            Just got my Builder Artifact from Hacker House Goa 2026.
            <br />
            Shipping at a private beach resort in October.
            <br />
            Find me there. 🌴🛵
            <br />
            <br />
            #FrameInGoa #HackerHouseGoa @247pmstudio
          </div>
        </div>
        {error && (
          <div
            style={{
              background: 'rgba(200,0,30,.15)',
              border: '1px solid var(--red)',
              padding: '12px',
              color: 'var(--red)',
              textAlign: 'center',
              marginTop: '12px',
            }}
          >
            {error}
          </div>
        )}
      </div>
      <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', pointerEvents: 'none' }}>
        <CardFront
          formData={formData}
          croppedImageURL={croppedImageURL}
          serial={serial}
          cardRef={cardRef}
        />
        <CardBack formData={formData} serial={serial} cardRef={backCardRef} />
      </div>
      <div className="border-strip-bottom" />
    </div>
  );
};

export default ResultScreen;
