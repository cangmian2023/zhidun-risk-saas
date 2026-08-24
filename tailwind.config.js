/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e6f4ff',
          100: '#bae0ff',
          200: '#8ccaff',
          300: '#59a8ff',
          400: '#2f8bff',
          500: '#1f7bff',
          600: '#1677ff',
          700: '#0f5fd6',
          800: '#0d4db0',
          900: '#0b3c85',
          950: '#072a5e',
        },
        ink: {
          900: '#0b1120',
          800: '#111a2e',
          700: '#1c2740',
        },
      },
      fontFamily: {
        sans: [
          '"PingFang SC"',
          '"Microsoft YaHei"',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(51,102,255,0.45)',
        card: '0 10px 30px -12px rgba(15,23,42,0.25)',
      },
      backgroundImage: {
        'grid-line':
          'linear-gradient(to right, rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.08) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}
