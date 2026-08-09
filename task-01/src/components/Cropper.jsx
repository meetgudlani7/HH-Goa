import React from 'react';

export const Cropper = ({ photoData, onNext, onBack }) => {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
      <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '24px', marginBottom: '16px' }}>Crop & Frame</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Adjust your portrait photo</p>
      
      <div style={{ width: '100%', height: '200px', background: 'var(--surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', borderRadius: '8px', color: 'var(--text-muted)' }}>
        [ Crop Preview Area Placeholder ]
      </div>

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        <button className="btn-secondary" onClick={onBack}>
          Back
        </button>
        <button className="btn-primary" onClick={() => onNext({ mockCroppedPhoto: 'cropped_photo_url_here' })}>
          Looks Good →
        </button>
      </div>
    </div>
  );
};
