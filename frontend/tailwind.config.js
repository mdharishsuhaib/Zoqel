/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: '#F7F8FA',
        surface: '#FFFFFF',
        primary: '#101828',
        secondary: '#667085',
        muted: '#98A2B3',
        border: '#E4E7EC',
        'ai-navy': '#111827',
        'ai-violet': '#2B84EA',
        'ai-blue': '#3B82F6',
        success: '#12B76A',
        warning: '#F79009',
        danger: '#F04438',
        info: '#2E90FA',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(16, 24, 40, 0.08), 0 1px 2px rgba(16, 24, 40, 0.06)',
        'dropdown': '0 4px 6px -2px rgba(16, 24, 40, 0.03), 0 12px 16px -4px rgba(16, 24, 40, 0.08)',
        'modal': '0 8px 8px -4px rgba(16, 24, 40, 0.03), 0 20px 24px -4px rgba(16, 24, 40, 0.08)',
      },
    },
  },
  plugins: [],
};
