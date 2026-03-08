/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx}', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#070B16',
        panel: 'rgba(255,255,255,0.08)',
        primary: '#43E8B2',
        secondary: '#5EA3FF',
        accent: '#FFB86B',
        danger: '#FF6A8B'
      }
    }
  },
  plugins: []
};
