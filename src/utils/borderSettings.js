export const ASPECT_RATIO_PRESETS = [
  { id: 'auto', label: 'Auto', ratio: null },
  { id: '1:1', label: '1:1 (Square)', ratio: 1 },
  { id: '4:3', label: '4:3 (Classic)', ratio: 4 / 3 },
  { id: '3:2', label: '3:2 (Film)', ratio: 3 / 2 },
  { id: '16:9', label: '16:9 (Widescreen)', ratio: 16 / 9 },
  { id: '9:16', label: '9:16 (Portrait)', ratio: 9 / 16 },
];

export function createDefaultBorderSettings() {
  return {
    borderScale: 100,
    aspectRatioAuto: true,
    aspectRatio: 1,
  };
}

export function sliderToAspectRatio(sliderValue) {
  return Math.round(sliderValue) / 100;
}

export function aspectRatioToSlider(ratio) {
  return Math.round(ratio * 100);
}

export function formatAspectRatio(ratio) {
  if (!ratio || ratio <= 0) return 'Auto';
  if (Math.abs(ratio - 1) < 0.02) return '1:1';
  if (ratio > 1) return `${ratio.toFixed(2)}:1`;
  return `1:${(1 / ratio).toFixed(2)}`;
}

export function ratioStringToDecimal(ratioStr) {
  if (!ratioStr) return null;
  const parts = ratioStr.trim().split(':').map(Number);
  if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) {
    return parts[0] / parts[1];
  }
  const single = Number(ratioStr);
  if (!isNaN(single) && single > 0) {
    return single;
  }
  return null;
}

export function decimalToRatioString(ratio) {
  if (!ratio || ratio <= 0) return '';
  if (Math.abs(ratio - 1) < 0.01) return '1:1';
  if (ratio > 1) {
    const rounded = Math.round(ratio * 100) / 100;
    return `${rounded}:1`;
  }
  const inv = 1 / ratio;
  const rounded = Math.round(inv * 100) / 100;
  return `1:${rounded}`;
}

export function resolveMargins(preset, borderSettings) {
  const scale = (borderSettings?.borderScale ?? 100) / 100;
  return {
    sideMargin: preset.sideMargin * scale,
    topMargin: preset.topMargin * scale,
    bottomBar: preset.bottomBar * scale,
  };
}

export function resolveAspectRatio(borderSettings) {
  if (borderSettings?.aspectRatioAuto !== false) return null;
  const ratio = borderSettings?.aspectRatio;
  return ratio && ratio > 0 ? ratio : null;
}
