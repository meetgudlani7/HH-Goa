import React, { useCallback, useState } from 'react';
import { getShareImageUrls } from '../lib/shareUpload';
import { CAPTION_PLACEHOLDER, MOBILE_BREAKPOINT_PX } from '../constants/share';

// Standalone landing page for /share/:id — the QR/link a desktop user gets
// as a backup so they can pick this share up on their own phone (getting
// the native share-sheet auto-attach) instead of manually attaching two
// downloaded files from a laptop. Images here are short-lived (cleaned up a
// few minutes after upload), so this page also has to handle the "link
// already expired" case.
export const SharePage = ({ id }) => {
  const [{ frontUrl, backUrl }] = useState(() => getShareImageUrls(id));
  // Only used to pick the share strategy and the hint copy below — not
  // reactive to resizing, same simplification as ResultScreen.jsx.
  const [isMobileScreen] = useState(() => window.innerWidth < MOBILE_BREAKPOINT_PX);
  const [expired, setExpired] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState(null);
  // Browsers block more than one *scripted* download per click (anti-abuse
  // guard) — see ResultScreen.jsx's identical field for the full reasoning.
  const [pendingBackDownload, setPendingBackDownload] = useState(null);

  const shareToX = useCallback(async () => {
    setIsSharing(true);
    setError(null);
    setPendingBackDownload(null);

    // Same hybrid policy as ResultScreen.jsx's share(): phones get the OS
    // share sheet (auto-attaches both images); laptop/desktop skips it and
    // goes straight to X. Open the tab synchronously, in direct response to
    // the click, so the browser doesn't block it once we're a few `await`s
    // past the user gesture — not needed on the native-share path.
    const supportsNativeShare = isMobileScreen && typeof navigator.share === 'function';
    const shareWindow = supportsNativeShare ? null : window.open('', '_blank');

    let frontBlobUrl;
    let backBlobUrl;
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

      if (supportsNativeShare) {
        const frontFile = new File([frontBlob], 'front.png', { type: 'image/png' });
        const backFile = new File([backBlob], 'back.png', { type: 'image/png' });
        if (!navigator.canShare || navigator.canShare({ files: [frontFile, backFile] })) {
          await navigator.share({ files: [frontFile, backFile], text: CAPTION_PLACEHOLDER });
          return;
        }
      }

      // Only the front auto-downloads — a second scripted download would
      // just get silently blocked, so the back becomes a real button
      // (pendingBackDownload) the user clicks themselves.
      frontBlobUrl = URL.createObjectURL(frontBlob);
      const frontLink = document.createElement('a');
      frontLink.href = frontBlobUrl;
      frontLink.download = 'front.png';
      document.body.appendChild(frontLink);
      frontLink.click();
      frontLink.remove();

      backBlobUrl = URL.createObjectURL(backBlob);
      setPendingBackDownload({ blobUrl: backBlobUrl, fileName: 'back.png' });

      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(CAPTION_PLACEHOLDER)}`;
      if (shareWindow) shareWindow.location.href = tweetUrl;
      else window.open(tweetUrl, '_blank', 'noopener,noreferrer');
    } catch (shareError) {
      shareWindow?.close();
      if (shareError?.message === 'expired') {
        setExpired(true);
      } else if (shareError?.name !== 'AbortError') {
        console.error(shareError);
        setError('Could not share right now — try again in a moment.');
      }
    } finally {
      setIsSharing(false);
      if (frontBlobUrl) setTimeout(() => URL.revokeObjectURL(frontBlobUrl), 60000);
      if (backBlobUrl) setTimeout(() => URL.revokeObjectURL(backBlobUrl), 300000);
    }
  }, [frontUrl, backUrl, isMobileScreen]);

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
          <div style={{ color: 'var(--fade)', fontSize: '12px', maxWidth: '320px' }}>
            {isMobileScreen ? (
              '📱 Opens your share sheet with both images attached — pick X.'
            ) : (
              <>
                📎 The front image downloads automatically
                {pendingBackDownload && (
                  <>
                    {' '}
                    —{' '}
                    <a
                      href={pendingBackDownload.blobUrl}
                      download={pendingBackDownload.fileName}
                      style={{ color: 'var(--blue)', fontWeight: 'bold' }}
                    >
                      tap here to save the back
                    </a>{' '}
                    too
                  </>
                )}
                . Attach both once X opens (it doesn&apos;t support pre-attaching images via
                link).
              </>
            )}
          </div>
          {error && <div style={{ color: 'var(--red)' }}>{error}</div>}
        </>
      )}
    </div>
  );
};

export default SharePage;
