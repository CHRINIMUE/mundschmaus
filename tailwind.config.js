/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./_layouts/**/*.html",
    "./_includes/**/*.html",
    "./*.html",
    "./*.md",
    "./_recipes/*.md",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#F53200",
      },
      boxShadow: {
        "3xl": "0 0px 60px -15px rgba(0, 0, 0, 0.5)",
      },
      fontFamily: {
        gelica: ["gelica", "sans-serif"],
        inter: ["inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
