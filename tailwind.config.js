/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#16423C',
          dark: '#0D2E2A',
          light: '#6EACDA',
          accent: '#E9EFEC',
        },
        gold: {
          DEFAULT: '#D97706',
          light: '#F59E0B',
        }
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
