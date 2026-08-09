import React, { useState, useEffect } from 'react';

export const ScanningScreen = ({ setStep, formData, onComplete }) => {
  const [lineProgress, setLineProgress] = useState(0);

  const SCAN_LINES = [
    { main: 'SCANNING BUILDER VIBES', sub: 'FACE FOUND · AESTHETIC CONFIRMED', result: '✓ OK' },
    { main: `ANALYSING STACK POTENTIAL`, sub: `${formData.stack || 'REACT'} DETECTED`, result: '✓ OK' },
    { main: 'DETECTING JUGAAD COEFFICIENT', sub: 'CHECKING CHAOS TOLERANCE', result: '✓ HIGH' },
    { main: 'MEASURING SHIP VELOCITY…', sub: 'CALCULATING 3AM PRODUCTIVITY INDEX', result: '97%' },
    { main: 'CALCULATING GOA COMPATIBILITY', sub: 'CHECKING ARABIAN SEA PROXIMITY TOLERANCE' },
    { main: 'GENERATING ARTIFACT…', sub: 'COMPOSING VINTAGE POSTER · APPLYING INK TEXTURES' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLineProgress(prev => {
        if (prev >= SCAN_LINES.length) {
          clearInterval(interval);
          setTimeout(() => onComplete && onComplete(), 400);
          return prev;
        }
        return prev + 1;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [onComplete]);

  const getLineState = (index) => {
    if (lineProgress > index) return 'done';
    if (lineProgress === index) return 'active';
    return 'wait';
  };

  const progressPercent = Math.min(100, (lineProgress / SCAN_LINES.length) * 100);

  return (
    <div className="scan-screen">
      <div className="scan-bg-text">SCAN</div>
      <div className="border-strip-top"></div>
      <div className="windowbar" style={{ borderColor: 'var(--yellow)' }}>
        <div className="windowbar-title">⬛ BUILDER AUTHENTICATION IN PROGRESS</div>
        <div className="wbtns">
          <div className="wbtn" style={{ background: lineProgress < SCAN_LINES.length ? 'var(--yellow)' : 'var(--fade)', animation: lineProgress < SCAN_LINES.length ? 'pulse .8s ease infinite alternate' : 'none' }}></div>
          <div className="wbtn" style={{ background: 'var(--fade)' }}></div>
          <div className="wbtn" style={{ background: 'var(--fade)' }}></div>
        </div>
      </div>

      <div className="scan-body">
        <div className="scan-eyebrow">// IDENTITY AUTHENTICATION IN PROGRESS</div>
        <div className="scan-headline">SCANNING<br />BUILDER…</div>

        {SCAN_LINES.map((line, index) => {
          const state = getLineState(index);
          const isDone = state === 'done';
          const isActive = state === 'active';

          return (
            <div className="scan-line" key={index}>
              <div className={`scan-icon ${state}`}>
                {isDone ? '✓' : isActive ? '→' : '○'}
              </div>
              <div className="scan-text-wrap">
                <div className={`scan-text-main ${state}`}>
                  {line.main}
                </div>
                <div className="scan-text-sub">{line.sub}</div>
              </div>
              {line.result && <div className="scan-result">{line.result}</div>}
            </div>
          );
        })}

        <div className="scan-progress-wrap">
          <div className="scan-progress-label">
            <span>BUILDER AUTHENTICATION</span>
            <span style={{ color: 'var(--yellow)' }}>{Math.round(progressPercent)}%</span>
          </div>
          <div className="scan-progress-track">
            <div className="scan-progress-fill" style={{ width: `${progressPercent}%` }}></div>
            <div className="scan-progress-text">JUGAAD IN PROGRESS · PLEASE HOLD</div>
          </div>
        </div>

        <div className="gen-bar">
          GENERATING ARTIFACT · <span>GOA COMPATIBILITY: CALCULATING</span> · DO NOT CLOSE TAB
          <span style={{ color: 'var(--fade)', fontSize: '6px', marginTop: '4px', display: 'block' }}>
            // COFFEE: CRITICAL · 404: SLEEP NOT FOUND · WORKS ON MY MACHINE
          </span>
        </div>
      </div>
      <div className="border-strip-bottom"></div>
    </div>
  );
};

export default ScanningScreen;
