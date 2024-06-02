/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,js,jsx}'
  ],
  theme: {
    extend: {backgroundImage: {
      'map': "url('components/img/map.png')",
      'main': "url('components/img/main.png')",
      'phone': "url('components/img/phone.png')",
    }
  },
  },
  plugins: [],
}

