import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F7F2EC',
        ink: '#2A1C13',
        cocoa: '#5A3A29',
        tape: '#E6D8C7',
        muted: '#8A6A50',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      maxWidth: {
        content: '1120px',
        prose: '560px',
      },
      borderRadius: {
        DEFAULT: '8px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(42, 28, 19, 0.04), 0 4px 12px rgba(42, 28, 19, 0.04)',
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
    },
  },
  plugins: [],
};

export default config;
