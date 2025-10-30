export const colors = {
  // Primary Colors (Tadam Branding)
  primary: '#C52233',
  primaryDark: '#9A1B2A',
  primaryLight: '#E63946',

  // Background
  background: '#0F172A', // Slate 900
  surface: '#1E293B', // Slate 800
  surfaceVariant: '#334155', // Slate 700

  // Text
  textPrimary: '#F1F5F9', // Slate 100
  textSecondary: '#94A3B8', // Slate 400
  textTertiary: '#64748B', // Slate 500
  textDisabled: '#475569', // Slate 600

  // Status Colors
  success: '#10B981', // Green 500
  successLight: '#D1FAE5', // Green 100
  error: '#EF4444', // Red 500
  errorLight: '#FEE2E2', // Red 100
  warning: '#F59E0B', // Amber 500
  warningLight: '#FEF3C7', // Amber 100
  info: '#3B82F6', // Blue 500
  infoLight: '#DBEAFE', // Blue 100

  // Accent
  accent: '#F59E0B', // Amber for highlights
  accentLight: '#FCD34D',

  // UI Elements
  border: '#334155', // Slate 700
  divider: '#1E293B', // Slate 800
  overlay: 'rgba(15, 23, 42, 0.9)',
  backdrop: 'rgba(0, 0, 0, 0.5)',

  // Semantic Colors
  link: '#60A5FA', // Blue 400
  liked: '#EC4899', // Pink 500
  bookmarked: '#FBBF24', // Amber 400

  // Card Shadows
  shadowLight: 'rgba(0, 0, 0, 0.1)',
  shadow: 'rgba(0, 0, 0, 0.25)',
  shadowDark: 'rgba(0, 0, 0, 0.4)',

  // Transparent variants
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',

  // Shimmer for loading states
  shimmerBase: '#1E293B',
  shimmerHighlight: '#334155',
};

export type ColorName = keyof typeof colors;
