/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#10151F',
        'ink-soft': '#1A2130',
        surface: '#F7F5F1',
        border: '#E4E0D8',
        text: '#1B1F27',
        muted: '#6B7280',
        accent: {
          DEFAULT: '#2F6F5E',
          soft: '#E4EFEC',
        },
        risk: {
          high: '#C4432B',
          medium: '#C98A2C',
          low: '#3E7C59',
        },
      },
      fontFamily: {
        display: ['"IBM Plex Sans"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: { DEFAULT: '6px' },
    },
  },
  plugins: [],
};
