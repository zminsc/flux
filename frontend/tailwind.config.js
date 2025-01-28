/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#f2eee9',
        yellow: {
          light: '#f5cd62',
          DEFAULT: '#fcee62',
        },
        coral: {
          light: '#e66455',
          DEFAULT: '#db4008',
        },
        navy: {
          light: '#4d78bc',
          DEFAULT: '#084595',
        }
      },
      fontFamily: {
        sans: ['Aileron', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 