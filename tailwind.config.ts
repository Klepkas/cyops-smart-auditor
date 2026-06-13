import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';

/**
 * Tailwind CSS configuration for the Smart Contract Auditor.
 *
 * The design system is a single, dark-first theme. Tokens are deliberately
 * grouped by role (`brand`, `surface`, `text`, `risk`) so components never
 * reach for raw hex values.
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx,html}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Indigo→violet scale used for primary actions, focus rings,
        // active-nav indicators, and the topbar brand.
        brand: {
          50: '#eef0ff',
          100: '#dde1ff',
          200: '#bcc4ff',
          300: '#9aa6ff',
          400: '#7c8aff',
          500: '#6366f1', // base
          600: '#5457dc',
          700: '#4447b3',
          800: '#33358a',
          900: '#1f1f5e',
        },
        // Background layers (page → panel → elevated → overlay).
        surface: {
          DEFAULT: '#0b0d12', // page background
          panel: '#11141b',   // cards, sidebar
          elevated: '#1a1f2b', // hovered panels, modals
          muted: '#222837',   // inputs, code blocks
        },
        // Text scale.
        text: {
          primary: '#e6e8ef',
          secondary: '#c5c9d4',
          muted: '#9aa3b2',
          subtle: '#6b7384',
        },
        // Border + divider tones derived from surface.
        border: {
          subtle: '#1f2532',
          DEFAULT: '#2a3142',
          strong: '#3a4256',
        },
        // Risk / severity scale — used by the audit report, table rows,
        // and badges. Mirrors the CSS custom properties in `src/index.css`.
        risk: {
          critical: '#ef4444',
          medium: '#f59e0b',
          low: '#22c55e',
          info: '#3b82f6',
        },
      },
      fontFamily: {
        // Used site-wide for UI copy.
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        // Reserved for the Solidity editor and inline code.
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      fontSize: {
        // Add a slightly tighter display scale for the topbar / hero.
        'display-lg': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '600' }],
        'display-md': ['1.75rem', { lineHeight: '2rem', fontWeight: '600' }],
      },
      boxShadow: {
        panel: '0 1px 0 rgba(255, 255, 255, 0.04) inset, 0 8px 24px rgba(0, 0, 0, 0.32)',
        focus: '0 0 0 2px rgba(99, 102, 241, 0.6)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(2px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 160ms ease-out',
        'pulse-soft': 'pulse-soft 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [forms],
};

export default config;
