import React from 'react';

export const PfpScreen = ({ setStep, formData, croppedImageURL }) => {
  const firstName = formData?.name?.split(' ')[0] || formData?.name || 'BUILDER';

  return (
    <div style={{ 
      background: 'var(--ink)', 
      padding: '28px', 
      border: '4px solid var(--yellow)',
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: '16px'
    }}>
      <div className="screen-label">AVATAR / PFP VERSION</div>

      {/* Main round PFP */}
      <div style={{ 
        width: '280px', 
        height: '280px', 
        borderRadius: '50%',
        border: '6px solid var(--ink)',
        overflow: 'hidden',
        position: 'relative',
        background: 'var(--red)',
        boxShadow: '8px 8px 0 var(--ink)',
      }}>
        {/* Yellow top half background */}
        <div style={{ 
          position: 'absolute', 
          top: '-20px', 
          left: '-20px', 
          right: '-20px',
          height: '60%', 
          background: 'var(--yellow)', 
          borderRadius: '0 0 50% 50%',
        }}></div>

        {/* Red bottom half */}
        <div style={{ 
          position: 'absolute', 
          bottom: '0', 
          left: '0', 
          right: '0', 
          height: '50%', 
          background: 'var(--red)', 
          zIndex: '0',
        }}></div>

        {/* Decorative inner border */}
        <div style={{ 
          position: 'absolute', 
          inset: '6px', 
          borderRadius: '50%',
          border: '3px solid rgba(240,194,41,.4)',
          zIndex: '5',
          pointerEvents: 'none',
        }}></div>

        {/* User photo (circular clipped) */}
        {croppedImageURL && (
          <img
            src={croppedImageURL}
            alt="Your photo"
            style={{ 
              position: 'absolute',
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              objectFit: 'cover',
              zIndex: '2',
              border: '4px solid var(--ink)',
            }}
          />
        )}

        {/* HH GOA label at top */}
        <div style={{ 
          position: 'absolute', 
          top: '16px', 
          left: '0', 
          right: '0',
          zIndex: '3',
          textAlign: 'center',
          fontFamily: 'Space Mono, monospace',
          fontSize: '7px',
          color: 'var(--red)',
          letterSpacing: '.15em',
          textTransform: 'uppercase',
        }}>
          HH GOA 2026
        </div>

        {/* Name */}
        <div style={{ 
          position: 'absolute', 
          bottom: '30px', 
          left: '0', 
          right: '0',
          fontFamily: 'Unbounded, sans-serif',
          fontWeight: '900',
          fontSize: '22px',
          color: 'var(--cream)',
          textTransform: 'uppercase',
          textAlign: 'center',
          letterSpacing: '-0.5px',
          textShadow: '2px 2px 0 var(--ink)',
          zIndex: '3',
        }}>
          {firstName}
        </div>

        {/* Bottom title bar */}
        <div style={{ 
          position: 'absolute', 
          bottom: '0', 
          left: '0', 
          right: '0',
          background: 'var(--ink)', 
          padding: '6px 10px',
          fontFamily: 'Space Mono, monospace',
          fontSize: '7px',
          color: 'var(--yellow)',
          letterSpacing: '.1em',
          textAlign: 'center',
          zIndex: '3',
        }}>
          {formData?.builderTitle || 'BUILDER'}
        </div>
      </div>

      {/* Square version note */}
      <div style={{ 
        fontFamily: 'Space Mono, monospace',
        fontSize: '8px',
        color: 'var(--fade)',
        letterSpacing: '.12em',
        textAlign: 'center',
      }}>
        // AVATAR · PROFILE PICTURE · TWITTER / X · INSTAGRAM<br />
        <span style={{ color: 'var(--yellow)', marginTop: '4px', display: 'block' }}>
          1:1 SQUARE VERSION ALSO GENERATED
        </span>
      </div>

      {/* Square PFP version */}
      <div style={{ 
        width: '200px', 
        height: '200px',
        background: 'var(--cream)', 
        border: '4px solid var(--ink)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '5px 5px 0 var(--yellow)',
      }}>
        <div style={{ 
          height: '6px', 
          background: 'repeating-linear-gradient(90deg, var(--red) 0, var(--red) 10px, var(--yellow) 10px, var(--yellow) 20px, var(--green) 20px, var(--green) 30px)'
        }}></div>
        <div style={{ 
          background: 'var(--yellow)', 
          height: '80px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          position: 'relative',
        }}>
          {croppedImageURL && (
            <img
              src={croppedImageURL}
              alt="Your photo"
              style={{ 
                width: '70px', 
                height: '70px', 
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--ink)',
                position: 'relative',
                zIndex: '2',
              }}
            />
          )}
        </div>
        <div style={{ padding: '8px 10px' }}>
          <div style={{ 
            fontFamily: 'Unbounded, sans-serif', 
            fontWeight: '900', 
            fontSize: '16px', 
            color: 'var(--red)', 
            textTransform: 'uppercase', 
            lineHeight: '.9',
          }}>
            {firstName}<br />
            {formData?.name?.split(' ')[1] || ''}
          </div>
          <div style={{ 
            fontFamily: 'Space Mono, monospace', 
            fontSize: '6px', 
            color: 'var(--fade)', 
            letterSpacing: '.1em', 
            marginTop: '4px',
          }}>
            {formData?.builderTitle || 'BUILDER'}
          </div>
        </div>
        <div style={{ 
          height: '6px', 
          background: 'repeating-linear-gradient(90deg, var(--green) 0, var(--green) 10px, var(--yellow) 10px, var(--yellow) 20px, var(--pink) 20px, var(--pink) 30px)',
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
        }}></div>
      </div>

      {/* Download buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}>
        <button className="act-btn primary">⬇ DOWNLOAD ROUND PFP</button>
        <button className="act-btn x">⬇ DOWNLOAD SQUARE PFP</button>
        <button className="act-btn ghost" onClick={() => setStep('result')}>
          ← BACK
        </button>
      </div>
    </div>
  );
};

export default PfpScreen;
