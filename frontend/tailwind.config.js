/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        zoqel: {
          primary: '#1a56db',
          secondary: '#0e9f6e',
          danger: '#e02424',
          warning: '#e3a008',
          dark: '#111827',
        }
      }
    }
  },
  plugins: []
};
