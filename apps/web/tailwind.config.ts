import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ─── Navy brand ───────────────────────────────────
        navy: {
          DEFAULT: '#0f1d35',
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          600: '#1a2d4a',
          700: '#1a4a8a',
          800: '#0f1d35',
          900: '#0a1220',
        },
        // ─── Status colors ────────────────────────────────
        status: {
          prebook:   '#0284c7',
          booked:    '#2563eb',
          confirmed: '#0d9488',
          notified:  '#d97706',
          waiting:   '#ea580c',
          engaged:   '#15803d',
          completed: '#475569',
          reschedule:'#7c3aed',
          cancel:    '#dc2626',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.04)',
        'card-md': '0 4px 12px rgba(0,0,0,.10), 0 2px 4px rgba(0,0,0,.06)',
        'card-lg': '0 10px 32px rgba(0,0,0,.12), 0 4px 8px rgba(0,0,0,.06)',
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        md: '10px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
};

export default config;
