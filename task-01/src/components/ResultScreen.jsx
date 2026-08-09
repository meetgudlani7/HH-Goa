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
  const builderName = (formData?.name || 'builder').toLowerCase().replace(/\s+/g, '-');

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

  const getCombinedCardURL = useCallback(
    () => renderCombined(cardRef, backCardRef),
    [renderCombined]
  );

  const download = useCallback(async () => {
    setIsDownloading(true);
    setError(null);
    try {
      const url = await getCombinedCardURL();
      const link = document.createElement('a');
      link.href = url;
      link.download = `hh-goa-2026-${builderName}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (downloadError) {
      console.error(downloadError);
      setError('Could not save your card. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, [builderName, getCombinedCardURL]);

  const share = useCallback(async () => {
    setIsSharing(true);
    setError(null);
    try {
      const url = await getCombinedCardURL();
      const link = document.createElement('a');
      link.href = url;
      link.download = `hh-goa-2026-${builderName}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      const text =
        'Just got my Builder Artifact from Hacker House Goa 2026.\nShipping at a private beach resort in October.\nFind me there. 🌴🛵\n\n#FrameInGoa #HackerHouseGoa @247pmstudio';
      setTimeout(
        () =>
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
            '_blank',
            'noopener,noreferrer'
          ),
        300
      );
    } catch (shareError) {
      console.error(shareError);
      setError('Unable to share right now. Try saving and sharing manually.');
    } finally {
      setIsSharing(false);
    }
  }, [builderName, getCombinedCardURL]);

  return (
    <div className="result-screen">
      <div className="result-poster-bg">
        SHIP
        <br />
        SHIP
      </div>
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
              {(formData?.name || 'BUILDER').toUpperCase().split(' ')[0]}
              <br />
              {(formData?.name || '').toUpperCase().split(' ').slice(1).join(' ')}
            </div>
            <div className="rmc-title">{formData?.builderTitle || 'THE BUILDER'}</div>
            <div className="rmc-stack">{formData?.stack || 'REACT / TS / AI'}</div>
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
