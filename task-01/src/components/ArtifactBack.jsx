import React, { useState } from 'react';

export const ArtifactBack = ({ setStep, formData }) => {
  const [batchNum] = useState(Math.floor(Math.random() * 900) + 100);

  // Parse stack from formData
  const getStackItems = () => {
    if (!formData?.stack) return [];
    return formData.stack.split(/[\/,]|\s+and\s+/i)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  };

  const stackItems = getStackItems();

  return (
    <div style={{ maxWidth: '540px', margin: '0 auto' }}>
      <div className="screen-label">BUILDER ARTIFACT — BACK</div>
      <div className="card-back">
        <div className="art-top-band"></div>
        <div className="back-header">
          <div>
            <div className="back-header-brand">PRODUCT<br />INFORMATION</div>
            <div className="back-header-batch" style={{ marginTop: '4px' }}>
              CERTIFIED BUILDER · HACKER HOUSE GOA 2026
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '7px', color: 'rgba(240,194,41,.7)', letterSpacing: '.1em' }}>
              BATCH NO.
            </div>
            <div style={{ fontFamily: 'Abril Fatface, serif', fontSize: '22px', color: 'var(--yellow)' }}>
              GOA-2026-{batchNum}
            </div>
          </div>
        </div>

        <div className="back-body">
          <div className="back-pattern-row">
            <div className="bp-diamond"></div><div className="bp-circle"></div>
            <div className="bp-diamond"></div><div className="bp-circle"></div>
            <div className="bp-diamond"></div><div className="bp-circle"></div>
            <div className="bp-diamond"></div>
          </div>

          <div className="back-section-title">INGREDIENTS (PER BUILDER)</div>
          <table className="ing-table">
            {stackItems.length > 0 && (
              <tr>
                <td>{stackItems.join(' + ')}</td>
                <td><div style={{ height: '4px', background: 'rgba(0,0,0,.1)' }}></div></td>
                <td>40%</td>
              </tr>
            )}
            <tr>
              <td>CONTROLLED CHAOS</td>
              <td><div style={{ height: '4px', background: 'rgba(0,0,0,.1)' }}></div></td>
              <td style={{ color: 'var(--orange)' }}>25%</td>
            </tr>
            <tr>
              <td>BLACK COFFEE (ARABICA)</td>
              <td><div style={{ height: '4px', background: 'rgba(0,0,0,.1)' }}></div></td>
              <td style={{ color: 'var(--ink)' }}>15%</td>
            </tr>
            <tr>
              <td>GOA SUNLIGHT (D/W/V)</td>
              <td><div style={{ height: '4px', background: 'rgba(0,0,0,.1)' }}></div></td>
              <td style={{ color: 'var(--orange)' }}>10%</td>
            </tr>
            <tr>
              <td>QUESTIONABLE IDEAS</td>
              <td><div style={{ height: '4px', background: 'rgba(0,0,0,.1)' }}></div></td>
              <td style={{ color: 'var(--pink)' }}>10%</td>
            </tr>
          </table>

          <div className="back-pattern-row" style={{ margin: '8px 0' }}>
            <div className="bp-diamond"></div><div className="bp-circle"></div>
            <div className="bp-diamond"></div><div className="bp-circle"></div>
            <div className="bp-diamond"></div>
          </div>

          <div className="back-section-title">DIRECTIONS FOR USE</div>
          <ul style={{ fontFamily: 'Space Mono, monospace', fontSize: '7.5px', lineHeight: '1.7', color: 'var(--ink)', letterSpacing: '.04em', paddingLeft: '20px' }}>
            <li>1. Apply one hackathon (minimum 4 days, maximum ∞).</li>
            <li>2. Ship continuously. Do not wait for perfection.</li>
            <li>3. Do not operate heavy machinery without caffeine.</li>
            <li>4. Best used in proximity to the Arabian Sea.</li>
            <li>5. Repeat as required. Jugaad liberally.</li>
          </ul>

          <div style={{ background: 'var(--yellow)', border: '3px solid var(--ink)', padding: '10px 12px', margin: '12px 0', position: 'relative' }}>
            <div style={{ content: '⚠ WARNING', display: 'block', fontFamily: 'Teko, sans-serif', fontSize: '13px', fontWeight: '700', color: 'var(--red)', letterSpacing: '.08em', marginBottom: '4px' }}>
              ⚠ WARNING
            </div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '7px', lineHeight: '1.65', color: 'var(--ink)', letterSpacing: '.04em' }}>
              May accidentally build something useful. Side effects include: shipping at 3am, unsolicited product demos, and an inexplicable fondness for Goa. Not responsible for bugs shipped to production.
              <br /><br />
              HANDLE PROD WITH CARE. KEEP AWAY FROM LEGACY CODEBASES. STORE IN A COOL, DRY, WIFI-ENABLED ENVIRONMENT.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '2px solid var(--ink)', padding: '8px 10px', marginTop: '10px', background: 'rgba(255,255,255,.4)' }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '6.5px', color: 'var(--fade)', letterSpacing: '.06em', lineHeight: '1.6' }}>
              MANUFACTURED AT:<br />
              HACKER HOUSE GOA 2026<br />
              PRIVATE BEACH RESORT · GOA, INDIA<br />
              OCT 28–31 · 2026<br />
              <br />
              MFG. BY: 247PM STUDIO<br />
              FOR: {formData?.name || 'BUILDER'}<br />
              BEST BEFORE: INDEFINITE<br />
              COUNTRY OF ORIGIN: 🇮🇳 INDIA<br />
              <span style={{ color: 'var(--red)' }}>★ BUILT IN GOA · 100% SHIPPED ★</span>
            </div>
            <div style={{ fontFamily: 'serif', fontSize: '32px', color: 'var(--fade)', opacity: '.5' }}>
              गोवा
            </div>
          </div>

          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '1px', height: '30px', alignItems: 'stretch' }}>
              {[0,1,0,1,1,0,1,0,1,1,0,1,1,0,0,1,1,0,1].map((w, i) => (
                <div key={i} style={{ width: w ? '4px' : '2px', background: w ? 'var(--ink)' : 'var(--ink)', opacity: w ? 1 : 0.3 }}></div>
              ))}
            </div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '7px', color: 'var(--fade)', letterSpacing: '.2em', marginTop: '4px' }}>
              HH-GOA-2026-{batchNum}-{formData?.name?.toUpperCase().replace(/\s+/g, '') || 'BUILDER'}
            </div>
          </div>
        </div>
        <div className="art-top-band"></div>
      </div>

      <div style={{ display: 'flex', gap: '10px', padding: '16px', background: '#111', justifyContent: 'center' }}>
        <button className="act-btn ghost" onClick={() => setStep('artifact-front')}>
          ← FLIP BACK
        </button>
        <button className="act-btn primary" onClick={() => setStep('result')}>
          DOWNLOAD / SHARE →
        </button>
      </div>
    </div>
  );
};

export default ArtifactBack;
