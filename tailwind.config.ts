import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Vector palette — institutional terminal
        bg: {
          DEFAULT: '#07080b',
          panel: '#0e1015',
          elevated: '#11131a',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.06)',
          strong: 'rgba(255,255,255,0.1)',
        },
        fg: {
          DEFAULT: '#f8fafc',
          dim: '#cbd5e1',
          mute: '#94a3b8',
        },
        bull: {
          DEFAULT: '#00e5a8',
          dim: 'rgba(0,229,168,0.15)',
        },
        bear: {
          DEFAULT: '#ff5470',
          dim: 'rgba(255,84,112,0.15)',
        },
        brand: {
          cyan: '#00d4ff',
          amber: '#ffb547',
          violet: '#9d6bff',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-ui)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.3)' },
        },
        'flash-up': {
          '0%': { color: '#00e5a8' },
          '100%': { color: '#e8ebf2' },
        },
        'flash-down': {
          '0%': { color: '#ff5470' },
          '100%': { color: '#e8ebf2' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease',
        'pulse-dot': 'pulse-dot 2s infinite',
        'flash-up': 'flash-up 0.4s ease',
        'flash-down': 'flash-down 0.4s ease',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
