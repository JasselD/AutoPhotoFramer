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
const MAX_PHOTOS = 50;

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

async function loadPhoto(file) {
  const metadata = await parseExif(file);
  const image = await loadImageFromFile(file);

  return {
    file,
    image,
    metadata,
    previewUrl: URL.createObjectURL(file),
  };
}

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [borderPreset, setBorderPreset] = useState(BORDER_PRESETS.full);
  const [textStyles, setTextStyles] = useState(createDefaultTextStyles);
  const [borderSettings, setBorderSettings] = useState(createDefaultBorderSettings);
  const [canvas, setCanvas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const currentPhoto = photos[currentIndex] || null;
  const file = currentPhoto?.file;
  const image = currentPhoto?.image;
  const metadata = currentPhoto?.metadata || createEmptyMetadata();

  const handleFileSelect = useCallback(async (selectedFiles) => {
    const files = Array.from(selectedFiles || []).slice(0, MAX_PHOTOS - photos.length);
    if (!files.length) return;

    setLoading(true);
    setError(null);

    try {
      const loadedPhotos = await Promise.all(files.map((selectedFile) => loadPhoto(selectedFile)));
      setPhotos((previousPhotos) => [...previousPhotos, ...loadedPhotos]);
      setCurrentIndex((previousIndex) => (photos.length ? previousIndex : 0));
      setCanvas(null);
    } catch (err) {
      setError(err.message || 'Failed to process image');
    } finally {
      setLoading(false);
    }
  }, [photos.length]);

  const updateCurrentPhoto = useCallback((updates) => {
    setPhotos((previousPhotos) => previousPhotos.map((photo, index) => (
      index === currentIndex ? { ...photo, ...updates } : photo
    )));
  }, [currentIndex]);

  const deleteCurrentPhoto = () => {
    if (!currentPhoto) return;
    URL.revokeObjectURL(currentPhoto.previewUrl);
    setPhotos((previousPhotos) => previousPhotos.filter((_, index) => index !== currentIndex));
    setCurrentIndex((previousIndex) => Math.max(0, Math.min(previousIndex, photos.length - 2)));
    setCanvas(null);
  };

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
    handleFileSelect(e.dataTransfer.files);
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
            multiple
            className={styles.hiddenInput}
            disabled={loading || photos.length >= MAX_PHOTOS}
            onChange={(e) => {
              handleFileSelect(e.target.files);
              e.target.value = '';
            }}
          />
          <label htmlFor={FILE_INPUT_ID} className={`${styles.changeBtn} ${loading || photos.length >= MAX_PHOTOS ? styles.changeBtnDisabled : ''}`}>
            {photos.length ? 'Add photos' : 'Upload photos'}
          </label>
          <DownloadButton
            canvas={canvas}
            filename={file?.name}
            photos={photos}
            renderOptions={{ preset: borderPreset, textStyles, borderSettings }}
            disabled={!canvas}
            compact
          />
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

        {photos.length > 0 && (
          <nav className={styles.gallery} aria-label="Photo navigation">
            <button
              type="button"
              className={styles.navButton}
              onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
              disabled={currentIndex === 0 || loading}
            >
              Previous
            </button>
            <div className={styles.thumbnails}>
              {photos.map((photo, index) => (
                <button
                  type="button"
                  className={`${styles.thumbnail} ${index === currentIndex ? styles.thumbnailActive : ''}`}
                  key={`${photo.file.name}-${index}`}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`View photo ${index + 1}`}
                  aria-current={index === currentIndex ? 'true' : undefined}
                >
                  <img src={photo.previewUrl} alt="" />
                  <span>{index + 1}</span>
                </button>
              ))}
              {photos.length < MAX_PHOTOS && (
                <label htmlFor={FILE_INPUT_ID} className={styles.addTile} aria-label="Add more photos">
                  <span>+</span>
                </label>
              )}
            </div>
            <button
              type="button"
              className={styles.navButton}
              onClick={() => setCurrentIndex((index) => Math.min(photos.length - 1, index + 1))}
              disabled={currentIndex === photos.length - 1 || loading}
            >
              Next
            </button>
            <button type="button" className={styles.deleteButton} onClick={deleteCurrentPhoto} disabled={loading}>
              Delete
            </button>
          </nav>
        )}

        <footer className={styles.controls}>
          <MetadataPanel
            metadata={metadata}
            onChange={(nextMetadata) => updateCurrentPhoto({ metadata: nextMetadata })}
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
