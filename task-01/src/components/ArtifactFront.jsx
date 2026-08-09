import React from 'react';

export const ArtifactFront = ({ setStep, cardDataURL }) => {
  return (
    <div style={{ background: '#111', padding: '20px 12px' }}>
      <div className="screen-label">YOUR BUILDER ARTIFACT</div>
      
      {cardDataURL ? (
        <img
          src={cardDataURL}
          alt="Your HH Goa Builder Artifact"
          style={{ 
            width: '100%', 
            maxWidth: '540px', 
            display: 'block', 
            margin: '0 auto',
            border: '4px solid var(--ink)', 
            boxShadow: '8px 8px 0 var(--ink)' 
          }}
        />
      ) : (
        <div style={{ 
          width: '100%', 
          aspectRatio: '9/16', 
          background: 'var(--cream)', 
          border: '4px solid var(--ink)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'var(--ink)',
          fontFamily: 'Space Mono, monospace'
        }}>
          Rendering your artifact...
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'center' }}>
        <button 
          className="act-btn primary" 
          onClick={() => setStep('artifact-back')}
        >
          FLIP → SEE BACK
        </button>
        <button 
          className="act-btn ghost" 
          onClick={() => setStep('result')}
        >
          SKIP TO DOWNLOAD
        </button>
      </div>
    </div>
  );
};

export default ArtifactFront;
