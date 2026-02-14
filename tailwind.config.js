/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1F7A3E',
          soft: '#E8F7EF',
          deep: '#14532D',
        },
        secondary: {
          DEFAULT: '#2CA58D',
          soft: '#E6F7F3',
          deep: '#1E7A68',
        },
        accent: {
          DEFAULT: '#E76F51',
          soft: '#FCE8E2',
          deep: '#A9442A',
        },
      },
      fontFamily: {
        gmarket: ['GmarketSans', 'Pretendard Variable', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
