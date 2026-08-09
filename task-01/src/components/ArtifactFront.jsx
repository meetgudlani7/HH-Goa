import React, { useEffect, useRef, useState } from 'react';
import CardFront from './CardFront';
import { useCardRenderer } from '../hooks/useCardRenderer';

export const ArtifactFront = ({ setStep, formData, croppedImageURL, serial, onCardReady }) => {
  const cardRef = useRef(null);
  const { renderFront } = useCardRenderer();
  const [rendering, setRendering] = useState(true);

  useEffect(() => {
    let active = true;
    const capture = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 150));
        const dataURL = await renderFront(cardRef);
        if (active) onCardReady(dataURL);
      } catch (error) {
        console.error('Card render failed:', error);
      } finally {
        if (active) setRendering(false);
      }
    };
    capture();
    return () => {
      active = false;
    };
  }, [onCardReady, renderFront]);

  return (
    <div style={{ background: '#0e0a06', padding: '28px 16px' }}>
      <div className="screen-label">04 · YOUR BUILDER ARTIFACT · FRONT</div>
      <div className="card-display-wrapper">
        <CardFront
          formData={formData}
          croppedImageURL={croppedImageURL}
          serial={serial}
          cardRef={cardRef}
        />
      </div>
      {rendering && (
        <div
          style={{
            textAlign: 'center',
            marginTop: '12px',
            fontFamily: 'Space Mono',
            fontSize: '8px',
            color: '#888',
            letterSpacing: '.15em',
          }}
        >
          // GENERATING HIGH-RES PNG…
        </div>
      )}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginTop: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <button
          className="act-btn ghost"
          style={{ color: 'var(--cream)', borderColor: 'var(--cream)' }}
          onClick={() => setStep('form')}
        >
          ← BACK
        </button>
        <button className="act-btn primary" onClick={() => setStep('artifact-back')}>
          FLIP → SEE BACK
        </button>
        <button
          className="act-btn ghost"
          style={{ color: 'var(--cream)', borderColor: 'var(--cream)' }}
          onClick={() => setStep('result')}
        >
          SKIP TO DOWNLOAD
        </button>
      </div>
    </div>
  );
};

export default ArtifactFront;
