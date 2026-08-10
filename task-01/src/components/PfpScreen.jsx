import React, { useState, useCallback, useRef } from 'react';

/**
 * Draws `img` into the destination rect using cover-style scaling (crops
 * instead of stretching), matching the on-screen CSS object-fit:cover preview.
 */
const drawImageCover = (ctx, img, dx, dy, dWidth, dHeight) => {
  const imgAspect = img.width / img.height;
  const targetAspect = dWidth / dHeight;
  let sx, sy, sWidth, sHeight;

  if (imgAspect > targetAspect) {
    sHeight = img.height;
    sWidth = sHeight * targetAspect;
    sx = (img.width - sWidth) / 2;
    sy = 0;
  } else {
    sWidth = img.width;
    sHeight = sWidth / targetAspect;
    sx = 0;
    sy = (img.height - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
};

export const PfpScreen = ({ setStep, formData, croppedImageURL }) => {
  const firstName = formData?.name?.split(' ')[0] || formData?.name || 'BUILDER';
  const [isDownloading, setIsDownloading] = useState(false);
  const [pfpRoundURL, setPfpRoundURL] = useState(null);
  const [pfpSquareURL, setPfpSquareURL] = useState(null);
  const canvasRef = useRef(null);

  const generateRoundPFP = useCallback(async () => {
    if (!croppedImageURL) return null;

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(null);
          return;
        }

        // Canvas size for round PFP
        const size = 500;
        canvas.width = size;
        canvas.height = size;

        // Yellow top half background
        ctx.fillStyle = '#F0C229';
        ctx.beginPath();
        ctx.rect(0, 0, size, size / 2);
        ctx.fill();

        // Red bottom half
        ctx.fillStyle = '#C8001E';
        ctx.beginPath();
        ctx.rect(0, size / 2, size, size / 2);
        ctx.fill();

        // Decorative inner border
        ctx.strokeStyle = 'rgba(240,194,41,.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 6, 0, 2 * Math.PI);
        ctx.stroke();

        // Draw photo as circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 12, 0, 2 * Math.PI);
        ctx.clip();

        const drawSize = (size / 2 - 12) * 2;
        drawImageCover(
          ctx,
          img,
          size / 2 - drawSize / 2,
          size / 2 - drawSize / 2,
          drawSize,
          drawSize
        );
        ctx.restore();

        // HH GOA label at top
        ctx.font = '7px Space Mono';
        ctx.fillStyle = '#C8001E';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('HH GOA 2026', size / 2, 8);

        // Name
        ctx.font = '22px Unbounded';
        ctx.fillStyle = '#F5EDD8';
        ctx.textBaseline = 'bottom';
        ctx.fillText(firstName.toUpperCase(), size / 2, size - 20);

        // Bottom title bar
        ctx.fillStyle = '#1A1008';
        ctx.beginPath();
        ctx.rect(0, size - 16, size, 16);
        ctx.fill();

        ctx.font = '7px Space Mono';
        ctx.fillStyle = '#F0C229';
        ctx.textBaseline = 'middle';
        ctx.fillText((formData?.builderTitle || 'BUILDER').toUpperCase(), size / 2, size - 8);

        canvasRef.current = canvas;
        canvas.toBlob((blob) => resolve(blob), 'image/png');
      };
      img.onerror = () => resolve(null);
      img.src = croppedImageURL;
    });
  }, [croppedImageURL, firstName, formData]);

  const generateSquarePFP = useCallback(async () => {
    if (!croppedImageURL) return null;

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(null);
          return;
        }

        const size = 500;
        canvas.width = size;
        canvas.height = size;

        // Cream background
        ctx.fillStyle = '#F5EDD8';
        ctx.fillRect(0, 0, size, size);

        // Ink border
        ctx.strokeStyle = '#1A1008';
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, size, size);

        // Tricolor top stripe
        ctx.fillStyle = '#C8001E';
        ctx.fillRect(0, 0, size, 6);
        ctx.fillStyle = '#F0C229';
        ctx.fillRect(size / 3, 0, size / 3, 6);
        ctx.fillStyle = '#2A7A4B';
        ctx.fillRect((size * 2) / 3, 0, size / 3, 6);

        // Yellow header area
        ctx.fillStyle = '#F0C229';
        ctx.fillRect(0, 6, size, 80);

        // Draw photo
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, 50, 60, 0, 2 * Math.PI);
        ctx.clip();

        drawImageCover(ctx, img, size / 2 - 60, 50 - 60, 120, 120);
        ctx.restore();

        // Ink border around photo
        ctx.strokeStyle = '#1A1008';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(size / 2, 50, 62, 0, 2 * Math.PI);
        ctx.stroke();

        // Name
        ctx.font = '16px Unbounded';
        ctx.fillStyle = '#C8001E';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const fullName = formData?.name || 'BUILDER';
        const nameParts = fullName.toUpperCase().split(' ');
        if (nameParts.length > 1) {
          ctx.fillText(nameParts[0], size / 2, 150);
          ctx.fillText(nameParts.slice(1).join(' '), size / 2, 170);
        } else {
          ctx.fillText(nameParts[0], size / 2, 160);
        }

        // Builder title
        ctx.font = '6px Space Mono';
        ctx.fillStyle = '#B8A882';
        ctx.textBaseline = 'middle';
        ctx.fillText((formData?.builderTitle || 'BUILDER').toUpperCase(), size / 2, 185);

        // Tricolor bottom stripe
        ctx.fillStyle = '#2A7A4B';
        ctx.fillRect(0, size - 6, size / 3, 6);
        ctx.fillStyle = '#F0C229';
        ctx.fillRect(size / 3, size - 6, size / 3, 6);
        ctx.fillStyle = '#E8407A';
        ctx.fillRect((size * 2) / 3, size - 6, size / 3, 6);

        canvas.toBlob((blob) => resolve(blob), 'image/png');
      };
      img.onerror = () => resolve(null);
      img.src = croppedImageURL;
    });
  }, [croppedImageURL, formData]);

  // Generate PFP images once the cropped photo / form data are ready. The
  // object URLs created here are revoked in this same effect's cleanup —
  // scoped to local variables, not component state — so regenerating (or
  // unmounting) never revokes a URL some other render is still using.
  React.useEffect(() => {
    let active = true;
    let roundBlobUrl;
    let squareBlobUrl;

    const generatePFPImages = async () => {
      if (!croppedImageURL) return;
      const [roundBlob, squareBlob] = await Promise.all([generateRoundPFP(), generateSquarePFP()]);
      if (!active) return;

      roundBlobUrl = roundBlob ? URL.createObjectURL(roundBlob) : null;
      squareBlobUrl = squareBlob ? URL.createObjectURL(squareBlob) : null;
      setPfpRoundURL(roundBlobUrl);
      setPfpSquareURL(squareBlobUrl);
    };
    generatePFPImages();

    return () => {
      active = false;
      if (roundBlobUrl) URL.revokeObjectURL(roundBlobUrl);
      if (squareBlobUrl) URL.revokeObjectURL(squareBlobUrl);
    };
  }, [croppedImageURL, formData, generateRoundPFP, generateSquarePFP]);

  const handleDownloadRound = useCallback(() => {
    if (!pfpRoundURL) return;
    setIsDownloading(true);
    const link = document.createElement('a');
    link.href = pfpRoundURL;
    link.download = `hh-goa-2026-${firstName.toLowerCase()}-pfp-round.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsDownloading(false);
  }, [pfpRoundURL, firstName]);

  const handleDownloadSquare = useCallback(() => {
    if (!pfpSquareURL) return;
    setIsDownloading(true);
    const link = document.createElement('a');
    link.href = pfpSquareURL;
    link.download = `hh-goa-2026-${firstName.toLowerCase()}-pfp-square.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsDownloading(false);
  }, [pfpSquareURL, firstName]);

  return (
    <div
      style={{
        background: 'var(--ink)',
        padding: '28px',
        border: '4px solid var(--yellow)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      <div className="screen-label">AVATAR / PFP VERSION</div>

      {/* Main round PFP */}
      <div
        style={{
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          border: '6px solid var(--ink)',
          overflow: 'hidden',
          position: 'relative',
          background: 'var(--red)',
          boxShadow: '8px 8px 0 var(--ink)',
        }}
      >
        {/* Yellow top half background */}
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            left: '-20px',
            right: '-20px',
            height: '60%',
            background: 'var(--yellow)',
            borderRadius: '0 0 50% 50%',
          }}
        ></div>

        {/* Red bottom half */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '50%',
            background: 'var(--red)',
            zIndex: '0',
          }}
        ></div>

        {/* Decorative inner border */}
        <div
          style={{
            position: 'absolute',
            inset: '6px',
            borderRadius: '50%',
            border: '3px solid rgba(240,194,41,.4)',
            zIndex: '5',
            pointerEvents: 'none',
          }}
        ></div>

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
        <div
          style={{
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
          }}
        >
          HH GOA 2026
        </div>

        {/* Name */}
        <div
          style={{
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
          }}
        >
          {firstName}
        </div>

        {/* Bottom title bar */}
        <div
          style={{
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
          }}
        >
          {formData?.builderTitle || 'BUILDER'}
        </div>
      </div>

      {/* Square version note */}
      <div
        style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: '8px',
          color: 'var(--fade)',
          letterSpacing: '.12em',
          textAlign: 'center',
        }}
      >
        // AVATAR · PROFILE PICTURE · TWITTER / X · INSTAGRAM
        <br />
        <span style={{ color: 'var(--yellow)', marginTop: '4px', display: 'block' }}>
          1:1 SQUARE VERSION ALSO GENERATED
        </span>
      </div>

      {/* Square PFP version */}
      <div
        style={{
          width: '200px',
          height: '200px',
          background: 'var(--cream)',
          border: '4px solid var(--ink)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '5px 5px 0 var(--yellow)',
        }}
      >
        <div
          style={{
            height: '6px',
            background:
              'repeating-linear-gradient(90deg, var(--red) 0, var(--red) 10px, var(--yellow) 10px, var(--yellow) 20px, var(--green) 20px, var(--green) 30px)',
          }}
        ></div>
        <div
          style={{
            background: 'var(--yellow)',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
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
          <div
            style={{
              fontFamily: 'Unbounded, sans-serif',
              fontWeight: '900',
              fontSize: '16px',
              color: 'var(--red)',
              textTransform: 'uppercase',
              lineHeight: '.9',
            }}
          >
            {firstName}
            <br />
            {formData?.name?.split(' ')[1] || ''}
          </div>
          <div
            style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: '6px',
              color: 'var(--fade)',
              letterSpacing: '.1em',
              marginTop: '4px',
            }}
          >
            {formData?.builderTitle || 'BUILDER'}
          </div>
        </div>
        <div
          style={{
            height: '6px',
            background:
              'repeating-linear-gradient(90deg, var(--green) 0, var(--green) 10px, var(--yellow) 10px, var(--yellow) 20px, var(--pink) 20px, var(--pink) 30px)',
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
          }}
        ></div>
      </div>

      {/* Download buttons */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <button
          className="act-btn primary"
          onClick={handleDownloadRound}
          disabled={isDownloading || !pfpRoundURL}
        >
          {isDownloading ? 'SAVING...' : '⬇ DOWNLOAD ROUND PFP'}
        </button>
        <button
          className="act-btn x"
          onClick={handleDownloadSquare}
          disabled={isDownloading || !pfpSquareURL}
        >
          {isDownloading ? 'SAVING...' : '⬇ DOWNLOAD SQUARE PFP'}
        </button>
        <button
          className="act-btn ghost"
          style={{ color: 'var(--cream)', borderColor: 'var(--cream)' }}
          onClick={() => setStep('result')}
          disabled={isDownloading}
        >
          ← BACK
        </button>
      </div>
    </div>
  );
};

export default PfpScreen;
