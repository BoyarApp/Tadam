// Base spacing unit (4px)
const BASE_UNIT = 4;

// Spacing scale (4px increments)
export const spacing = {
  none: 0,
  xs: BASE_UNIT, // 4px
  sm: BASE_UNIT * 2, // 8px
  md: BASE_UNIT * 3, // 12px
  base: BASE_UNIT * 4, // 16px
  lg: BASE_UNIT * 5, // 20px
  xl: BASE_UNIT * 6, // 24px
  '2xl': BASE_UNIT * 8, // 32px
  '3xl': BASE_UNIT * 10, // 40px
  '4xl': BASE_UNIT * 12, // 48px
  '5xl': BASE_UNIT * 16, // 64px
} as const;

// Border radius
export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

// Icon sizes
export const iconSizes = {
  xs: 16,
  sm: 20,
  base: 24,
  lg: 32,
  xl: 40,
  '2xl': 48,
} as const;

// Screen padding (safe area aware)
export const screenPadding = {
  horizontal: spacing.base,
  vertical: spacing.base,
};

// Card padding
export const cardPadding = {
  horizontal: spacing.base,
  vertical: spacing.md,
};

// List item padding
export const listItemPadding = {
  horizontal: spacing.base,
  vertical: spacing.md,
};

// Button padding
export const buttonPadding = {
  horizontal: spacing.lg,
  vertical: spacing.md,
};

// Input padding
export const inputPadding = {
  horizontal: spacing.base,
  vertical: spacing.md,
};

// Common dimensions
export const dimensions = {
  // Header
  headerHeight: 56,
  headerHeightWithStatus: 88,

  // Bottom tabs
  tabBarHeight: 56,

  // Button
  buttonHeight: 48,
  buttonHeightSmall: 40,
  buttonHeightLarge: 56,

  // Input
  inputHeight: 48,
  inputHeightSmall: 40,
  inputHeightLarge: 56,

  // Avatar
  avatarSizeSmall: 32,
  avatarSizeMedium: 48,
  avatarSizeLarge: 64,
  avatarSizeXLarge: 96,

  // Card
  cardMinHeight: 120,
  feedCardHeight: 180,

  // Thumbnail
  thumbnailSmall: 60,
  thumbnailMedium: 80,
  thumbnailLarge: 120,

  // Image
  imageHeightSmall: 120,
  imageHeightMedium: 200,
  imageHeightLarge: 300,

  // Loading indicator
  loadingIndicatorSize: 40,
};

// Shadows (elevation)
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4.65,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 7.49,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 10.32,
    elevation: 12,
  },
} as const;

// Z-index layers
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
  toast: 70,
  overlay: 80,
};

export type SpacingKey = keyof typeof spacing;
export type BorderRadiusKey = keyof typeof borderRadius;
export type IconSizeKey = keyof typeof iconSizes;
export type ShadowKey = keyof typeof shadows;
