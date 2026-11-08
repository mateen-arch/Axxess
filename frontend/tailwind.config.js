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
        // True Blackish Charcoal / Carbon Palette (Zero Blue undertone)
        charcoal: {
          950: '#0e0e11', // Deepest background
          900: '#141417', // Main dark canvas
          850: '#1a1a1e', // Card surfaces
          800: '#212126', // Elevated panels / dropdowns
          750: '#27272d', // Interactive item hover
          700: '#2f2f36', // Borders & dividers
          600: '#3e3e47', // Hover borders
          500: '#52525e', // Muted details
        },
        // Refined Off-White / Alabaster Light Palette (Not harsh pure white)
        pearl: {
          50: '#f6f6f8',  // Soft gallery background
          100: '#efeff2', // Surface controls
          200: '#e2e2e8', // Clean borders
          300: '#d0d0d9', // Active borders
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
}
