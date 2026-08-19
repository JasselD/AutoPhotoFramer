import { useState } from 'react';
import JSZip from 'jszip';
import { canvasToBlob, downloadBlob, downloadCanvas, renderFrame } from '../utils/frameRenderer';
import { ensureFontsLoaded } from '../utils/textStyles';
import styles from './DownloadButton.module.css';

function createOutputName(filename, usedNames) {
  const baseName = filename?.replace(/\.[^.]+$/, '') || 'photoframe';
  let outputName = `${baseName}-framed.png`;
  let copy = 2;

  while (usedNames.has(outputName)) {
    outputName = `${baseName}-framed-${copy}.png`;
    copy += 1;
  }

  usedNames.add(outputName);
  return outputName;
}

export default function DownloadButton({
  canvas,
  filename,
  photos = [],
  renderOptions,
  disabled,
  compact = false,
}) {
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const handleDownload = () => {
    if (!canvas || disabled) return;
    const baseName = filename?.replace(/\.[^.]+$/, '') || 'photoframe';
    downloadCanvas(canvas, `${baseName}-framed.png`);
  };

  const handleZipDownload = async () => {
    if (!photos.length || disabled || isDownloadingZip) return;

    setIsDownloadingZip(true);
    try {
      await ensureFontsLoaded(renderOptions?.textStyles);
      const zip = new JSZip();
      const usedNames = new Set();

      for (const photo of photos) {
        const exportCanvas = document.createElement('canvas');
        renderFrame(exportCanvas, photo.image, photo.metadata, renderOptions);
        const blob = await canvasToBlob(exportCanvas);
        if (blob) zip.file(createOutputName(photo.file.name, usedNames), blob);
      }

      const archive = await zip.generateAsync({ type: 'blob' });
      downloadBlob(archive, 'photoframes.zip');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const dims = canvas ? `${canvas.width}×${canvas.height}` : '';

  return (
    <div className={styles.group}>
      <button
        type="button"
        className={compact ? styles.compact : styles.button}
        onClick={handleDownload}
        disabled={disabled || !canvas || isDownloadingZip}
      >
        {compact ? `Download${dims ? ` · ${dims}` : ''}` : `Download PNG${dims ? ` (${dims})` : ''}`}
      </button>
      {photos.length > 1 && (
        <button
          type="button"
          className={compact ? styles.compact : styles.button}
          onClick={handleZipDownload}
          disabled={disabled || isDownloadingZip}
        >
          {isDownloadingZip ? 'Preparing ZIP…' : `Download ZIP · ${photos.length}`}
        </button>
      )}
    </div>
  );
}
