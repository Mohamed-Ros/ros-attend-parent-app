/** @type {import('tailwindcss').Config} */
// Design tokens. Identity = deep green + gold (unchanged from the original app).
// Screens must use these semantic names, never raw hex or slate/emerald palette classes.
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F3F6F4', // app background (cool mint-grey)
        surface: '#FFFFFF', // cards
        sunken: '#E9EFEC', // inset areas, tracks
        line: { DEFAULT: '#DCE5E0', strong: '#C3D0C9' },
        ink: { DEFAULT: '#0F1F1C', 2: '#4B5F59', 3: '#7C8F89' },
        brand: { DEFAULT: '#16423C', pressed: '#0D2E2A', soft: '#E9EFEC', ink: '#0D2E2A', light: '#6EACDA' },
        gold: { DEFAULT: '#D97706', deep: '#B45309', soft: '#FEF1D0' },
        success: { DEFAULT: '#047857', soft: '#DDF3E9' },
        warning: { DEFAULT: '#B45309', soft: '#FEF3C7', ink: '#7A3A06' },
        danger: { DEFAULT: '#BE123C', soft: '#FFE7EC', ink: '#7A1230' },
        info: { DEFAULT: '#2A6496', soft: '#DCEBF8', ink: '#14385C' },
      },
      fontFamily: { sans: ['Cairo', 'system-ui', 'sans-serif'] },
      fontSize: {
        hero: ['2.75rem', { lineHeight: '1', fontWeight: '700' }],
        display: ['1.75rem', { lineHeight: '2.25rem', fontWeight: '700' }],
        title: ['1.0625rem', { lineHeight: '1.5rem', fontWeight: '700' }],
        body: ['0.875rem', { lineHeight: '1.375rem' }],
        meta: ['0.8125rem', { lineHeight: '1.25rem' }],
        caption: ['0.75rem', { lineHeight: '1rem' }],
      },
      borderRadius: { card: '20px', control: '12px', tile: '14px' },
      boxShadow: {
        sheet: '0 -8px 32px rgba(15,31,28,0.14)',
        card: '0 8px 24px -10px rgba(22,66,60,0.22)',
        nav: '0 10px 30px -6px rgba(15,31,28,0.25)',
      },
    },
  },
  plugins: [],
};
