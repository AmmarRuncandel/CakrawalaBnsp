/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#44A1A4",
        "primary-dark": "#2d7c7e",
        "primary-light": "#6ac3c6",
      }
    },
  },
  plugins: [],
}
