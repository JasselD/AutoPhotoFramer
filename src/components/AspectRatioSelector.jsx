import { useState } from 'react';
import { ASPECT_RATIO_PRESETS, formatAspectRatio, ratioStringToDecimal, decimalToRatioString } from '../utils/borderSettings';
import styles from './AspectRatioSelector.module.css';

export default function AspectRatioSelector({
  aspectRatio,
  aspectRatioAuto,
  onChange,
}) {
  const [customRatio, setCustomRatio] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handlePresetClick = (preset) => {
    if (preset.id === 'auto') {
      onChange({ aspectRatioAuto: true, aspectRatio: 1 });
      setShowCustom(false);
    } else {
      onChange({ aspectRatioAuto: false, aspectRatio: preset.ratio });
      setShowCustom(false);
    }
  };

  const handleCustomChange = (e) => {
    const value = e.target.value;
    setCustomRatio(value);
    
    const ratio = ratioStringToDecimal(value);
    if (ratio && ratio > 0) {
      onChange({ aspectRatioAuto: false, aspectRatio: ratio });
    }
  };

  const handleShowCustom = () => {
    setShowCustom(!showCustom);
    if (!showCustom) {
      setCustomRatio(decimalToRatioString(aspectRatio));
    }
  };

  const displayValue = aspectRatioAuto ? 'Auto' : formatAspectRatio(aspectRatio);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>Aspect ratio</span>
        <span className={styles.value}>{displayValue}</span>
      </div>

      <div className={styles.presets}>
        {ASPECT_RATIO_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={`${styles.presetBtn} ${
              preset.id === 'auto' ? (aspectRatioAuto ? styles.active : '') : 
              (!aspectRatioAuto && Math.abs(aspectRatio - preset.ratio) < 0.01 ? styles.active : '')
            }`}
            onClick={() => handlePresetClick(preset)}
            title={preset.label}
          >
            {preset.label.split(' ')[0]}
          </button>
        ))}
        <button
          type="button"
          className={`${styles.customBtn} ${showCustom ? styles.active : ''}`}
          onClick={handleShowCustom}
          title="Custom aspect ratio"
        >
          Custom
        </button>
      </div>

      {showCustom && (
        <div className={styles.customInput}>
          <input
            type="text"
            value={customRatio}
            onChange={handleCustomChange}
            placeholder="e.g., 4:3"
            aria-label="Custom aspect ratio"
          />
          <span className={styles.hint}>Enter as ratio (4:3, 16:9) or decimal (1.5)</span>
        </div>
      )}
    </div>
  );
}
