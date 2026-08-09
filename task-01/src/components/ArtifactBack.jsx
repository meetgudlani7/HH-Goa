import React from 'react';
import CardBack from './CardBack';

export const ArtifactBack = ({ setStep, formData, serial }) => (
  <div style={{ background: '#0e0a06', padding: '28px 16px' }}>
    <div className="screen-label">05 · YOUR BUILDER ARTIFACT · BACK</div>
    <div className="card-display-wrapper">
      <CardBack formData={formData} serial={serial} />
    </div>
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
        onClick={() => setStep('artifact-front')}
      >
        ← FLIP BACK
      </button>
      <button className="act-btn primary" onClick={() => setStep('result')}>
        DOWNLOAD / SHARE →
      </button>
    </div>
  </div>
);

export default ArtifactBack;
