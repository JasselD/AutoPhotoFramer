import { useCallback, useRef, useState } from 'react';
import styles from './UploadZone.module.css';

const ACCEPTED_EXTENSIONS = '.jpg,.jpeg,.png,.heic,.heif,.webp,.tif,.tiff,.dng,.cr2,.nef,.arw,.raf';

export default function UploadZone({ onFileSelect, onBrowse, disabled }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const openPicker = useCallback(() => {
    if (onBrowse) onBrowse();
    else inputRef.current?.click();
  }, [onBrowse]);

  const handleFiles = useCallback(
    (files) => {
      const file = files?.[0];
      if (!file) return;
      onFileSelect(file);
    },
    [onFileSelect],
  );

  const onDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      className={`${styles.zone} ${isDragging ? styles.dragging : ''} ${disabled ? styles.disabled : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => !disabled && openPicker()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && !disabled && openPicker()}
    >
      {!onBrowse && (
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
          className={styles.hiddenInput}
          disabled={disabled}
        />
      )}
      <p className={styles.title}>Drop a photo here or click to browse</p>
      <p className={styles.subtitle}>JPEG · PNG · HEIC · RAW</p>
    </div>
  );
}
