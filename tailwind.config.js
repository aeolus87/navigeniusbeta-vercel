/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,js,jsx}'
  ],
  theme: {
    extend: {backgroundImage: {
      'map': "url('components/img/map.png')",
    }
  },
  },
  plugins: [],
}

