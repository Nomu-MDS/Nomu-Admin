import type { Config } from 'tailwindcss'

export default {
  content: [],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0E224A',
          dark: '#07172e',
          light: '#162d61',
        },
        blue: {
          DEFAULT: '#465E8A',
          light: '#5a74a0',
          dark: '#354a6e',
        },
        cream: '#E4DBCB',
        coral: '#FF6A57',
        // Aliases sémantiques
        background: '#E4DBCB',  // fond crème (page)
        card: '#FFFFFF',        // fond des panneaux/cards
        sidebar: '#07172e',     // sidebar sombre
        primary: {
          DEFAULT: '#465E8A',
          50:  '#edf0f7',
          100: '#d1d9ec',
          200: '#a3b3d9',
          300: '#758dc6',
          400: '#5a74a0',
          500: '#465E8A',
          600: '#3a4f74',
          700: '#2f3f5d',
          800: '#162d61',
          900: '#0E224A',
        },
        secondary: {
          DEFAULT: '#E4DBCB',
        },
      },
      fontFamily: {
        sans:  ['Poppins', 'system-ui', 'sans-serif'],
        roca:  ['roca', 'Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
