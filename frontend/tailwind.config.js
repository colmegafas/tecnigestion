/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3498DB',
        secondary: '#2ECC71',
        warning: '#F39C12',
        error: '#E74C3C',
        success: '#27AE60',
        purple: '#9B59B6',
      }
    },
  },
  plugins: [],
}
