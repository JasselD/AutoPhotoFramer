import { useEffect, useRef } from 'react';
import { renderFrame } from '../utils/frameRenderer';
import { ensureFontsLoaded } from '../utils/textStyles';
import styles from './FramePreview.module.css';

export default function FramePreview({ image, metadata, imageTransform, borderPreset, textStyles, borderSettings, onCanvasReady }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!image || !canvasRef.current) return undefined;

    let cancelled = false;

    (async () => {
      await ensureFontsLoaded(textStyles);
      if (cancelled || !canvasRef.current) return;

      const canvas = renderFrame(canvasRef.current, image, metadata, {
        imageTransform,
        preset: borderPreset,
        textStyles,
        borderSettings,
      });
      onCanvasReady?.(canvas);
    })();

    return () => {
      cancelled = true;
    };
  }, [image, metadata, imageTransform, borderPreset, textStyles, borderSettings, onCanvasReady]);

  if (!image) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No photo loaded</p>
          <p className={styles.emptyHint}>Click Upload photo above, or drag a file here</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
