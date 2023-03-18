/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,svelte}'],
  theme: {
    extend: {
      fontFamily: {
        main: 'Roboto',
      },
    },
  },
  plugins: [],
};
