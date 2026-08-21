import { useState } from 'react';
import JSZip from 'jszip';
import { canvasToBlob, downloadBlob, renderFrame } from '../utils/frameRenderer';
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

function requestFilename(defaultName, extension) {
  const enteredName = window.prompt(`Save as ${extension.toUpperCase()}`, defaultName);
  if (enteredName === null) return null;

  const trimmedName = enteredName.trim();
  if (!trimmedName) return null;
  return trimmedName.toLowerCase().endsWith(extension) ? trimmedName : `${trimmedName}${extension}`;
}

async function chooseSaveTarget(defaultName, extension, description) {
  if (window.showSaveFilePicker) {
    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: defaultName,
        types: [{ description, accept: { [extension === '.png' ? 'image/png' : 'application/zip']: [extension] } }],
      });
      return { fileHandle, cancelled: false };
    } catch (error) {
      return { fileHandle: null, cancelled: error.name === 'AbortError' };
    }
  }

  return { fileHandle: null, cancelled: false };
}

async function saveBlob(blob, defaultName, extension, saveTarget) {
  if (saveTarget.fileHandle) {
    const writable = await saveTarget.fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
    return;
  }

  if (saveTarget.cancelled) return;
  const outputName = requestFilename(defaultName, extension);
  if (outputName) downloadBlob(blob, outputName);
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

  const handleDownload = async () => {
    if (!canvas || disabled) return;
    const baseName = filename?.replace(/\.[^.]+$/, '') || 'photoframe';
    const defaultName = `${baseName}-framed.png`;
    const saveTarget = await chooseSaveTarget(defaultName, '.png', 'Framed PNG image');
    const blob = await canvasToBlob(canvas);
    if (blob) await saveBlob(blob, defaultName, '.png', saveTarget);
  };

  const handleZipDownload = async () => {
    if (!photos.length || disabled || isDownloadingZip) return;

    const saveTarget = await chooseSaveTarget('photoframes.zip', '.zip', 'Framed photo archive');
    if (saveTarget.cancelled) return;

    setIsDownloadingZip(true);
    try {
      const zip = new JSZip();
      const usedNames = new Set();

      for (const photo of photos) {
        const photoTextStyles = photo.textStyles || renderOptions?.textStyles;
        await ensureFontsLoaded(photoTextStyles);
        const exportCanvas = document.createElement('canvas');
        renderFrame(exportCanvas, photo.image, photo.metadata, {
          ...renderOptions,
          borderSettings: photo.borderSettings || renderOptions?.borderSettings,
          textStyles: photoTextStyles,
          imageTransform: photo.transform,
        });
        const blob = await canvasToBlob(exportCanvas);
        if (blob) zip.file(createOutputName(photo.file.name, usedNames), blob);
      }

      const archive = await zip.generateAsync({ type: 'blob' });
      await saveBlob(archive, 'photoframes.zip', '.zip', saveTarget);
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
        {compact ? `Save as${dims ? ` · ${dims}` : ''}` : `Save PNG as${dims ? ` (${dims})` : ''}`}
      </button>
      {photos.length > 1 && (
        <button
          type="button"
          className={compact ? styles.compact : styles.button}
          onClick={handleZipDownload}
          disabled={disabled || isDownloadingZip}
        >
          {isDownloadingZip ? 'Preparing ZIP…' : `Save ZIP as · ${photos.length}`}
        </button>
      )}
    </div>
  );
}
