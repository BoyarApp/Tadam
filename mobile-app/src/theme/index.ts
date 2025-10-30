import { colors } from './colors';
import { typography, tamilTypography, englishTypography, fontFamilies, fontSizes, lineHeights } from './typography';
import { spacing, borderRadius, iconSizes, shadows, dimensions, zIndex } from './spacing';

export const theme = {
  colors,
  typography,
  tamilTypography,
  englishTypography,
  fontFamilies,
  fontSizes,
  lineHeights,
  spacing,
  borderRadius,
  iconSizes,
  shadows,
  dimensions,
  zIndex,
} as const;

export type Theme = typeof theme;

// Re-export individual modules
export { colors } from './colors';
export { typography, tamilTypography, englishTypography, fontFamilies, fontSizes } from './typography';
export { spacing, borderRadius, iconSizes, shadows, dimensions, zIndex } from './spacing';

// Type exports
export type { ColorName } from './colors';
export type { TypographyVariant } from './typography';
export type { SpacingKey, BorderRadiusKey, IconSizeKey, ShadowKey } from './spacing';

export default theme;
