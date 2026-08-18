import { useCallback, useState } from 'react';
import MetadataPanel from './components/MetadataPanel';
import FramePreview from './components/FramePreview';
import DownloadButton from './components/DownloadButton';
import { parseExif, createEmptyMetadata } from './utils/exifParser';
import { BORDER_PRESETS } from './utils/frameRenderer';
import { createDefaultBorderSettings } from './utils/borderSettings';
import { createDefaultTextStyles } from './utils/textStyles';
import styles from './App.module.css';

const FILE_INPUT_ID = 'photo-upload';

function loadImageFromFile(file) {
  return createImageBitmap(file, { premultiplyAlpha: 'none', colorSpaceConversion: 'none' }).catch(() =>
    new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Could not load image preview. HEIC/RAW files may not be supported by your browser.'));
      };
      img.src = url;
    }),
  );
}

export default function App() {
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);
  const [metadata, setMetadata] = useState(createEmptyMetadata());
  const [borderPreset, setBorderPreset] = useState(BORDER_PRESETS.full);
  const [textStyles, setTextStyles] = useState(createDefaultTextStyles);
  const [borderSettings, setBorderSettings] = useState(createDefaultBorderSettings);
  const [canvas, setCanvas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback(async (selectedFile) => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const parsedMetadata = await parseExif(selectedFile);

      let loadedImage = null;
      try {
        loadedImage = await loadImageFromFile(selectedFile);
      } catch (imgErr) {
        setError(imgErr.message || 'Could not load image preview');
      }

      setFile(selectedFile);
      setImage(loadedImage);
      setMetadata(parsedMetadata);
      setCanvas(null);
    } catch (err) {
      setError(err.message || 'Failed to process image');
      setFile(null);
      setImage(null);
      setMetadata(createEmptyMetadata());
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCanvasReady = useCallback((c) => {
    setCanvas(c);
  }, []);

  const onDragOver = (e) => {
    e.preventDefault();
    if (!loading) setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (loading) return;
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFileSelect(dropped);
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>AutoFramer</h1>
          <span className={styles.tagline}>Fujifilm-style film borders</span>
          {loading && <span className={styles.status}>Reading EXIF…</span>}
        </div>
        <div className={styles.headerActions}>
          <input
            id={FILE_INPUT_ID}
            type="file"
            accept=".jpg,.jpeg,.png,.heic,.heif,.webp,.tif,.tiff,.dng,.cr2,.nef,.arw,.raf"
            className={styles.hiddenInput}
            onChange={(e) => {
              const selected = e.target.files?.[0];
              if (selected) handleFileSelect(selected);
              e.target.value = '';
            }}
          />
          <label htmlFor={FILE_INPUT_ID} className={`${styles.changeBtn} ${loading ? styles.changeBtnDisabled : ''}`}>
            {file ? 'Change photo' : 'Upload photo'}
          </label>
          <DownloadButton canvas={canvas} filename={file?.name} disabled={!canvas} compact />
        </div>
      </header>

      <main className={styles.main}>
        <section
          className={`${styles.previewSection} ${isDragging ? styles.previewDragging : ''}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <FramePreview
            image={image}
            metadata={metadata}
            borderPreset={borderPreset}
            textStyles={textStyles}
            borderSettings={borderSettings}
            onCanvasReady={handleCanvasReady}
          />
          {error && <p className={styles.error}>{error}</p>}
        </section>

        <footer className={styles.controls}>
          <MetadataPanel
            metadata={metadata}
            onChange={setMetadata}
            borderPreset={borderPreset}
            onPresetChange={setBorderPreset}
            presets={BORDER_PRESETS}
            textStyles={textStyles}
            onTextStyleChange={setTextStyles}
            borderSettings={borderSettings}
            onBorderSettingsChange={setBorderSettings}
          />
        </footer>
      </main>
    </div>
  );
}
