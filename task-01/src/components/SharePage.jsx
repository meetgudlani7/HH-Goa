import React, { useCallback, useState } from 'react';
import { getShareImageUrls } from '../lib/shareUpload';
import { CAPTION_PLACEHOLDER } from '../constants/shareCaption';

// Standalone landing page for /share/:id — the QR/link a desktop user gets
// as a backup so they can finish the native multi-image X share from their
// phone instead of manually attaching two downloaded files. Images here are
// short-lived (cleaned up a few minutes after upload), so this page also
// has to handle the "link already expired" case.
export const SharePage = ({ id }) => {
  const [{ frontUrl, backUrl }] = useState(() => getShareImageUrls(id));
  const [expired, setExpired] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState(null);

  const shareToX = useCallback(async () => {
    setIsSharing(true);
    setError(null);
    try {
      const [frontBlob, backBlob] = await Promise.all([
        fetch(frontUrl).then((r) => {
          if (!r.ok) throw new Error('expired');
          return r.blob();
        }),
        fetch(backUrl).then((r) => {
          if (!r.ok) throw new Error('expired');
          return r.blob();
        }),
      ]);
      const frontFile = new File([frontBlob], 'front.png', { type: 'image/png' });
      const backFile = new File([backBlob], 'back.png', { type: 'image/png' });

      if (
        typeof navigator.share === 'function' &&
        (!navigator.canShare || navigator.canShare({ files: [frontFile, backFile] }))
      ) {
        await navigator.share({ files: [frontFile, backFile], text: CAPTION_PLACEHOLDER });
      } else {
        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(CAPTION_PLACEHOLDER)}`;
        window.open(tweetUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (shareError) {
      if (shareError?.message === 'expired') {
        setExpired(true);
      } else if (shareError?.name !== 'AbortError') {
        console.error(shareError);
        setError('Could not share right now — try again in a moment.');
      }
    } finally {
      setIsSharing(false);
    }
  }, [frontUrl, backUrl]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--ink)',
        color: 'var(--cream)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        gap: '16px',
        textAlign: 'center',
        fontFamily: 'Space Mono, monospace',
      }}
    >
      {expired ? (
        <>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>⏳ This share link has expired</div>
          <div style={{ color: 'var(--fade)', maxWidth: '360px' }}>
            Share links only last a few minutes. Head back to the app and generate a new artifact
            to share again.
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>YOUR BUILDER ARTIFACT</div>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              maxWidth: '480px',
            }}
          >
            <img
              src={frontUrl}
              alt="Artifact front"
              onError={() => setExpired(true)}
              style={{ maxWidth: '200px', borderRadius: '4px' }}
            />
            <img
              src={backUrl}
              alt="Artifact back"
              onError={() => setExpired(true)}
              style={{ maxWidth: '200px', borderRadius: '4px' }}
            />
          </div>
          <button
            onClick={shareToX}
            disabled={isSharing}
            style={{
              background: 'var(--blue)',
              color: 'var(--cream)',
              border: 'none',
              padding: '14px 24px',
              fontFamily: 'inherit',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer',
              borderRadius: '4px',
            }}
          >
            {isSharing ? 'SHARING...' : 'POST TO X → #FrameInGoa'}
          </button>
          {error && <div style={{ color: 'var(--red)' }}>{error}</div>}
        </>
      )}
    </div>
  );
};

export default SharePage;
