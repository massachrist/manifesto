import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Anton', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        body: ['Outfit', 'sans-serif'],
      },
      colors: {
        brand:   '#C8102E',
        amber:   '#E8961A',
        warm:    '#F0EDE8',
        surface: '#141414',
        elevate: '#1E1E1E',
        border:  '#252525',
        muted:   '#5A5A5A',
      },
    },
  },
  plugins: [],
} satisfies Config
