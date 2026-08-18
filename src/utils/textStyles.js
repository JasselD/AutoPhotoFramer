export const FONT_OPTIONS = [
  { id: 'inter', label: 'Inter', family: '"Inter", sans-serif' },
  { id: 'montserrat', label: 'Montserrat', family: '"Montserrat", sans-serif' },
  { id: 'helvetica', label: 'Helvetica Neue', family: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
  { id: 'arial', label: 'Arial', family: 'Arial, Helvetica, sans-serif' },
  { id: 'futura', label: 'Futura', family: 'Futura, "Century Gothic", "Trebuchet MS", sans-serif' },
  { id: 'system', label: 'System UI', family: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif' },
  { id: 'georgia', label: 'Georgia', family: 'Georgia, "Times New Roman", serif' },
  { id: 'courier', label: 'Courier', family: '"Courier New", Courier, monospace' },
];

export const TEXT_SECTIONS = {
  filmTop: { label: 'Film top', defaultFontId: 'inter', defaultSize: 2.2, weight: '600' },
  filmBottom: { label: 'Film bottom', defaultFontId: 'inter', defaultSize: 1.8, weight: 'normal' },
  exposure: { label: 'Exposure', defaultFontId: 'inter', defaultSize: 2.2, weight: '600' },
  lens: { label: 'Lens', defaultFontId: 'inter', defaultSize: 1.8, weight: 'normal' },
};

export function getFontFamily(fontId) {
  return FONT_OPTIONS.find((f) => f.id === fontId)?.family ?? FONT_OPTIONS[0].family;
}

export function createDefaultTextStyles() {
  return Object.fromEntries(
    Object.entries(TEXT_SECTIONS).map(([key, section]) => [
      key,
      { fontId: section.defaultFontId, size: section.defaultSize },
    ]),
  );
}

export function resolveSectionStyle(textStyles, sectionKey, imgW) {
  const section = TEXT_SECTIONS[sectionKey];
  const style = textStyles?.[sectionKey] ?? {};
  const fontId = style.fontId ?? section.defaultFontId;
  const sizePct = style.size ?? section.defaultSize;

  return {
    fontFamily: getFontFamily(fontId),
    fontSize: imgW * (sizePct / 100),
    weight: section.weight,
    letterSpacing: imgW * (sizePct / 100) * 0.06,
  };
}

export async function ensureFontsLoaded(textStyles) {
  if (!document.fonts) return;

  const families = new Set(
    Object.keys(TEXT_SECTIONS).map((key) => {
      const fontId = textStyles?.[key]?.fontId ?? TEXT_SECTIONS[key].defaultFontId;
      return getFontFamily(fontId);
    }),
  );

  await Promise.all(
    [...families].flatMap((family) => [
      document.fonts.load(`400 16px ${family}`),
      document.fonts.load(`600 16px ${family}`),
    ]),
  );
}
