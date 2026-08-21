import { resolveSectionStyle } from './textStyles';
import { resolveAspectRatio, resolveMargins } from './borderSettings';

const BORDER_COLOR = '#F5F5F0';

export const BORDER_PRESETS = {
  full: {
    id: 'full',
    label: 'Full frame',
    showFilm: true,
    showExposure: true,
    showLens: true,
    sideMargin: 0.04,
    topMargin: 0.04,
    bottomBar: 0.1,
  },
  thin: {
    id: 'thin',
    label: 'Thin border',
    showFilm: false,
    showExposure: false,
    showLens: false,
    sideMargin: 0.02,
    topMargin: 0.02,
    bottomBar: 0.02,
  },
  bottomBar: {
    id: 'bottomBar',
    label: 'Bottom bar only',
    showFilm: true,
    showExposure: true,
    showLens: true,
    sideMargin: 0,
    topMargin: 0,
    bottomBar: 0.1,
  },
  noText: {
    id: 'noText',
    label: 'Border only',
    showFilm: false,
    showExposure: false,
    showLens: false,
    sideMargin: 0.04,
    topMargin: 0.04,
    bottomBar: 0.1,
  },
};

function trimText(value) {
  if (value == null) return '';
  return String(value).trim();
}

function presetShowsFilm(preset) {
  return preset.showFilm ?? preset.showBadge ?? true;
}

function setLetterSpacing(ctx, spacing) {
  if (ctx.letterSpacing !== undefined) {
    ctx.letterSpacing = `${spacing}px`;
  }
}

function drawTextLine(ctx, text, x, y, style, align) {
  if (!text) return;
  ctx.font = `${style.weight} ${style.fontSize}px ${style.fontFamily}`;
  ctx.fillStyle = '#1a1a1a';
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  setLetterSpacing(ctx, style.letterSpacing);
  ctx.fillText(text, x, y);
}

function measureTextWidth(ctx, text, style) {
  ctx.font = `${style.weight} ${style.fontSize}px ${style.fontFamily}`;
  setLetterSpacing(ctx, style.letterSpacing);
  return ctx.measureText(text).width;
}

function fitTextStyle(ctx, text, style, maxWidth) {
  const textWidth = measureTextWidth(ctx, text, style);
  if (!textWidth || textWidth <= maxWidth) return style;

  const scale = Math.max(0.5, maxWidth / textWidth);
  return {
    ...style,
    fontSize: style.fontSize * scale,
    letterSpacing: style.letterSpacing * scale,
  };
}

function drawTransformedImage(ctx, image, x, y, width, height, transform = {}) {
  const rotation = ((transform.rotation ?? 0) % 360 + 360) % 360;
  const flipX = transform.flipHorizontal ? -1 : 1;
  const flipY = transform.flipVertical ? -1 : 1;
  const quarterTurn = rotation === 90 || rotation === 270;
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const rotatedWidth = quarterTurn ? sourceHeight : sourceWidth;
  const rotatedHeight = quarterTurn ? sourceWidth : sourceHeight;
  const scale = Math.min(width / rotatedWidth, height / rotatedHeight);
  const drawWidth = rotatedWidth * scale;
  const drawHeight = rotatedHeight * scale;

  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(flipX, flipY);
  ctx.filter = transform.invert ? 'invert(1)' : 'none';
  ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  ctx.restore();
}

function drawLeftTextBlock(ctx, topLine, bottomLine, x, barTop, bottomBar, topStyle, bottomStyle) {
  const hasTop = Boolean(topLine);
  const hasBottom = Boolean(bottomLine);
  if (!hasTop && !hasBottom) return;

  const textCenterY = barTop + bottomBar / 2;

  if (hasTop && hasBottom) {
    const gap = topStyle.fontSize * 0.35;
    const blockH = topStyle.fontSize + gap + bottomStyle.fontSize;
    const topY = textCenterY - blockH / 2 + topStyle.fontSize / 2;
    const bottomY = topY + topStyle.fontSize / 2 + gap + bottomStyle.fontSize / 2;
    drawTextLine(ctx, topLine, x, topY, topStyle, 'left');
    drawTextLine(ctx, bottomLine, x, bottomY, bottomStyle, 'left');
    return;
  }

  if (hasTop) {
    drawTextLine(ctx, topLine, x, textCenterY, topStyle, 'left');
    return;
  }

  drawTextLine(ctx, bottomLine, x, textCenterY, bottomStyle, 'left');
}

export function computeCanvasDimensions(image, preset, borderSettings = {}) {
  const imgW = image.naturalWidth || image.width;
  const imgH = image.naturalHeight || image.height;
  const margins = resolveMargins(preset, borderSettings);

  const sideMargin = imgW * margins.sideMargin;
  const topMargin = imgW * margins.topMargin;
  const bottomBar = imgW * margins.bottomBar;

  let width = imgW + sideMargin * 2;
  let height = imgH + topMargin + bottomBar;
  let offsetX = 0;
  let offsetY = 0;

  const targetRatio = resolveAspectRatio(borderSettings);
  if (targetRatio) {
    const currentRatio = width / height;
    if (currentRatio > targetRatio) {
      const newHeight = width / targetRatio;
      offsetY = (newHeight - height) / 2;
      height = newHeight;
    } else if (currentRatio < targetRatio) {
      const newWidth = height * targetRatio;
      offsetX = (newWidth - width) / 2;
      width = newWidth;
    }
  }

  return {
    width,
    height,
    sideMargin,
    topMargin,
    bottomBar,
    imgW,
    imgH,
    offsetX,
    offsetY,
  };
}

export function renderFrame(canvas, image, metadata, options = {}) {
  const {
    preset = BORDER_PRESETS.full,
    textStyles = {},
    borderSettings = {},
    imageTransform = {},
  } = options;

  if (!image || !canvas) return null;

  const {
    width,
    height,
    sideMargin,
    topMargin,
    bottomBar,
    imgW,
    imgH,
    offsetX,
    offsetY,
  } = computeCanvasDimensions(image, preset, borderSettings);

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.fillStyle = BORDER_COLOR;
  ctx.fillRect(0, 0, width, height);

  const imageX = sideMargin + offsetX;
  const imageY = topMargin + offsetY;

  ctx.imageSmoothingEnabled = false;
  drawTransformedImage(ctx, image, imageX, imageY, imgW, imgH, imageTransform);

  const filmTop = trimText(metadata.filmName);
  const filmBottom = trimText(metadata.filmSub);
  const middleText = trimText(metadata.middleText);
  const exposureLine = trimText(metadata.exposureLine);
  const lensModel = trimText(metadata.lensModel);

  const showFilm = presetShowsFilm(preset) && (filmTop || filmBottom);
  const showMiddle = middleText;
  const showExposure = preset.showExposure && exposureLine;
  const showLens = preset.showLens && lensModel;

  if ((!showFilm && !showMiddle && !showExposure && !showLens) || bottomBar <= 0) return canvas;

  const barTop = imageY + imgH;
  const paddingX = sideMargin || imgW * 0.04;
  const leftTextX = paddingX + offsetX;

  const filmTopStyle = resolveSectionStyle(textStyles, 'filmTop', imgW);
  const filmBottomStyle = resolveSectionStyle(textStyles, 'filmBottom', imgW);
  const middleStyle = resolveSectionStyle(textStyles, 'middle', imgW);
  const exposureStyle = resolveSectionStyle(textStyles, 'exposure', imgW);
  const lensStyle = resolveSectionStyle(textStyles, 'lens', imgW);

  const textRightX = offsetX + imgW + paddingX;
  const leftTextWidth = showFilm
    ? Math.max(
      measureTextWidth(ctx, filmTop, filmTopStyle),
      measureTextWidth(ctx, filmBottom, filmBottomStyle),
    )
    : 0;
  const rightTextWidth = Math.max(
    showExposure ? measureTextWidth(ctx, exposureLine, exposureStyle) : 0,
    showLens ? measureTextWidth(ctx, lensModel, lensStyle) : 0,
  );
  const leftEdge = leftTextX + leftTextWidth;
  const rightEdge = showExposure || showLens
    ? textRightX - rightTextWidth
    : offsetX + width - paddingX;
  const middleGap = Math.max(0, rightEdge - leftEdge - imgW * 0.03);
  const fittedMiddleStyle = fitTextStyle(ctx, middleText, middleStyle, middleGap);

  if (showFilm) {
    drawLeftTextBlock(
      ctx,
      filmTop,
      filmBottom,
      leftTextX,
      barTop,
      bottomBar,
      filmTopStyle,
      filmBottomStyle,
    );
  }

  if (showMiddle) {
    drawTextLine(ctx, middleText, width / 2, barTop + bottomBar / 2, fittedMiddleStyle, 'center');
  }

  const hasRightBottom = showLens;
  const rightGap = exposureStyle.fontSize * 0.18 + imgW * 0.004;
  const textBlockHeight = hasRightBottom ? exposureStyle.fontSize + rightGap + lensStyle.fontSize : exposureStyle.fontSize;
  const textCenterY = barTop + bottomBar / 2;
  const exposureY = hasRightBottom ? textCenterY - textBlockHeight / 2 + exposureStyle.fontSize / 2 : textCenterY;
  const lensY = exposureY + exposureStyle.fontSize / 2 + rightGap + lensStyle.fontSize / 2;

  if (showExposure) {
    drawTextLine(ctx, exposureLine, textRightX, exposureY, exposureStyle, 'right');
  }

  if (showLens) {
    drawTextLine(ctx, lensModel, textRightX, lensY, lensStyle, 'right');
  }

  return canvas;
}

export function downloadCanvas(canvas, filename = 'photoframe.png') {
  canvasToBlob(canvas).then((blob) => {
    if (blob) downloadBlob(blob, filename);
  });
}

export function canvasToBlob(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/png');
  });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    link.remove();
  }, 1000);
}
