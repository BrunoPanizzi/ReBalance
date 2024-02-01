import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'
import defaultTheme from 'tailwindcss/defaultTheme'
import { DefaultColors } from 'tailwindcss/types/generated/colors'

const grays = [
  'gray',
  'zinc',
  'stone',
  'neutral',
  'slate',
  'coolGray',
  'warmGray',
  'trueGray',
  'blueGray',
  'lightBlue',
] as const

const colorsNoGrays = Object.keys(colors).reduce(
  (acc, key) => {
    // @ts-ignore
    if (!grays.includes(key)) {
      // @ts-ignore
      acc[key] = colors[key]
    }
    return acc
  },
  {} as Omit<DefaultColors, (typeof grays)[number]>,
)

/* Green gray: {
  50: '#fafafa',
  100: '#f4f5f4',
  200: '#e4e7e4',
  300: '#d4d8d4',
  400: '#a1aaa1',
  500: '#717a71',
  600: '#525b52',
  700: '#3f463f',
  800: '#272a27',
  900: '#181b18',
  950: '#090b09',
} */

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    screens: {
      xs: '435px',
      ...defaultTheme.screens,
    },

    colors: {
      gray: colors.zinc, // this is the right gray
      ...colorsNoGrays,
    },

    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        primary: {
          50: 'rgb(var(--primary-50))',
          100: 'rgb(var(--primary-100))',
          200: 'rgb(var(--primary-200))',
          300: 'rgb(var(--primary-300))',
          400: 'rgb(var(--primary-400))',
          500: 'rgb(var(--primary-500))',
          600: 'rgb(var(--primary-600))',
          700: 'rgb(var(--primary-700))',
          800: 'rgb(var(--primary-800))',
          900: 'rgb(var(--primary-900))',
          950: 'rgb(var(--primary-950))',
        },
      },

      backgroundImage: {
        squares: "url('/square.svg')",
      },

      fontFamily: {
        display: ['"Atkinson Hyperlegible"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },

      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/container-queries'),
  ],
} satisfies Config

export default config
