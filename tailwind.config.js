/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#f7f1e8',
        oat: '#efe2d1',
        clay: '#c97b63',
        honey: '#f0b45a',
        moss: '#728c69',
        bark: '#5f4633',
        blush: '#e7b8a5',
      },
      boxShadow: {
        card: '0 18px 45px rgba(95, 70, 51, 0.12)',
        float: '0 28px 60px rgba(95, 70, 51, 0.16)',
      },
      fontFamily: {
        display: ['"Averia Serif Libre"', 'serif'],
        body: ['"Nunito Sans"', 'sans-serif'],
      },
      backgroundImage: {
        stitches:
          'radial-gradient(circle at 1px 1px, rgba(95, 70, 51, 0.12) 1px, transparent 0)',
      },
      keyframes: {
        bob: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        bob: 'bob 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
