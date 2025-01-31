import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          light: '#f2eee9',
        },
        yellow: {
          DEFAULT: '#f5cd62',
        },
        coral: {
          light: '#fc8862',
          DEFAULT: '#e66455',
          dark: '#db4008',
        },
        navy: {
          light: '#4d78bc',
          DEFAULT: '#084595',
        },
      },
    },
  },
  plugins: [],
}

export default config
