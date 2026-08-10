import { useCallback, useState } from 'react';
import html2canvas from 'html2canvas';

const CANVAS_OPTS = {
  scale: 3,
  useCORS: true,
  allowTaint: false,
  backgroundColor: null,
  logging: false,
  scrollX: 0,
  scrollY: 0,
  windowWidth: document.documentElement.scrollWidth,
  windowHeight: document.documentElement.scrollHeight,
};

/**
 * Wraps canvas.toBlob in a promise. We use Blob + object URLs (not
 * toDataURL's base64 strings) throughout this hook — for a combined
 * front+back card at scale:3 the canvas is large enough that the base64
 * form runs multiple MB, which is exactly the size range where Safari/iOS
 * has historically been unreliable about honoring the <a download> anchor
 * on data: URIs.
 */
const canvasToBlob = (canvas) =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Could not generate image from canvas'));
    }, 'image/png');
  });

export const useCardRenderer = () => {
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState(null);

  const renderCanvas = useCallback(async (cardDomRef) => {
    if (!cardDomRef?.current) throw new Error('Card DOM ref is not attached');
    return html2canvas(cardDomRef.current, CANVAS_OPTS);
  }, []);

  const renderFront = useCallback(
    async (cardDomRef) => {
      setIsRendering(true);
      setError(null);
      try {
        await document.fonts.ready;
        const canvas = await renderCanvas(cardDomRef);
        return await canvasToBlob(canvas);
      } catch (renderError) {
        setError(renderError);
        throw renderError;
      } finally {
        setIsRendering(false);
      }
    },
    [renderCanvas]
  );

  /**
   * Renders front + back card DOM nodes and stitches them into a single
   * PNG blob, front stacked above back, so the whole collectible artifact
   * downloads/shares as one image.
   */
  const renderCombined = useCallback(
    async (frontDomRef, backDomRef) => {
      setIsRendering(true);
      setError(null);
      try {
        await document.fonts.ready;
        const [frontCanvas, backCanvas] = await Promise.all([
          renderCanvas(frontDomRef),
          renderCanvas(backDomRef),
        ]);

        const gap = 60;
        const width = Math.max(frontCanvas.width, backCanvas.width);
        const height = frontCanvas.height + gap + backCanvas.height;

        const combined = document.createElement('canvas');
        combined.width = width;
        combined.height = height;
        const ctx = combined.getContext('2d');
        ctx.fillStyle = '#0e0a06';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(frontCanvas, (width - frontCanvas.width) / 2, 0);
        ctx.drawImage(backCanvas, (width - backCanvas.width) / 2, frontCanvas.height + gap);

        return await canvasToBlob(combined);
      } catch (renderError) {
        setError(renderError);
        throw renderError;
      } finally {
        setIsRendering(false);
      }
    },
    [renderCanvas]
  );

  return { renderFront, renderCombined, isRendering, error };
};

export default useCardRenderer;
