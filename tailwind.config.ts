import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(124 58 237 / <alpha-value>)',
        'primary-light': 'rgb(167 139 250 / <alpha-value>)',
        'primary-dark': 'rgb(91 33 182 / <alpha-value>)',

        secondary: 'rgb(14 165 233 / <alpha-value>)',
        'secondary-light': 'rgb(6 182 212 / <alpha-value>)',
        'secondary-dark': 'rgb(3 105 161 / <alpha-value>)',

        'background-dark': 'rgb(3 7 18 / <alpha-value>)',
        'background-light': 'rgb(15 15 30 / <alpha-value>)',
        surface: 'rgb(26 26 46 / <alpha-value>)',

        'text-primary': 'rgb(248 250 252 / <alpha-value>)',
        'text-secondary': 'rgb(203 213 225 / <alpha-value>)',
        'text-muted': 'rgb(100 116 139 / <alpha-value>)',

        success: 'rgb(16 185 129 / <alpha-value>)',
        warning: 'rgb(245 158 11 / <alpha-value>)',
        error: 'rgb(239 68 68 / <alpha-value>)',
        info: 'rgb(59 130 246 / <alpha-value>)',

        border: 'rgb(255 255 255 / 0.1)',
      },
      fontSize: {
        display: ['48px', { lineHeight: '56px', fontWeight: '700' }],
        h1: ['36px', { lineHeight: '44px', fontWeight: '700' }],
        h2: ['28px', { lineHeight: '32px', fontWeight: '700' }],
        h3: ['24px', { lineHeight: '28px', fontWeight: '600' }],
        h4: ['20px', { lineHeight: '24px', fontWeight: '600' }],
        h5: ['18px', { lineHeight: '24px', fontWeight: '600' }],
        body: ['16px', { lineHeight: '24px', fontWeight: '400' }],
        small: ['14px', { lineHeight: '20px', fontWeight: '400' }],
        tiny: ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        '3xl': '48px',
        '4xl': '64px',
      },
      borderRadius: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },
      boxShadow: {
        'elevation-1': '0 1px 2px rgb(0 0 0 / 0.05)',
        'elevation-2': '0 4px 6px rgb(0 0 0 / 0.1), 0 2px 4px rgb(0 0 0 / 0.06)',
        'elevation-3': '0 10px 15px rgb(0 0 0 / 0.1), 0 4px 6px rgb(0 0 0 / 0.05)',
        'elevation-4': '0 20px 25px rgb(0 0 0 / 0.15), 0 10px 10px rgb(0 0 0 / 0.05)',
        'glow-primary': '0 0 20px rgb(124 58 237 / 0.3), 0 0 40px rgb(124 58 237 / 0.15)',
        'glow-secondary': '0 0 20px rgb(14 165 233 / 0.3), 0 0 40px rgb(14 165 233 / 0.15)',
      },
      animation: {
        'fade-in': 'fade-in 300ms ease-out',
        'slide-up': 'slide-up 300ms ease-out',
        'slide-down': 'slide-down 300ms ease-out',
        'scale-in': 'scale-in 300ms ease-out',
        'glow-pulse': 'glow-pulse 2000ms ease-in-out infinite',
        shimmer: 'shimmer 1500ms infinite',
        float: 'float 3000ms ease-in-out infinite',
        'rotate-spin': 'rotate-spin 1000ms linear infinite',
        'gradient-shift': 'gradient-shift 6000ms ease infinite',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: {
            transform: 'translateY(20px)',
            opacity: '0',
          },
          to: {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        'slide-down': {
          from: {
            transform: 'translateY(-20px)',
            opacity: '0',
          },
          to: {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        'scale-in': {
          from: {
            transform: 'scale(0.95)',
            opacity: '0',
          },
          to: {
            transform: 'scale(1)',
            opacity: '1',
          },
        },
        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.3), 0 0 0px rgba(14, 165, 233, 0)',
          },
          '50%': {
            boxShadow: '0 0 30px rgba(124, 58, 237, 0.5), 0 0 20px rgba(14, 165, 233, 0.3)',
          },
        },
        shimmer: {
          '0%': {
            backgroundPosition: '-1000px 0',
          },
          '100%': {
            backgroundPosition: '1000px 0',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-8px)',
          },
        },
        'rotate-spin': {
          from: {
            transform: 'rotate(0deg)',
          },
          to: {
            transform: 'rotate(360deg)',
          },
        },
        'gradient-shift': {
          '0%, 100%': {
            backgroundPosition: '0% 50%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
          },
        },
      },
      transitionDuration: {
        150: '150ms',
        300: '300ms',
        500: '500ms',
        1000: '1000ms',
      },
      transitionTimingFunction: {
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
