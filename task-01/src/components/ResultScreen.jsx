import React from 'react';

export const ResultScreen = ({ badgeData, onReset }) => {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
      <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '24px', marginBottom: '16px' }}>Your Builder Card! 🎉</h2>
      
      <div style={{ width: '100%', maxWidth: '300px', height: '375px', background: 'var(--surface-raised)', border: '2px solid var(--accent-primary)', borderRadius: '16px', margin: '0 auto 24px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 0 20px rgba(123, 92, 240, 0.3)' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent-glow)', fontWeight: 'bold', letterSpacing: '1px' }}>HH GOA 2026 // BUILDER PASS</div>
        <div style={{ fontSize: '24px', fontFamily: 'Space Grotesk', fontWeight: 'bold', margin: '20px 0' }}>{badgeData?.name || 'NAME PLACEHOLDER'}</div>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{badgeData?.role || 'ROLE PLACEHOLDER'}</div>
        <div style={{ borderTop: '1px dashed var(--border-subtle)', paddingTop: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>goa.hackathon.com</div>
      </div>

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        <button className="btn-secondary" onClick={onReset}>
          Make Another
        </button>
        <button className="btn-primary" onClick={() => alert('Download coming in Phase 5!')}>
          Save Card 💾
        </button>
      </div>
    </div>
  );
};
