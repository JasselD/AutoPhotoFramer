import exifr from 'exifr';

const PARSE_OPTIONS = {
  tiff: true,
  xmp: true,
  ifd0: true,
  exif: true,
  makerNote: true,
  mergeOutput: true,
  translateKeys: true,
  translateValues: true,
  reviveValues: true,
  sanitize: true,
  chunked: true,
};

function parseShutterSpeed(value) {
  if (value == null || value === '') return null;
  const str = String(value).trim();
  if (!str) return null;

  const fractionMatch = str.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fractionMatch) {
    return Number(fractionMatch[1]) / Number(fractionMatch[2]);
  }

  const secondsMatch = str.match(/^([\d.]+)\s*s$/i);
  if (secondsMatch) {
    return Number(secondsMatch[1]);
  }

  const num = Number(str);
  return Number.isNaN(num) ? null : num;
}

function formatShutterSpeed(exposureTime) {
  const time = parseShutterSpeed(exposureTime);
  if (time == null) return '';
  if (time >= 1) {
    const rounded = Math.round(time * 10) / 10;
    return `${rounded}s`;
  }
  const denom = Math.round(1 / time);
  return `1/${denom}`;
}

function formatFocalLength(focalLength) {
  if (focalLength == null || Number.isNaN(Number(focalLength))) return '';
  return `${Math.round(Number(focalLength))}mm`;
}

function formatAperture(fNumber) {
  if (fNumber == null || Number.isNaN(Number(fNumber))) return '';
  const rounded = Math.round(Number(fNumber) * 10) / 10;
  return `f/${rounded % 1 === 0 ? Math.round(rounded) : rounded}`;
}

function formatIso(iso) {
  if (iso == null || Number.isNaN(Number(iso))) return '';
  return `ISO ${Math.round(Number(iso))}`;
}

function pickString(...values) {
  for (const value of values) {
    if (value == null || value === '') continue;
    if (typeof value === 'object') continue;
    const str = String(value).trim();
    if (str) return str;
  }
  return '';
}

function pickNumber(...values) {
  for (const value of values) {
    if (value == null || value === '') continue;
    const num = Number(value);
    if (!Number.isNaN(num)) return num;
  }
  return null;
}

function formatLensInfo(lensInfo) {
  if (!lensInfo) return '';
  if (typeof lensInfo === 'string') return lensInfo;
  if (Array.isArray(lensInfo) && lensInfo.length >= 4) {
    const [minFocal, maxFocal, minAperture, maxAperture] = lensInfo;
    if (minFocal === maxFocal) {
      return `${minFocal}mm f/${minAperture}${maxAperture !== minAperture ? `-${maxAperture}` : ''}`;
    }
    return `${minFocal}-${maxFocal}mm f/${minAperture}-${maxAperture}`;
  }
  return '';
}

function buildExposureLine({ focalLength, fNumber, exposureTime, iso }) {
  return [formatFocalLength(focalLength), formatAperture(fNumber), formatShutterSpeed(exposureTime), formatIso(iso)]
    .filter(Boolean)
    .join(' ');
}

function mapExifToMetadata(data) {
  if (!data || typeof data !== 'object') return createEmptyMetadata();

  const focalLength = pickNumber(
    data.FocalLength,
    data.FocalLengthIn35mmFormat,
    Array.isArray(data.LensInfo) ? data.LensInfo[0] : null,
  );

  const fNumber = pickNumber(data.FNumber, data.ApertureValue && data.ApertureValue > 0 ? 2 ** (data.ApertureValue / 2) : null);

  const exposureTimeRaw = pickNumber(
    data.ExposureTime,
    data.ShutterSpeedValue != null ? 1 / 2 ** data.ShutterSpeedValue : null,
    data.CompositeImageExposureTimes,
  );

  const exposureTime = exposureTimeRaw != null ? formatShutterSpeed(exposureTimeRaw) : '';

  const iso = pickNumber(
    data.ISO,
    data.ISOSpeed,
    data.PhotographicSensitivity,
    data.StandardOutputSensitivity,
    data.RecommendedExposureIndex,
  );

  const lensModel = pickString(
    data.LensModel,
    data.Lens,
    formatLensInfo(data.LensInfo),
    data.LensSpecification && Array.isArray(data.LensSpecification)
      ? formatLensInfo(data.LensSpecification)
      : '',
  );

  return {
    cameraMake: pickString(data.Make),
    cameraModel: pickString(data.Model),
    lensModel,
    focalLength: focalLength ?? '',
    fNumber: fNumber ?? '',
    exposureTime: exposureTime ?? '',
    iso: iso ?? '',
    filmName: '',
    filmSub: '',
    middleText: '',
    exposureLine: buildExposureLine({ focalLength, fNumber, exposureTime, iso }),
  };
}

export async function parseExif(file) {
  let data = null;

  try {
    data = await exifr.parse(file, PARSE_OPTIONS);
  } catch (err) {
    console.warn('Full EXIF parse failed, retrying with defaults:', err);
  }

  if (!data || Object.keys(data).length === 0) {
    try {
      data = await exifr.parse(file);
    } catch (err) {
      console.warn('Default EXIF parse failed:', err);
    }
  }

  if (!data || Object.keys(data).length === 0) {
    try {
      data = await exifr.parse(file, [
        'Make', 'Model', 'LensModel', 'Lens', 'LensInfo',
        'FocalLength', 'FocalLengthIn35mmFormat',
        'FNumber', 'ExposureTime', 'ShutterSpeedValue',
        'ISO', 'ISOSpeed', 'PhotographicSensitivity',
        'PictureStyle', 'ColorMode', 'FilmMode',
      ]);
    } catch (err) {
      console.warn('Pick-list EXIF parse failed:', err);
    }
  }

  return mapExifToMetadata(data);
}

export function createEmptyMetadata() {
  return {
    cameraMake: '',
    cameraModel: '',
    lensModel: '',
    focalLength: '',
    fNumber: '',
    exposureTime: '',
    iso: '',
    filmName: '',
    filmSub: '',
    middleText: '',
    exposureLine: '',
  };
}

export function rebuildExposureLine(metadata) {
  const focal = metadata.focalLength === '' ? null : Number(metadata.focalLength);
  const fNum = metadata.fNumber === '' ? null : Number(metadata.fNumber);
  const exp = metadata.exposureTime === '' ? null : parseShutterSpeed(metadata.exposureTime);
  const isoVal = metadata.iso === '' ? null : Number(metadata.iso);

  return buildExposureLine({
    focalLength: focal,
    fNumber: fNum,
    exposureTime: exp,
    iso: isoVal,
  });
}

export const METADATA_FIELDS = [
  { key: 'filmName', label: 'Simulation Name (top line)', group: 'badge' },
  { key: 'filmSub', label: 'Creator (bottom line)', group: 'badge' },
  { key: 'middleText', label: 'Middle text', group: 'middle' },
  { key: 'exposureLine', label: 'Exposure line', group: 'exposure', computed: true },
  { key: 'lensModel', label: 'Lens model', group: 'lens' },
  { key: 'focalLength', label: 'Focal length (mm)', group: 'exposure' },
  { key: 'fNumber', label: 'Aperture (f-number)', group: 'exposure' },
  { key: 'exposureTime', label: 'Shutter speed (e.g. 1/1000)', group: 'exposure' },
  { key: 'iso', label: 'ISO', group: 'exposure' },
  { key: 'cameraMake', label: 'Camera make', group: 'camera' },
  { key: 'cameraModel', label: 'Camera model', group: 'camera' },
];
