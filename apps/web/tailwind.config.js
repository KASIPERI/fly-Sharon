import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    path.join(__dirname, 'index.html').replace(/\\/g, '/'),
    path.join(__dirname, 'src/**/*.{js,ts,jsx,tsx}').replace(/\\/g, '/'),
    path.resolve(__dirname, '../../packages/*/src/**/*.{js,ts,jsx,tsx}').replace(/\\/g, '/'),
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          dark: '#0B0F17',
          light: '#F8FAFC',
        },
        surface: {
          dark: '#111827',
          light: '#FFFFFF',
          subtleDark: '#161F30',
          subtleLight: '#F1F5F9',
          hoverDark: '#1F2937',
          hoverLight: '#E2E8F0',
        },
        content: {
          primaryDark: '#F9FAFB',
          primaryLight: '#0F172A',
          secondaryDark: '#9CA3AF',
          secondaryLight: '#64748B',
          muted: '#6B7280',
        },
        subdued: {
          borderDark: '#1F2937',
          borderLight: '#E5E7EB',
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
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
          info: '#3B82F6',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'emerald-glow': '0 0 24px rgba(16, 185, 129, 0.25)',
        'rose-glow': '0 0 24px rgba(244, 63, 94, 0.25)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
      },
      keyframes: {
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
};
