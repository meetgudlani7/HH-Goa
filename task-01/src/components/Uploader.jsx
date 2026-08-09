import React from 'react';

export const Uploader = ({ onNext }) => {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', border: '2px dashed var(--border-subtle)', borderRadius: '16px', background: 'var(--bg-card)' }}>
      <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '24px', marginBottom: '16px' }}>Upload your Photo</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>PNG, JPG, or HEIC format</p>
      <button className="btn-primary" onClick={() => onNext({ mockPhoto: 'photo_url_here' })}>
        Select File (Mock Upload)
      </button>
    </div>
  );
};
