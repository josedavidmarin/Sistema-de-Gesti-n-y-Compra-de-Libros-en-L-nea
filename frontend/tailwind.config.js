/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['"Bebas Neue"', '"Inter"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        nike: {
          ink: '#111111',
          canvas: '#ffffff',
          cloud: '#f5f5f5',
          charcoal: '#39393b',
          ash: '#4b4b4d',
          mute: '#707072',
          stone: '#9e9ea0',
          hairline: '#cacacb',
          'hairline-soft': '#e5e5e5',
          sale: '#d30005',
          'sale-deep': '#780700',
          success: '#007d48',
          'success-bright': '#1eaa52',
          info: '#1151ff',
          'info-deep': '#0034e3',
        },
      },
      boxShadow: {
        'inset-hairline': 'inset 0 -1px 0 #e5e5e5',
        'search-focus': '0 0 0 12px #f5f5f5',
      },
    },
  },
  plugins: [],
}
