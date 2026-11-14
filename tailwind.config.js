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
        aqua: {
          DEFAULT: '#69EBDA',
          50: '#f0fdfc',
          100: '#ccfbf7',
          200: '#99f7ee',
          300: '#69EBDA',
          400: '#2fd8c3',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#69EBDA',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        ocean: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          600: '#0284c7',
          900: '#0c4a6e',
        },
        aurora: {
          emerald: '#10b981',
          cyan: '#06b6d4',
          violet: '#8b5cf6',
          fuchsia: '#d946ef',
          amber: '#f59e0b',
        }
      },
      boxShadow: {
        'liquid': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'liquid-light': '0 8px 32px 0 rgba(105, 235, 218, 0.2)',
        'liquid-hover': '0 12px 40px 0 rgba(31, 38, 135, 0.25)',
        'glow-aqua': '0 0 25px -2px rgba(105, 235, 218, 0.5)',
        'glow-teal': '0 0 25px -3px rgba(105, 235, 218, 0.45)',
        'glow-cyan': '0 0 25px -3px rgba(6, 182, 212, 0.45)',
        'glow-violet': '0 0 25px -3px rgba(139, 92, 246, 0.45)',
        'inner-specular': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)',
      },
      animation: {
        'blob': 'blob 14s infinite alternate ease-in-out',
        'blob-slow': 'blob 22s infinite alternate-reverse ease-in-out',
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(40px, -60px) scale(1.15)' },
          '66%': { transform: 'translate(-30px, 30px) scale(0.92)' },
          '100%': { transform: 'translate(20px, -20px) scale(1.05)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.85', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.03)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' }
        }
      }
    },
  },
  plugins: [],
}
