/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: '#0e0e11',
          900: '#141417',
          850: '#1a1a1e',
          800: '#212126',
          750: '#27272d',
          700: '#2f2f36',
          600: '#3e3e47',
          500: '#52525e',
        },
        pearl: {
          50: '#f6f6f8',
          100: '#efeff2',
          200: '#e2e2e8',
          300: '#d0d0d9',
        },
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
