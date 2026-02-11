/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        linkedin: {
          primary: '#0A66C2',
          'primary-dark': '#004182',
          'light-gray': '#F3F2F0',
          white: '#FFFFFF',
          'text-gray': '#666666',
          'border-gray': '#E0DFDC',
        },
      },
    },
  },
  plugins: [],
}
