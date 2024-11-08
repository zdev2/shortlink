/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'sm-custom': '425px', // Custom breakpoint untuk 425px
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ]
}