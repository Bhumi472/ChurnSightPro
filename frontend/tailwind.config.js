/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"DM Mono"', 'monospace'],
      },
      colors: {
        ink:     '#080C14',
        surface: '#0E1420',
        card:    '#131929',
        border:  '#1E2A3D',
        muted:   '#4A5568',
        dim:     '#8892A4',
        text:    '#E8EEF8',
        accent:  { DEFAULT: '#00D4FF', dark: '#0099BB' },
        emerald: { DEFAULT: '#00E5A0', dark: '#00A870' },
        amber:   { DEFAULT: '#FFB547', dark: '#CC8A1A' },
        rose:    { DEFAULT: '#FF4D6A', dark: '#CC1A37' },
      },
      boxShadow: {
        'glow-cyan':    '0 0 30px rgba(0,212,255,0.15)',
        'glow-emerald': '0 0 30px rgba(0,229,160,0.15)',
        'glow-rose':    '0 0 30px rgba(255,77,106,0.15)',
      },
    },
  },
  plugins: [],
}
