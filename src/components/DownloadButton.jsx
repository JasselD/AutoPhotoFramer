import { downloadCanvas } from '../utils/frameRenderer';
import styles from './DownloadButton.module.css';

export default function DownloadButton({ canvas, filename, disabled, compact = false }) {
  const handleDownload = () => {
    if (!canvas || disabled) return;
    const baseName = filename?.replace(/\.[^.]+$/, '') || 'photoframe';
    downloadCanvas(canvas, `${baseName}-framed.png`);
  };

  const dims = canvas ? `${canvas.width}×${canvas.height}` : '';

  return (
    <button
      type="button"
      className={compact ? styles.compact : styles.button}
      onClick={handleDownload}
      disabled={disabled || !canvas}
    >
      {compact ? `Download${dims ? ` · ${dims}` : ''}` : `Download PNG${dims ? ` (${dims})` : ''}`}
    </button>
  );
}
