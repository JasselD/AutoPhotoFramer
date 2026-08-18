import { METADATA_FIELDS, rebuildExposureLine } from '../utils/exifParser';
import { FONT_OPTIONS, TEXT_SECTIONS } from '../utils/textStyles';
import { formatAspectRatio } from '../utils/borderSettings';
import AspectRatioSelector from './AspectRatioSelector';
import styles from './MetadataPanel.module.css';

const FIELD_GROUPS = [
  { label: 'Film Simulation', fields: ['filmName', 'filmSub'] },
  { label: 'Lens', fields: ['lensModel'] },
  { label: 'Exposure', fields: ['focalLength', 'fNumber', 'exposureTime', 'iso'] },
];

export default function MetadataPanel({
  metadata,
  onChange,
  borderPreset,
  onPresetChange,
  presets,
  textStyles,
  onTextStyleChange,
  borderSettings,
  onBorderSettingsChange,
}) {
  const handleChange = (key, value) => {
    const updated = { ...metadata, [key]: value };
    if (['focalLength', 'fNumber', 'exposureTime', 'iso'].includes(key)) {
      updated.exposureLine = rebuildExposureLine(updated);
    }
    onChange(updated);
  };

  const handleStyleChange = (sectionKey, field, value) => {
    onTextStyleChange({
      ...textStyles,
      [sectionKey]: {
        ...textStyles[sectionKey],
        [field]: field === 'size' ? Number(value) : value,
      },
    });
  };

  const fieldMap = Object.fromEntries(
    METADATA_FIELDS.filter((f) => !f.computed).map((f) => [f.key, f.label]),
  );

  return (
    <div className={styles.panel}>
      <div className={styles.presets}>
        {Object.values(presets).map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={`${styles.presetBtn} ${borderPreset.id === preset.id ? styles.presetActive : ''}`}
            onClick={() => onPresetChange(preset)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className={styles.borderRow}>
        <div className={styles.sliderGroup}>
          <div className={styles.sliderHeader}>
            <span className={styles.sliderLabel}>Border size</span>
            <div className={styles.sliderControls}>
              <span className={styles.sliderValue}>{borderSettings.borderScale}%</span>
              <button
                type="button"
                className={styles.resetBtn}
                onClick={() => onBorderSettingsChange({ ...borderSettings, borderScale: 100 })}
                title="Reset to normal size"
              >
                Reset
              </button>
            </div>
          </div>
          <input
            type="range"
            className={styles.slider}
            min="0"
            max="200"
            step="1"
            value={borderSettings.borderScale}
            onChange={(e) =>
              onBorderSettingsChange({ ...borderSettings, borderScale: Number(e.target.value) })
            }
            aria-label="Border size percentage"
          />
        </div>

        <AspectRatioSelector
          aspectRatio={borderSettings.aspectRatio}
          aspectRatioAuto={borderSettings.aspectRatioAuto}
          onChange={(updatedSettings) => onBorderSettingsChange({ ...borderSettings, ...updatedSettings })}
        />
      </div>

      <div className={styles.typography}>
        {Object.entries(TEXT_SECTIONS).map(([key, section]) => (
          <div key={key} className={styles.typeGroup}>
            <span className={styles.typeLabel}>{section.label}</span>
            <select
              className={styles.select}
              value={textStyles[key]?.fontId ?? section.defaultFontId}
              onChange={(e) => handleStyleChange(key, 'fontId', e.target.value)}
              aria-label={`${section.label} font`}
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              className={styles.sizeInput}
              min="0.5"
              max="8"
              step="0.1"
              value={textStyles[key]?.size ?? section.defaultSize}
              onChange={(e) => handleStyleChange(key, 'size', e.target.value)}
              aria-label={`${section.label} size`}
              title="Size (% of image width)"
            />
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        {FIELD_GROUPS.map((group) => (
          <div key={group.label} className={styles.group}>
            <span className={styles.groupLabel}>{group.label}</span>
            <div className={group.fields.length > 1 ? styles.groupFields : styles.groupFieldsSingle}>
              {group.fields.map((key) => (
                <input
                  key={key}
                  id={`meta-${key}`}
                  type="text"
                  className={styles.input}
                  value={metadata[key] != null && metadata[key] !== '' ? String(metadata[key]) : ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={fieldMap[key]}
                  aria-label={fieldMap[key]}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
