/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Include all component files in the `src` folder
  ],
  theme: {
    extend: {
      boxShadow: {
        'text': '0 4px 6px rgba(0, 0, 0, 0.1)', // Example shadow
      },
    },
  },
  darkMode: 'class', // Enable dark mode with the 'class' strategy
  plugins: [],
};



