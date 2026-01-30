import type { Config } from 'tailwindcss'

export default {
  content: [],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3C3C3B',
          50: '#F5F5F5',
          100: '#E8E8E7',
          200: '#D1D1CF',
          300: '#B9B9B7',
          400: '#A2A29F',
          500: '#8B8B87',
          600: '#74746F',
          700: '#5D5D58',
          800: '#464640',
          900: '#3C3C3B',
        },
        secondary: {
          DEFAULT: '#E4DBCB',
        },
        background: '#3C3C3B',
      },
    },
  },
  plugins: [],
} satisfies Config
