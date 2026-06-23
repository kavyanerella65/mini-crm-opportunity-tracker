/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1B1F3B',
          50: '#F3F4F8',
          100: '#E4E6EF',
          200: '#C2C6D9',
          300: '#9197B5',
          400: '#5C6286',
          500: '#363B5E',
          600: '#262A47',
          700: '#1B1F3B',
          800: '#12152A',
          900: '#0A0C1A',
        },
        canvas: '#F4F5F9',
        ledger: {
          DEFAULT: '#1F7A5C',
          50: '#EBF6F1',
          100: '#CFE9DD',
          400: '#2C9A75',
          600: '#1F7A5C',
          700: '#155C44',
        },
        rust: {
          DEFAULT: '#C1542D',
          50: '#FBEEE8',
          100: '#F4D3C2',
          400: '#D26A41',
          600: '#C1542D',
          700: '#9B4222',
        },
        amber: {
          DEFAULT: '#B45309',
          50: '#FDF3E4',
          100: '#FBE3BE',
          400: '#C9750F',
          600: '#B45309',
        },
        line: '#E1E4ED',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 2px 0 rgba(27, 31, 59, 0.04), 0 1px 6px -2px rgba(27, 31, 59, 0.06)',
        raised: '0 4px 14px -4px rgba(27, 31, 59, 0.18)',
      },
      borderRadius: {
        card: '0.625rem',
      },
    },
  },
  plugins: [],
};
