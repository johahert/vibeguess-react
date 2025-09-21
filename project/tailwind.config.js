/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'spotify-green': '#1DB954',
        'spotify-green-dark': '#1ed760',
        'vibeguess': {
          primary: '#1DB954',
          secondary: '#191414',
          accent: '#1ed760',
          background: '#000000',
          surface: '#121212',
          'surface-light': '#181818',
          text: '#ffffff',
          'text-muted': '#b3b3b3',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}