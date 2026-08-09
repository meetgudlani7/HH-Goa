import React, { useState } from 'react';

export const FormFields = ({ onNext, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    city: '',
    xHandle: '',
    builderTitle: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <div style={{ padding: '40px 20px', borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
      <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '24px', marginBottom: '16px', textAlign: 'center' }}>Builder Info</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', textAlign: 'center' }}>Let's fill out your badge details</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Name *</label>
          <input 
            type="text" 
            placeholder="Arjun Mehta" 
            required 
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--surface-raised)', color: 'var(--text-primary)' }}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Role / Stack *</label>
          <input 
            type="text" 
            placeholder="Full-stack / React, Go" 
            required 
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--surface-raised)', color: 'var(--text-primary)' }}
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          />
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
          <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onBack}>
            Back
          </button>
          <button type="submit" className="btn-primary" style={{ flex: 1 }}>
            Generate My Card
          </button>
        </div>
      </form>
    </div>
  );
};
