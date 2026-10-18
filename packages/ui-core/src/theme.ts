/**
 * Design Tokens & Theme Specification
 * Palette: Sleek Slate, Crisp White & Emerald Accents
 * Cross-platform compatible (React DOM, React Native, Electron)
 */

export type ThemeMode = 'dark' | 'light';

export const palette = {
  dark: {
    canvas: '#0B0F17',
    surface: '#111827',
    surfaceSubtle: '#161F30',
    surfaceHover: '#1F2937',
    textPrimary: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    border: '#1F2937',
    borderSubtle: '#1E2638',
    borderFocus: '#10B981',
  },
  light: {
    canvas: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceSubtle: '#F1F5F9',
    surfaceHover: '#E2E8F0',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    border: '#E5E7EB',
    borderSubtle: '#F1F5F9',
    borderFocus: '#10B981',
  },
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399', // bright accent
    500: '#10B981', // base brand
    600: '#059669', // hover brand
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  status: {
    active: {
      bg: 'rgba(16, 185, 129, 0.12)',
      text: '#34D399',
      border: 'rgba(16, 185, 129, 0.28)',
      solid: '#10B981',
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.12)',
      text: '#FBBF24',
      border: 'rgba(245, 158, 11, 0.28)',
      solid: '#F59E0B',
    },
    error: {
      bg: 'rgba(244, 63, 94, 0.12)',
      text: '#FB7185',
      border: 'rgba(244, 63, 94, 0.28)',
      solid: '#F43F5E',
    },
    info: {
      bg: 'rgba(59, 130, 246, 0.12)',
      text: '#60A5FA',
      border: 'rgba(59, 130, 246, 0.28)',
      solid: '#3B82F6',
    },
  },
} as const;

export const typography = {
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', Menlo, Consolas, monospace",
  },
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const;

export const spacing = {
  px: '1px',
  0: '0px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
} as const;

export const radii = {
  none: '0px',
  sm: '4px',
  base: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px -1px rgba(0, 0, 0, 0.2)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
  emeraldGlow: '0 0 20px rgba(16, 185, 129, 0.35)',
} as const;

export interface DesignTokens {
  mode: ThemeMode;
  colors: typeof palette.dark | typeof palette.light;
  brand: typeof palette.emerald;
  status: typeof palette.status;
  typography: typeof typography;
  spacing: typeof spacing;
  radii: typeof radii;
  shadows: typeof shadows;
}

export function getTheme(mode: ThemeMode = 'dark'): DesignTokens {
  return {
    mode,
    colors: mode === 'dark' ? palette.dark : palette.light,
    brand: palette.emerald,
    status: palette.status,
    typography,
    spacing,
    radii,
    shadows,
  };
}
