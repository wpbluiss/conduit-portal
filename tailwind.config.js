/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        conduit: {
          dark: '#0a0e1a',
          card: '#0f172a',
          border: 'rgba(100, 116, 139, 0.12)',
          cyan: '#06b6d4',
          blue: '#3b82f6',
        }
      }
    },
  },
  plugins: [],
}
