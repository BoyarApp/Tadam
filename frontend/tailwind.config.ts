import type { Config } from 'tailwindcss';

export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './app/**/*.{vue,js,ts}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Mukta Malar', 'Mukta', 'Catamaran', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#C52233',
          light: '#e05663',
          dark: '#8f1a26',
        },
        accent: '#1B75BC',
      },
    },
  },
  plugins: [],
} satisfies Config;
